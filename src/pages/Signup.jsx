import React, { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ChevronRight, Shield } from "lucide-react";
import Turnstile from "react-turnstile";
import { supabase } from "../lib/supabase";
import { LOGO_URL, THEME_HEX } from "../shared/constants";

/* strength meter */
function scorePassword(pw = "") {
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (/[A-Z]/.test(pw)) s += 1;
  if (/[a-z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  return Math.min(4, s);
}

/* Background */
function NoirBg() {
  return (
    <>
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(1200px_800px_at_80%_-20%,rgba(255,255,255,0.08),rgba(0,0,0,0)),radial-gradient(1000px_600px_at_10%_20%,rgba(255,255,255,0.06),rgba(0,0,0,0))]" />
      <div
        className="fixed inset-0 -z-10 opacity-[.06] pointer-events-none"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22 viewBox=%220 0 160 160%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22160%22 height=%22160%22 filter=%22url(%23n)%22 opacity=%220.35%22/></svg>')",
        }}
      />
    </>
  );
}

export default function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showC, setShowC] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Turnstile
  const [token, setToken] = useState(null);
  const [captchaReady, setCaptchaReady] = useState(false);
  const tsRef = useRef(null);
  const SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY || "").trim(); // required in prod

  const score = useMemo(() => scorePassword(pw), [pw]);
  const scoreLabel = ["Very weak", "Weak", "Okay", "Good", "Strong"][score];

  async function verifyCaptcha(tok) {
    const r = await fetch("/api/turnstile-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: tok }),
    });
    return r.ok;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (name.trim().length < 2) return setErr("Please enter your full name.");
    if (!/\S+@\S+\.\S+/.test(email)) return setErr("Enter a valid email.");
    if (pw.length < 8) return setErr("Use at least 8 characters.");
    if (pw !== cpw) return setErr("Passwords do not match.");
    if (!SITE_KEY) return setErr("Captcha site key missing. Set VITE_TURNSTILE_SITE_KEY.");
    if (!token) return setErr("Please complete the captcha.");

    setLoading(true);
    try {
      const ok = await verifyCaptcha(token);
      if (!ok) throw new Error("Captcha verification failed.");

      const { error } = await supabase.auth.signUp({
        email,
        password: pw,
        options: {
          data: { full_name: name },
          // Set your site URL in Supabase Auth settings for email confirmations
          emailRedirectTo: window.location.origin + "/login",
        },
      });
      if (error) throw new Error(error.message || "Sign up failed.");

      // (Optional) Inform user to verify email
      nav("/login", { state: { from: "/assistance", msg: "Check your inbox to verify your email, then sign in." } });
    } catch (e2) {
      setErr(e2.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] text-white relative grid place-items-center px-4">
      <NoirBg />
      {/* glows */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 0.7, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pointer-events-none fixed -top-24 -left-24 w-80 h-80 rounded-full blur-3xl"
        style={{ background: THEME_HEX }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.6, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="pointer-events-none fixed -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl"
        style={{ background: THEME_HEX }}
      />

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 16 }}
        className="w-full max-w-md rounded-2xl border border-white/12 bg-white/5 backdrop-blur p-5 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Noir" className="h-9 w-9 object-contain" />
          <div className="font-semibold text-lg tracking-wide">Create your Noir account</div>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div className="text-sm text-white/70">
            Join Noir MUN and manage your registrations with ease.
          </div>

        {err && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2"
          >
            {err}
          </motion.div>
        )}

          <label className="block">
            <div className="text-xs mb-1 text-white/70">Full name</div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/12 rounded-xl px-3 py-2 focus-within:border-white/25 transition-colors">
              <User size={16} className="opacity-80" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                className="w-full bg-transparent outline-none text-sm"
                autoComplete="name"
              />
            </div>
          </label>

          <label className="block">
            <div className="text-xs mb-1 text-white/70">Email</div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/12 rounded-xl px-3 py-2 focus-within:border-white/25 transition-colors">
              <Mail size={16} className="opacity-80" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full bg-transparent outline-none text-sm"
                autoComplete="email"
              />
            </div>
          </label>

          <label className="block">
            <div className="text-xs mb-1 text-white/70">Password</div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/12 rounded-xl px-3 py-2 focus-within:border-white/25 transition-colors">
              <Lock size={16} className="opacity-80" />
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-transparent outline-none text-sm"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="opacity-80 hover:opacity-100"
                aria-label="Toggle visibility"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* strength */}
            <div className="mt-1">
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(score / 4) * 100}%`,
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,.9), rgba(255,255,255,.25))",
                  }}
                />
              </div>
              <div className="text-[11px] text-white/60 mt-1 flex items-center gap-1">
                <Shield size={12} /> {scoreLabel}
              </div>
            </div>
          </label>

          <label className="block">
            <div className="text-xs mb-1 text-white/70">Confirm password</div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/12 rounded-xl px-3 py-2 focus-within:border-white/25 transition-colors">
              <Lock size={16} className="opacity-80" />
              <input
                type={showC ? "text" : "password"}
                value={cpw}
                onChange={(e) => setCpw(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-transparent outline-none text-sm"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowC((v) => !v)}
                className="opacity-80 hover:opacity-100"
                aria-label="Toggle visibility"
              >
                {showC ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {/* Turnstile captcha */}
          <div className="rounded-xl border border-white/12 bg-white/5 p-3">
            {!SITE_KEY ? (
              <div className="text-xs text-red-300">
                Set <code>VITE_TURNSTILE_SITE_KEY</code> to render the captcha.
              </div>
            ) : (
              <Turnstile
                ref={tsRef}
                sitekey={SITE_KEY}
                options={{ theme: "dark", size: "normal", retry: "auto" }}
                onLoad={() => setCaptchaReady(true)}
                onVerify={(tok) => {
                  setToken(tok);
                  setErr("");
                }}
                onExpire={() => setToken(null)}
                onError={() => setErr("Captcha error — please retry.")}
              />
            )}
          </div>

          <motion.button
            whileHover={{ y: -1 }} whileTap={{ y: 0 }}
            type="submit" disabled={loading}
            className="w-full mt-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 px-4 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating…" : "Create Account"} <ChevronRight size={16} />
          </motion.button>

          <div className="text-xs text-white/70 text-center mt-1">
            Already have an account? <Link to="/login" className="underline">Sign in</Link>
          </div>
        </form>
      </motion.div>

      <style>{`::selection{ background: rgba(255,255,255,.22); }`}</style>
    </div>
  );
}
