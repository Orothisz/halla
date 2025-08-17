// turnstileClient.js
// Usage:
//   import { initTurnstile, verifyTurnstileToken } from "./turnstileClient";
//   await initTurnstile(); // on page load
//   const ok = await verifyTurnstileToken({ verifyUrl: "/api/turnstile-verify", action: "register_submit" });

export async function initTurnstile() {
  // Ensure Turnstile script loaded once (if not using data-auto-render)
  if (window.turnstile) return;
  await new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

function getWidgetContainer() {
  return document.querySelector("[data-turnstile-container]") || null;
}

function ensureWidget(siteKey, opts = {}) {
  // If you use an invisible widget, render programmatically:
  // <div id="cf-ts" data-turnstile-container></div>
  // For visible widget, you can still re-render here on demand.
  const el = getWidgetContainer();
  if (!el) return null;

  // re-render if no widgetId or container empty
  if (!el.__widgetId || !window.turnstile?.getResponse(el.__widgetId)) {
    if (el.__widgetId) window.turnstile.remove(el.__widgetId);
    el.innerHTML = "";
    el.__widgetId = window.turnstile.render(el, {
      sitekey: siteKey,
      size: opts.size || "invisible",      // or "flexible" / "normal"
      action: opts.action || "generic",
      callback: () => {},                  // we’ll execute manually
      "error-callback": () => {},
      "timeout-callback": () => {},
      "expired-callback": () => {},
    });
  }
  return el.__widgetId;
}

async function executeToken(widgetId) {
  // force new token every time
  try {
    await window.turnstile.execute(widgetId);
  } catch {}
  // read token from the widget
  const token = window.turnstile.getResponse(widgetId);
  return token || null;
}

export async function verifyTurnstileToken({
  verifyUrl = "/api/turnstile-verify",
  siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY,
  action = "generic",
  extraPayload = {},        // add your form fields here (email, etc.)
  headers = {},             // custom headers
}) {
  if (!window.turnstile) await initTurnstile();
  const wid = ensureWidget(siteKey, { action });

  // 1st attempt: fresh token
  let token = await executeToken(wid);
  if (!token) {
    // Try one more time if token didn't generate (rare)
    await new Promise(r => setTimeout(r, 100));
    token = await executeToken(wid);
  }
  if (!token) throw new Error("Could not acquire Turnstile token");

  const attempt = async (tok) => {
    const res = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ token: tok, ...extraPayload }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  };

  // Try
  let { ok, data } = await attempt(token);

  // Auto-repair path: refresh token & retry once
  if (!ok && data?.repair) {
    if (data.repair.resetWidget && wid) {
      window.turnstile.remove(wid);
      ensureWidget(siteKey, { action });
    } else {
      // otherwise just reset token lifecycle
      window.turnstile.reset(wid);
    }

    const fresh = await executeToken(wid);
    if (fresh) {
      ({ ok, data } = await attempt(fresh));
    }
  }

  // If still not ok, bubble up specific reason so UI can instruct the user
  if (!ok) {
    const codes = data?.codes || [];
    const msg =
      data?.error ||
      (codes.length ? `Captcha failed: ${codes.join(", ")}` : "Captcha verification failed");
    const err = new Error(msg);
    err.codes = codes;
    err.meta = data?.meta || {};
    throw err;
  }

  return data; // { success: true, meta: ... }
}
