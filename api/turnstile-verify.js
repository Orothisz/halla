// /api/turnstile-verify.js
// Vercel Node Serverless Function (ESM or CJS via default export)
// Features:
// - CORS + OPTIONS
// - Multi-origin allowlist (exact hosts, wildcards like *.noirmun.com, and localhost)
// - JSON + x-www-form-urlencoded body parsing
// - Accepts token from: token | cf-turnstile-response | cfTurnstileResponse
// - Auto-retry once on transient errors (timeout-or-duplicate, internal-error, connection-failure)
// - Tolerant pinning (EXPECT_HOSTNAME / EXPECT_ACTION with soft or hard enforcement)
// - Returns actionable 'repair' hints to the client

const TRANSIENT_ERRORS = new Set([
  "timeout-or-duplicate",
  "internal-error",
  "connection-failure",
  "network-failure",
]);

// --- origin allow helper (supports comma list, wildcards, http(s), ports) ---
function parseAllowlist(envVal = "") {
  return envVal
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.replace(/\/$/, ""));
}

// matches `https://app.noirmun.com` against `*.noirmun.com`
function originMatches(pattern, origin) {
  if (!pattern) return false;
  try {
    const p = new URL(pattern);
    const o = new URL(origin);
    // exact scheme + host (and optional port)
    if (!pattern.includes("*")) {
      return p.protocol === o.protocol && p.host === o.host;
    }
    // wildcard only on hostname part
    const hostPat = p.host;
    const [sub, ...rest] = hostPat.split(".");
    if (sub !== "*" || rest.length < 2) return false;
    const domain = rest.join(".");
    return p.protocol === o.protocol && o.host.endsWith(`.${domain}`);
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin, allowlist) {
  if (!allowlist.length) return true; // no restriction
  if (!origin) return false;
  const norm = origin.replace(/\/$/, "");
  // allow exact + wildcard + localhost convenience
  for (const pat of allowlist) {
    if (originMatches(pat, norm)) return true;
    if (pat === norm) return true;
    if (pat === "http://localhost" && norm.startsWith("http://localhost")) return true;
    if (pat === "http://127.0.0.1" && norm.startsWith("http://127.0.0.1")) return true;
  }
  return false;
}

async function readRawBody(req) {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const raw = await readRawBody(req).catch(() => null);
  if (!raw) return {};
  const ct = (req.headers["content-type"] || "").toLowerCase();
  if (ct.includes("application/json")) {
    try { return JSON.parse(raw.toString("utf8")); } catch { return {}; }
  }
  if (ct.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(raw.toString("utf8"));
    return Object.fromEntries(params.entries());
  }
  // last resort try urlencoded parse
  try {
    const params = new URLSearchParams(raw.toString("utf8"));
    return Object.fromEntries(params.entries());
  } catch {
    return {};
  }
}

async function verifyWithTurnstile({ secret, token, remoteip }) {
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token, ...(remoteip ? { remoteip } : {}) }),
  });
  const data = await r.json();
  return data;
}

export default async function handler(req, res) {
  // ------- CORS ------
  const allowlist = parseAllowlist(process.env.ALLOWED_ORIGIN || "");
  const origin = (req.headers.origin || "").replace(/\/$/, "");
  const allowed = isAllowedOrigin(origin, allowlist);

  res.setHeader("Vary", "Origin");
  if (allowed && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
  }

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!allowed) return res.status(403).json({ success: false, error: "Forbidden origin" });

  try {
    const body = await parseBody(req);
    const token = body?.token || body?.["cf-turnstile-response"] || body?.cfTurnstileResponse || null;
    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Missing token",
        repair: { refreshToken: true },
      });
    }

    const secret = process.env.CF_TURNSTILE_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, error: "Missing CF_TURNSTILE_SECRET" });
    }

    const remoteip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || undefined;

    // ---- First attempt
    let data = await verifyWithTurnstile({ secret, token, remoteip });

    // ---- Auto-retry once for transient errors
    const codes = data["error-codes"] || [];
    if (!data.success && codes.some(c => TRANSIENT_ERRORS.has(c))) {
      // small jitter
      await new Promise(r => setTimeout(r, 150));
      data = await verifyWithTurnstile({ secret, token, remoteip });
    }

    // ---- Optional tolerant pinning
    const expectedHost = process.env.EXPECT_HOSTNAME || "";
    const expectedAction = process.env.EXPECT_ACTION || "";
    const tolerance = (process.env.PIN_TOLERANT || "true").toLowerCase() !== "false"; // default true

    if (data.success) {
      if (expectedHost && data.hostname !== expectedHost) {
        if (!tolerance) {
          return res.status(401).json({
            success: false,
            error: "Hostname mismatch",
            meta: { hostname: data.hostname, expectedHost },
          });
        }
      }
      if (expectedAction && data.action !== expectedAction) {
        if (!tolerance) {
          return res.status(401).json({
            success: false,
            error: "Action mismatch",
            meta: { action: data.action, expectedAction },
          });
        }
      }
    }

    // ---- Degraded mode (emergency only)
    const degraded = (process.env.DEGRADED_MODE || "false").toLowerCase() === "true";

    if (!data.success) {
      const codes2 = data["error-codes"] || [];

      // Map to actionable client hints
      const repair = {
        refreshToken: codes2.includes("timeout-or-duplicate") || codes2.includes("invalid-input-response"),
        // suggest silent widget reset for token lifecycle issues
        resetWidget: codes2.includes("invalid-input-response"),
        // ask client to re-run turnstile.execute if using invisible/badge
        reexecute: true,
      };

      if (degraded && !codes2.includes("invalid-input-secret")) {
        // Soft-pass under *explicit* degraded mode flag.
        return res.status(200).json({
          success: true,
          degraded: true,
          warning: "DEGRADED_MODE active — passed with warnings",
          meta: {
            hostname: data.hostname,
            action: data.action,
            codes: codes2,
          },
        });
      }

      return res.status(401).json({
        success: false,
        error: "Captcha failed",
        codes: codes2,
        meta: {
          hostname: data.hostname,
          action: data.action,
          challenge_ts: data.challenge_ts,
        },
        repair,
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      meta: {
        hostname: data.hostname,
        action: data.action,
        challenge_ts: data.challenge_ts,
      },
    });
  } catch (e) {
    // Never leak secrets; provide client-side recovery instructions
    return res.status(500).json({
      success: false,
      error: "Verification error",
      repair: { reexecute: true, refreshToken: true },
    });
  }
}
