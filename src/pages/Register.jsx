// src/pages/Register.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  CloudUpload,
  FileImage,
  Loader2,
  Shield,
  X,
  Info,
  ExternalLink,
  Image as ImageIcon,
  Sparkles,
  Crown,
  Copy,
  Check,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { LOGO_URL, THEME_HEX, COMMITTEES } from "../shared/constants";

/* ---------------- ENV (Vite) ---------------- */
const REGISTER_API_URL = import.meta.env.VITE_REGISTER_API_URL;
const REGISTER_API_KEY = import.meta.env.VITE_REGISTER_API_KEY;

/* ---------------- Helpers ------------------- */
const cls = (...xs) => xs.filter(Boolean).join(" ");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]{8,}$/;

function Gilded({ children }) {
  return (
    <span
      className="bg-clip-text text-transparent"
      style={{
        backgroundImage:
          "linear-gradient(90deg, #FFF7C4 0%, #F8E08E 15%, #E6C769 35%, #F2DA97 50%, #CDAE57 65%, #F5E6B9 85%, #E9D27F 100%)",
      }}
    >
      {children}
    </span>
  );
}
function NoirCard({ children, className }) {
  return (
    <section
      className={cls(
        "rounded-[28px] border border-white/12 bg-white/[0.045] backdrop-blur-md ring-1 ring-white/5",
        className
      )}
    >
      {children}
    </section>
  );
}
function Field({ label, required, hint, error, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-white/90">
          {label} {required && <span className="text-white/60">*</span>}
        </label>
        {hint && <span className="text-[11px] text-white/60">{hint}</span>}
      </div>
      {children}
      {error && (
        <div className="flex items-center gap-1 text-[12px] text-red-300/90">
          <Info size={14} /> {error}
        </div>
      )}
    </div>
  );
}
function Input(props) {
  return (
    <input
      {...props}
      className={cls(
        "w-full rounded-xl bg-white/10 text-white placeholder-white/60",
        "px-3 py-2 outline-none border border-white/15 focus:border-white/30"
      )}
    />
  );
}
function Select({ options, ...rest }) {
  return (
    <select
      {...rest}
      className={cls(
        "w-full rounded-xl bg-white/10 text-white",
        "px-3 py-2 outline-none border border-white/15 focus:border-white/30 appearance-none"
      )}
      style={{
        WebkitTextFillColor: "white",
        backgroundImage:
          "linear-gradient(45deg, transparent 50%, rgba(255,255,255,.6) 50%), linear-gradient(135deg, rgba(255,255,255,.6) 50%, transparent 50%), linear-gradient(to right, transparent, transparent)",
        backgroundPosition:
          "calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px), 100% 0",
        backgroundSize: "5px 5px, 5px 5px, 2.5em 2.5em",
        backgroundRepeat: "no-repeat",
      }}
    >
      <option value="">Select…</option>
      {options.map((o) => (
        <option key={o} value={o} style={{ color: "#000" }}>
          {o}
        </option>
      ))}
    </select>
  );
}
function Textarea(props) {
  return (
    <textarea
      {...props}
      rows={4}
      className={cls(
        "w-full rounded-xl bg-white/10 text-white placeholder-white/60",
        "px-3 py-2 outline-none border border-white/15 focus:border-white/30"
      )}
    />
  );
}
async function fileToBase64(file) {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/* ---------------- Auth & Cloud Draft ---------------- */
function useSupabaseAuth() {
  const [session, setSession] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => setSession(s));
    return () => sub?.subscription?.unsubscribe();
  }, []);
  return { session, user: session?.user ?? null };
}
async function loadCloudDraft(user_id) {
  const { data, error } = await supabase
    .from("registration_drafts")
    .select("data")
    .eq("user_id", user_id)
    .single();
  if (error) return null;
  return data?.data ?? null;
}
async function saveCloudDraft(user_id, dataObj) {
  await supabase
    .from("registration_drafts")
    .upsert({ user_id, data: dataObj, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
}

/* ---------------- Local Draft ---------------- */
const DRAFT_KEY = "noir_registration_draft_v2";

/* ---------------- Page ---------------- */
export default function Register() {
  const { user } = useSupabaseAuth();
  const loggedIn = !!user;

  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [showLoginNudge, setShowLoginNudge] = useState(false);
  const [copied, setCopied] = useState(false);

  const [f, setF] = useState(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    return (
      (saved && JSON.parse(saved)) || {
        fullName: "",
        email: "",
        emailAddress: "",
        whatsappNumber: "",
        altContact: "",
        age: "",
        institution: "",
        munExperience: "",
        grade: "",
        committeePref1: "",
        portfolio1a: "",
        portfolio1b: "",
        committeePref2: "",
        portfolio2a: "",
        portfolio2b: "",
        iplCoDelegate: "",
        questions: "",
        reference: "",
        paymentOption: "UPI: kheragautam16@okaxis",
        paymentFile: null,
        paymentPreview: "",
      }
    );
  });

  const [err, setErr] = useState({});
  const committees = useMemo(() => COMMITTEES.map((c) => c.name), []);

  useEffect(() => {
    document.documentElement.style.setProperty("--theme", THEME_HEX);
    document.body.style.background = "#000018";
  }, []);
  useEffect(() => {
    if (!loggedIn) {
      const t = setTimeout(() => setShowLoginNudge(true), 1200);
      return () => clearTimeout(t);
    }
  }, [loggedIn]);

  // hydrate cloud draft on login
  useEffect(() => {
    (async () => {
      if (!loggedIn) return;
      const cloud = await loadCloudDraft(user.id);
      if (cloud) {
        const local = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
        const merged = { ...(local || {}), ...cloud };
        setF(merged);
        localStorage.setItem(DRAFT_KEY, JSON.stringify(merged));
      } else {
        const local = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
        if (local) await saveCloudDraft(user.id, local);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  // debounced autosave
  const saveTimer = useRef(null);
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      localStorage.setItem(DRAFT_KEY, JSON.stringify(f));
      if (loggedIn) {
        try { await saveCloudDraft(user.id, f); } catch {}
      }
      setSaving(false);
      setSavedAt(new Date());
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [f, loggedIn, user?.id]);

  const update = (patch) => setF((s) => ({ ...s, ...patch }));

  const handleFile = async (file) => {
    if (!file) return update({ paymentFile: null, paymentPreview: "" });
    if (!file.type.startsWith("image/")) {
      return setToast({ type: "error", text: "Please upload an image file (JPG/PNG/WEBP)." });
    }
    if (file.size > 7 * 1024 * 1024) {
      return setToast({ type: "error", text: "Max file size 7 MB. Please compress and try again." });
    }
    const url = URL.createObjectURL(file);
    update({ paymentFile: file, paymentPreview: url });
  };

  const validate = () => {
    const e = {};
    if (!f.fullName.trim()) e.fullName = "Full name is required.";
    if (!EMAIL_RE.test(f.email)) e.email = "Valid email is required.";
    if (!PHONE_RE.test(f.whatsappNumber || "")) e.whatsappNumber = "Valid WhatsApp number required.";
    if (!f.committeePref1) e.committeePref1 = "Select your first committee preference.";
    if ((f.committeePref1 === "IPL" || f.committeePref2 === "IPL") && !f.iplCoDelegate.trim()) {
      e.iplCoDelegate = "For IPL, co-delegate details are required.";
    }
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!REGISTER_API_URL) {
      setToast({ type: "error", text: "Missing VITE_REGISTER_API_URL in .env" });
      return;
    }
    if (!validate()) {
      setToast({ type: "error", text: "Fix the highlighted fields." });
      return;
    }
    setBusy(true);
    try {
      const payload = {
        fullName: f.fullName,
        email: f.email,
        emailAddress: f.emailAddress || f.email,
        whatsappNumber: f.whatsappNumber,
        altContact: f.altContact,
        age: f.age,
        institution: f.institution,
        munExperience: f.munExperience,
        grade: f.grade,
        committeePref1: f.committeePref1,
        portfolio1a: f.portfolio1a,
        portfolio1b: f.portfolio1b,
        committeePref2: f.committeePref2,
        portfolio2a: f.portfolio2a,
        portfolio2b: f.portfolio2b,
        iplCoDelegate: f.iplCoDelegate,
        questions: f.questions,
        reference: f.reference,
        paymentOption: f.paymentOption,
        paymentProofLink: "",
      };

      if (f.paymentFile) {
        payload.paymentScreenshot = {
          filename: f.paymentFile.name,
          mimeType: f.paymentFile.type || "image/jpeg",
          base64: await fileToBase64(f.paymentFile),
        };
      }

      const res = await fetch(REGISTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(REGISTER_API_KEY ? { "X-API-KEY": REGISTER_API_KEY } : {}),
        },
        body: JSON.stringify(payload),
      });

      // parse robustly; if CORS/HTML page, this throws
      let json = null;
      try {
        json = await res.json();
      } catch {
        throw new Error("Network/CORS error. Check Apps Script deployment & CORS headers.");
      }

      if (!json?.ok) {
        // success with duplicate returns {ok:false, duplicate:true} in our script
        if (json?.duplicate) {
          setToast({ type: "ok", text: "Looks like you already submitted recently. We’ve recorded your entry." });
        } else {
          throw new Error(json?.error || "Server rejected submission.");
        }
      } else {
        setToast({ type: "ok", text: "Registration submitted. Check your email for updates!" });
      }
      setF((prev) => ({ ...prev, paymentFile: null, paymentPreview: "" }));
    } catch (e) {
      setToast({ type: "error", text: e.message || "Something went wrong." });
    } finally {
      setBusy(false);
    }
  };

  const matrixHref =
    "https://docs.google.com/spreadsheets/d/1TpOtx8yuidK4N1baPSh1t7efjQeY0_B1wz24yVl3UI8/edit?usp=sharing";
  const upiPrimary = "kheragautam16@okaxis";
  const upiAlt = "9811588050@ptyes";
  const qrURL = "https://i.postimg.cc/FK1VQQC7/Untitled-design-8.png";

  const copyUPI = async (v) => {
    try {
      await navigator.clipboard.writeText(v);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <div
      className="min-h-screen text-white relative"
      style={{
        background:
          "radial-gradient(1200px 800px at 80% -10%, rgba(255,255,255,.12), rgba(0,0,0,0)), radial-gradient(900px 700px at 12% 20%, rgba(255,255,255,.10), rgba(0,0,0,0)), #000018",
      }}
    >
      {/* faint film grain for depth */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 .9'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23n)' /></svg>\")",
        }}
      />

      {/* header */}
      <header className="sticky top-0 z-30 bg-gradient-to-b from-[#000026]/60 to-transparent backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-shrink-0" style={{ whiteSpace: "nowrap" }}>
            <img src={LOGO_URL} alt="Noir" className="h-9 w-9 object-contain" />
            <span className="font-semibold tracking-wide">Noir MUN</span>
          </div>
          <div className="text-xs text-white/70">
            {saving ? "Saving…" : savedAt ? `Saved ${savedAt.toLocaleTimeString()}` : "Autosave ready"}
          </div>
        </div>
      </header>

      {/* main */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Prologue */}
        <section className="relative isolate overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur">
          <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-white/10 blur-3xl rounded-full" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-white/10 blur-3xl rounded-full" />
          <div className="relative z-10 px-6 md:px-10 pt-10 pb-12">
            <div className="flex items-start gap-4">
              <div className="shrink-0 grid place-items-center w-12 h-12 rounded-2xl bg-white/10 border border-white/15">
                <Crown />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  <Gilded>Prologue — Your Docket Awaits</Gilded>
                </h1>
                <p className="mt-2 text-white/80">
                  In marble and laurel, discipline meets rhetoric. Step forward and inscribe your name.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={matrixHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-4 py-2 text-white border border-white/15 text-sm"
                    title="Portfolio Matrix (reference only)"
                  >
                    Portfolio Matrix <ExternalLink size={14} />
                  </a>
                  {!loggedIn && (
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-4 py-2 text-white border border-white/15 text-sm"
                    >
                      Log in to save progress <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chapter I — Identity */}
        <NoirCard className="p-6 md:p-8 mt-8">
          <div className="text-sm uppercase tracking-[0.25em] text-white/60">Chapter I</div>
          <h2 className="mt-1 text-2xl md:text-3xl font-extrabold"><Gilded>Identity & Coordinates</Gilded></h2>
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <Field label="Full Name" required error={err.fullName}>
                <Input value={f.fullName} onChange={(e) => update({ fullName: e.target.value })} placeholder="Your full name" />
              </Field>
              <Field label="Email" required error={err.email}>
                <Input type="email" value={f.email} onChange={(e) => update({ email: e.target.value })} placeholder="e.g., you@example.com" />
              </Field>
              <Field label="Email Address (alt)" hint="If different from primary email">
                <Input type="email" value={f.emailAddress} onChange={(e) => update({ emailAddress: e.target.value })} placeholder="Optional alternate email" />
              </Field>
              <Field label="WhatsApp Number" required error={err.whatsappNumber}>
                <Input value={f.whatsappNumber} onChange={(e) => update({ whatsappNumber: e.target.value })} placeholder="+91 9XXXXXXXXX" />
              </Field>
              <Field label="Alternate Contact Number">
                <Input value={f.altContact} onChange={(e) => update({ altContact: e.target.value })} placeholder="Optional" />
              </Field>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Age (in numerals)">
                  <Input type="number" value={f.age} onChange={(e) => update({ age: e.target.value })} placeholder="e.g., 17" />
                </Field>
                <Field label="Grade (in numerals)">
                  <Input type="number" value={f.grade} onChange={(e) => update({ grade: e.target.value })} placeholder="e.g., 12" />
                </Field>
              </div>
              <Field label="Institution">
                <Input value={f.institution} onChange={(e) => update({ institution: e.target.value })} placeholder="School/College" />
              </Field>
              <Field label="MUN Experience (number)">
                <Input type="number" value={f.munExperience} onChange={(e) => update({ munExperience: e.target.value })} placeholder="e.g., 5" />
              </Field>
            </div>
          </div>
        </NoirCard>

        {/* Chapter II — Preferences */}
        <NoirCard className="p-6 md:p-8 mt-8">
          <div className="text-sm uppercase tracking-[0.25em] text-white/60">Chapter II</div>
          <h2 className="mt-1 text-2xl md:text-3xl font-extrabold"><Gilded>Council Preferences</Gilded></h2>
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <Field label="Committee Preference 1" required error={err.committeePref1}>
                <Select value={f.committeePref1} onChange={(e) => update({ committeePref1: e.target.value })} options={committees} />
              </Field>
              <Field label="Portfolio Preference 1">
                <Input value={f.portfolio1a} onChange={(e) => update({ portfolio1a: e.target.value })} placeholder="Your top portfolio" />
              </Field>
              <Field label="Portfolio Preference 2">
                <Input value={f.portfolio1b} onChange={(e) => update({ portfolio1b: e.target.value })} placeholder="Alternate portfolio" />
              </Field>
            </div>
            <div className="space-y-5">
              <Field label="Committee Preference 2">
                <Select value={f.committeePref2} onChange={(e) => update({ committeePref2: e.target.value })} options={committees} />
              </Field>
              <Field label="Portfolio Preference 1 (Pref 2)">
                <Input value={f.portfolio2a} onChange={(e) => update({ portfolio2a: e.target.value })} placeholder="Portfolio for 2nd choice" />
              </Field>
              <Field label="Portfolio Preference 2 (Pref 2)">
                <Input value={f.portfolio2b} onChange={(e) => update({ portfolio2b: e.target.value })} placeholder="Alternate for 2nd choice" />
              </Field>
              {(f.committeePref1 === "IPL" || f.committeePref2 === "IPL") && (
                <Field label="Co-Delegate Details (IPL only)" required error={err.iplCoDelegate} hint="Name, email, phone — required for double delegation">
                  <Textarea value={f.iplCoDelegate} onChange={(e) => update({ iplCoDelegate: e.target.value })} placeholder="Enter co-delegate details" />
                </Field>
              )}
            </div>
          </div>
          <div className="mt-5">
            <Field label="Any questions">
              <Textarea value={f.questions} onChange={(e) => update({ questions: e.target.value })} placeholder="Ask us anything…" />
            </Field>
            <Field label="Reference (if any)">
              <Input value={f.reference} onChange={(e) => update({ reference: e.target.value })} placeholder="Name/phone/invite code" />
            </Field>
          </div>
        </NoirCard>

        {/* Chapter III — Tribute */}
        <NoirCard className="p-6 md:p-8 mt-8">
          <div className="text-sm uppercase tracking-[0.25em] text-white/60">Chapter III</div>
          <h2 className="mt-1 text-2xl md:text-3xl font-extrabold"><Gilded>Tribute & Proof</Gilded></h2>
          <p className="mt-2 text-sm text-white/70">
            Early Bird: <b>₹2,000</b> per delegate. IPL: <b>₹2,000</b> per delegate. Pay via UPI <span className="opacity-80">{upiPrimary}</span> or bank details given in form.
          </p>

          <div className="grid lg:grid-cols-[1fr_280px] gap-6 mt-4">
            <div className="space-y-4">
              <Field label="Payment Option">
                <Select
                  value={f.paymentOption}
                  onChange={(e) => update({ paymentOption: e.target.value })}
                  options={[`UPI: ${upiPrimary}`, `UPI: ${upiAlt}`, "Bank Transfer: JSFB0004049 (A/C 4049010060672314)"]}
                />
              </Field>

              <div className="flex gap-2 flex-wrap">
                <button onClick={() => copyUPI(upiPrimary)} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-3 py-2 text-sm">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  Copy {upiPrimary}
                </button>
                <button onClick={() => copyUPI(upiAlt)} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-3 py-2 text-sm">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  Copy {upiAlt}
                </button>
              </div>

              <Field label="Upload Payment Screenshot" hint="JPG/PNG/WEBP (max 7 MB)">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 cursor-pointer hover:bg-white/20">
                    <CloudUpload size={16} />
                    Choose file
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                  </label>
                  {f.paymentFile && <span className="text-sm text-white/80 truncate">{f.paymentFile.name}</span>}
                </div>
              </Field>

              <div className="rounded-xl border border-white/15 bg-white/5 p-2 grid place-items-center">
                {f.paymentPreview ? (
                  <img src={f.paymentPreview} alt="Payment preview" className="max-h-40 rounded-lg object-contain" />
                ) : (
                  <div className="text-white/60 text-sm flex flex-col items-center py-6">
                    <FileImage className="mb-2" />
                    Preview will appear here
                  </div>
                )}
              </div>
            </div>

            {/* QR card */}
            <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-3">
              <div className="text-center text-sm text-white/80">Scan UPI QR</div>
              <img src={"https://i.postimg.cc/FK1VQQC7/Untitled-design-8.png"} alt="UPI QR" className="mt-2 w-full h-[240px] object-contain rounded-xl bg-black/20" loading="lazy" decoding="async" />
              <div className="mt-3 text-[12px] text-white/60 text-center">
                After paying, upload your screenshot here. We store it in Drive and your Sheet gets the link.
              </div>
            </div>
          </div>
        </NoirCard>

        {/* Chapter IV — Oath */}
        <NoirCard className="p-6 md:p-8 mt-8">
          <div className="text-sm uppercase tracking-[0.25em] text-white/60">Chapter IV</div>
          <h2 className="mt-1 text-2xl md:text-3xl font-extrabold"><Gilded>The Oath</Gilded></h2>
          <p className="mt-2 text-white/80">Two days. One stage. Bring your discipline, your design, your diplomacy.</p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button
              onClick={submit}
              disabled={busy}
              className={cls(
                "inline-flex items-center gap-2 rounded-2xl px-5 py-3 border",
                "border-white/20 bg-white/15 hover:bg-white/25 text-white",
                busy && "opacity-60 cursor-not-allowed"
              )}
            >
              {busy ? <Loader2 className="animate-spin" size={18} /> : <Crown size={18} />}
              {busy ? "Submitting…" : "Submit Registration"}
            </button>
            <button
              onClick={async () => {
                localStorage.setItem(DRAFT_KEY, JSON.stringify(f));
                if (loggedIn) await saveCloudDraft(user.id, f);
                setToast({ type: "ok", text: "Draft saved." });
              }}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 border border-white/20 bg-white/10 hover:bg-white/20 text-white"
            >
              Save Draft
            </button>
            <Link to="/assistance" className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 border border-white/20 bg-white/10 hover:bg-white/20 text-white">
              Need help? <ChevronRight size={16} />
            </Link>
          </div>
        </NoirCard>
      </main>

      {/* disclaimer bar */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] sm:w-auto">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur px-4 py-2 text-[12px] text-white/80 text-center shadow-[0_20px_60px_rgba(0,0,0,.35)]">
          By registering and viewing this website you agree to{" "}
          <a href="https://noirmun.com/legal" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-white">
            noirmun.com/legal
          </a>
          .
        </div>
      </div>

      {/* login nudge */}
      <AnimatePresence>
        {!loggedIn && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="fixed bottom-20 right-5 z-40 w-[calc(100%-2.5rem)] max-w-sm">
            <div className="rounded-2xl border border-white/15 bg-white/[0.10] backdrop-blur p-3 text-sm text-white/90 shadow-xl">
              <div className="flex items-start gap-2">
                <ImageIcon size={16} className="opacity-80" />
                <div className="flex-1">
                  <div className="font-semibold">Save your progress</div>
                  <div className="text-white/70">Log in to sync drafts across devices and resume later.</div>
                </div>
                <button className="p-1 hover:opacity-70" onClick={() => setShowLoginNudge(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <Link to="/login" className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 bg-white/15 border border-white/20 hover:bg-white/25">
                  Log in <ChevronRight size={14} />
                </Link>
                <Link to="/signup" className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 bg-white/10 border border-white/20 hover:bg-white/20">
                  Sign up
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} className="fixed bottom-3 right-3 z-50">
            <div
              className={cls(
                "rounded-xl px-3 py-2 border backdrop-blur text-sm flex items-center gap-2",
                toast.type === "ok" ? "bg-emerald-400/15 border-emerald-300/30 text-emerald-100" : "bg-red-400/15 border-red-300/30 text-red-100"
              )}
            >
              {toast.type === "ok" ? <CheckCircle2 size={16} /> : <Info size={16} />}
              <span>{toast.text}</span>
              <button onClick={() => setToast(null)} className="ml-1 opacity-70 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`:root { --theme: ${THEME_HEX}; }`}</style>
    </div>
  );
}
