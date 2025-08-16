// api/turnstile-verify.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ success: false, error: "Missing token" });

    const allowed = process.env.ALLOWED_ORIGIN; // optional
    const origin = req.headers.origin;
    if (allowed && origin && origin !== allowed) {
      return res.status(403).json({ success: false, error: "Forbidden origin" });
    }

    const secret = process.env.CF_TURNSTILE_SECRET;
    if (!secret) return res.status(500).json({ success: false, error: "Missing CF_TURNSTILE_SECRET" });

    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });

    const data = await r.json();
    if (!data.success) {
      return res.status(401).json({ success: false, error: "Captcha failed", details: data["error-codes"] });
    }
    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ success: false, error: "Verification error" });
  }
}
