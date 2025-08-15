// src/pages/login.js — Noir Login with Turnstile + Supabase
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, LogIn, ShieldCheck, Shield, Sparkles } from "lucide-react";
import Turnstile from "react-turnstile";
import { supabase } from "../lib/supabase";

const BRAND = {
  name: "Noir MUN",
  Logo: ({ className = "h-6 w-6" }) => (
    <svg viewBox="0 0 72 72" className={className} aria-hidden>
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="64" height="64" rx="14" fill="url(#g)" opacity="0.25" />
      <path d="M20 50V22h6l18 21.2V22h8v28h-6L28 28.6V50h-8z" fill="url(#g)" stroke="url(#g)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
};

// Safe env read
function getEnv(key) {
  try {
    // @ts-ignore
    const vite = (import.meta && import.meta.env) ? import.meta.env : undefined;
    const v = (vite?.[key] || (typeof window !== "undefined" && window.__ENV__?.[key]) || (typeof process !== "undefined" && process.env?.[key]) || "").toString();
    return v;
  } catch {
    return "";
  }
}

export default function Login() {
  const SITE_KEY = (getEnv("VITE_TURNSTILE_SITE_KEY") || "").trim(); // require your real site key
  const rawMode = (getEnv("VITE_TURNSTILE_MODE") || "managed").toLowerCase();
  const CAPTCHA_MODE = rawMode === "invisible" ? "invisible" : "managed";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agree, setAgree] = useState(true);
  const [token, setToken] = useState(null);
  const [captchaReady, setCaptchaReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const turnstileRef = useRef(null);

  const prefersReducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    if (!SITE_KEY) console.warn("Set VITE_TURNSTILE_SITE_KEY to your widget's Site key.");
  }, [SITE_KEY]);

  useEffect(() => {
    if (CAPTCHA_MODE === "invisible" && captchaReady) {
      try { turnstileRef.current?.reset?.(); } catch {}
    }
  }, [CAPTCHA_MODE, captchaReady]);

  async function verifyCaptcha(tok) {
    const r = await fetch("/api/turnstile-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: tok }),
    });
    return r.ok;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!SITE_KEY) { setError("Captcha site key missing. Set VITE_TURNSTILE_SITE_KEY."); return; }
    if (!agree) { setError("Please accept the terms to continue."); return; }

    setSubmitting(true);

    const doLogin = async () => {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      setSubmitting(false);
      if (authError) {
        setError(authError.message || "Sign-in failed");
      } else {
        // redirect as you prefer:
        window.location.assign("/");
      }
    };

    if (CAPTCHA_MODE === "invisible") {
      try {
        // onVerify will run and continue
        turnstileRef.current?.execute?.();
      } catch {
        setSubmitting(false);
        setError("Captcha failed to execute. Please retry.");
      }
    } else {
      if (!token) { setSubmitting(false); setError("Please complete the captcha."); return; }
      const ok = await verifyCaptcha(token);
      if (!ok) { setSubmitting(false); setError("Captcha verification failed."); return; }
      await doLogin();
    }
  }

  /* UI */
  const Blob = ({ className = "" }) => (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute blur-3xl opacity-50 ${className}`}
      initial={prefersReducedMotion ? {} : { scale: 0.92, opacity: 0.35 }}
      animate={prefersReducedMotion ? {} : { scale: 1.06, opacity: 0.6 }}
      transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }}
      style={{ background: "radial-gradient(45% 60% at 50% 50%, rgba(99,102,241,0.55), rgba(236,72,153,0.25) 60%, transparent 70%)" }}
    />
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[radial-gradient(1200px_800px_at_80%_-10%,rgba(99,102,241,0.14),transparent),radial-gradient(1000px_600px_at_0%_110%,rgba(236,72,153,0.12),transparent)] text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:36px_36px] opacity-20" />
      <Blob className="top-[-10%] right-[-10%] w-[60vw] h-[60vh]" />
      <Blob className="bottom-[-20%] left-[-10%] w-[55vw] h-[55vh]" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 backdrop-blur border border-white/20 shadow-md">
            <BRAND.Logo className="h-6 w-6" />
          </div>
          <div className="font-semibold tracking-tight text-white/90">{BRAND.name}</div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-sm">
          <Shield className="h-4 w-4 opacity-70" />
          <span className="opacity-70">Protected with Cloudflare Turnstile</span>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[80vh] w-full max-w-7xl place-items-center px-6 pb-16">
        <motion.div
          initial={prefersReducedMotion ? {} : { y: 20, opacity: 0 }}
          animate={prefersReducedMotion ? {} : { y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full overflow-hidden rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_50%_10%,rgba(59,130,246,0.15),transparent)]" />
              <div className="relative h-full p-10">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Bot-resistant login</span>
                    </div>
                    <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight">
                      Welcome back
                      <span className="block text-white/70 text-base font-normal mt-2">Sign in to manage registrations, committees & more.</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {["99.99% Uptime", "Privacy-first", "1-tap Social"].map((t, i) => (
                      <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">{t}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative p-6 sm:p-10">
              <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-5">
                <div className="flex items-center gap-2 text-sm">
                  <div className="grid h-8 w-8 place-items-center rounded-lg border border-white/15 bg-white/10">
                    <LogIn className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Sign in to your account</span>
                </div>

                <div>
                  <label htmlFor="email" className="text-sm opacity-90">Email</label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3 py-2 focus-within:border-white/40">
                    <Mail className="h-4 w-4 opacity-60" />
                    <input id="email" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent outline-none placeholder:text-white/40" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm opacity-90">Password</label>
                    <a className="text-xs opacity-70 underline-offset-2 hover:underline" href="#">Forgot?</a>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-3 py-2 focus-within:border-white/40">
                    <Lock className="h-4 w-4 opacity-60" />
                    <input id="password" type={showPass ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent outline-none placeholder:text-white/40" />
                    <button type="button" aria-label={showPass ? "Hide password" : "Show password"} onClick={() => setShowPass((s) => !s)} className="rounded-lg p-1.5 text-white/70 hover:bg-white/10">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer select-none items-center gap-2 text-sm opacity-90">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="h-4 w-4 rounded border-white/30 bg-transparent accent-white" />
                  <span>I agree to the <a className="underline underline-offset-2" href="#">Terms</a> & <a className="underline underline-offset-2" href="#">Privacy</a></span>
                </label>

                <div className="rounded-2xl border border-white/15 bg-white/5 p-3" data-testid="captcha-box">
                  {!SITE_KEY ? (
                    <p className="text-sm text-red-300">Set <code>VITE_TURNSTILE_SITE_KEY</code> to render the captcha.</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs opacity-80">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Protected by Cloudflare Turnstile ({CAPTCHA_MODE})</span>
                      </div>
                      <Turnstile
                        ref={turnstileRef}
                        sitekey={SITE_KEY}
                        options={{ theme: "dark", size: CAPTCHA_MODE === "invisible" ? "invisible" : "normal", retry: "auto" }}
                        onLoad={() => setCaptchaReady(true)}
                        onVerify={async (tok) => {
                          setToken(tok);
                          setError(null);
                          if (CAPTCHA_MODE === "invisible") {
                            const ok = await verifyCaptcha(tok);
                            if (!ok) { setSubmitting(false); setError("Captcha verification failed."); return; }
                            // After invisible verify, proceed directly:
                            const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
                            setSubmitting(false);
                            if (authError) setError(authError.message || "Sign-in failed");
                            else window.location.assign("/");
                          }
                        }}
                        onExpire={() => setToken(null)}
                        onError={() => setError("Captcha error — please retry.")}
                      />
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200" data-testid="error-box">
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={submitting || !agree || (CAPTCHA_MODE === "managed" && !token)}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-medium tracking-tight text-white transition hover:border-white/40 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>{submitting ? "Signing in…" : "Sign in"}</span>
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </button>

                <div className="text-center text-sm opacity-80">
                  New here? <a href="#" className="underline underline-offset-2">Create an account</a>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 pb-10 text-xs text-white/60">
        <span>© {new Date().getFullYear()} Noir MUN</span>
        <a href="https://instagram.com/sameerjhambb" target="_blank" rel="noreferrer" className="underline underline-offset-2">Built with ♥ by Sameer</a>
      </footer>
    </div>
  );
}
