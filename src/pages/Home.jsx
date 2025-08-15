// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, ChevronRight, X, Send, MessageCircle, Menu } from "lucide-react";

import {
  LOGO_URL,
  REGISTER_URL,
  DATES_TEXT,
  TARGET_DATE_IST,
  THEME_HEX,
  COMMITTEES,
  WHATSAPP_ESCALATE,
} from "../shared/constants";

/* --------------------------------------------------
 * Staff Directory (for WILT Mini lookups)
 * -------------------------------------------------- */
const STAFF = {
  "sameer jhamb": "Founder",
  "maahir gulati": "Co-Founder",
  "gautam khera": "President",
  "daanesh narang": "Chief Advisor",
  "daanish narang": "Chief Advisor",
  "vishesh kumar": "Junior Advisor",
  "jhalak batra": "Secretary General",
  "anushka dua": "Director General",
  "mahi choudharie": "Deputy Director General",
  "namya negi": "Deputy Secretary General",
  "shambhavi sharma": "Vice President",
  "shubh dahiya": "Executive Director",
  "nimay gupta": "Deputy Executive Director",
  "gauri khatter": "Charge D'Affaires",
  "garima": "Conference Director",
  "madhav sadana": "Conference Director",
  "shreyas kalra": "Chef D Cabinet",
};

// Normalize helpers
function norm(s = "") {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}
function titleCase(s = "") {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Build reverse map Role → [names]
const ROLE_TO_NAMES = Object.entries(STAFF).reduce((acc, [name, role]) => {
  const k = norm(role);
  (acc[k] ||= []).push(name);
  return acc;
}, {});

// Role synonyms to improve recall
const ROLE_SYNONYMS = {
  ed: "executive director",
  "executive director": "executive director",
  "deputy ed": "deputy executive director",
  "deputy executive director": "deputy executive director",
  cofounder: "co-founder",
  "co founder": "co-founder",
  "co-founder": "co-founder",
  sg: "secretary general",
  "sec gen": "secretary general",
  dg: "director general",
  vps: "vice president",
  vp: "vice president",
  pres: "president",
  president: "president",
  "junior advisor": "junior advisor",
  "chief advisor": "chief advisor",
  "charge d affaires": "charge d'affaires",
  "charge d' affaires": "charge d'affaires",
  "charge d'affaires": "charge d'affaires",
  "chef d cabinet": "chef d cabinet",
  "conference director": "conference director",
  founder: "founder",
  "co-founder": "co-founder",
};

// Special override: “Who is the ED?” → Nimay Gupta
function specialEDIntercept(q) {
  const isWho = /\bwho(\s+is|'?s)?\b/.test(q);
  const mentionsED = /(\bthe\s+)?\bed\b|executive\s+director/.test(q);
  if (isWho && mentionsED) return "Nimay Gupta — Deputy Executive Director (ED)";
  return null;
}

/* ---------- Atmosphere (subtle starfield) ---------- */
function Atmosphere() {
  const star = useRef(null);
  useEffect(() => {
    const c = star.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let w = (c.width = innerWidth),
      h = (c.height = innerHeight);
    const pts = Array.from({ length: 120 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      v: Math.random() * 0.35 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,.4)";
      pts.forEach((p) => {
        p.y += p.v;
        if (p.y > h) p.y = 0;
        ctx.fillRect(p.x, p.y, 1, 1);
      });
      requestAnimationFrame(draw);
    };
    const onResize = () => {
      w = c.width = innerWidth;
      h = c.height = innerHeight;
    };
    addEventListener("resize", onResize);
    draw();
    return () => removeEventListener("resize", onResize);
  }, []);
  return <canvas ref={star} className="fixed inset-0 -z-20 w-full h-full" />;
}

/* ---------- Countdown hook ---------- */
function useCountdown(targetISO) {
  const [diff, setDiff] = useState(() => new Date(targetISO).getTime() - Date.now());
  useEffect(() => {
    const t = setInterval(() => setDiff(new Date(targetISO).getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [targetISO]);
  const past = diff <= 0,
    abs = Math.abs(diff);
  const d = Math.floor(abs / (1000 * 60 * 60 * 24));
  const h = Math.floor((abs / (1000 * 60 * 60)) % 24);
  const m = Math.floor((abs / (1000 * 60)) % 60);
  const s = Math.floor((abs / 1000) % 60);
  return { past, d, h, m, s };
}

const BigBlock = ({ label, value }) => (
  <div className="flex flex-col items-center">
    <div className="w-20 h-24 md:w-24 md:h-28 rounded-2xl bg-white/8 border border-white/15 grid place-items-center text-4xl md:text-5xl font-black">
      {String(value).padStart(2, "0")}
    </div>
    <div className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/70">{label}</div>
  </div>
);

/* ---------- Committee Brief Modal ---------- */
function BriefModal({ idx, onClose }) {
  if (idx === null) return null;
  const c = COMMITTEES[idx];
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          className="max-w-3xl w-full max-h-[85vh] overflow-auto rounded-2xl border border-white/15 bg-[#0a0a1a] text-white p-6"
        >
          <div className="flex items-center gap-3">
            <img src={c.logo} className="h-12 w-12 object-contain" alt={`${c.name} logo`} />
            <h3 className="text-xl font-bold">{c.name}</h3>
            <button onClick={onClose} className="ml-auto p-1 hover:opacity-80">
              <X size={18} />
            </button>
          </div>
          <div className="mt-4 text-white/80">
            <span className="font-semibold">Agenda:</span> {c.agenda}
          </div>
          <div className="mt-5 grid md:grid-cols-2 gap-5">
            <div>
              <div className="text-white font-semibold">Overview</div>
              <p className="mt-2 text-white/80">{c.brief.overview}</p>
              <div className="mt-4 text-white font-semibold">Objectives</div>
              <ul className="mt-2 list-disc list-inside text-white/80 space-y-1">
                {c.brief.objectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-white font-semibold">Format</div>
              <p className="mt-2 text-white/80">{c.brief.format}</p>
              <div className="mt-4 text-white font-semibold">Suggested Resources</div>
              <ul className="mt-2 list-disc list-inside text-white/80 space-y-1">
                {c.brief.resources.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section className="relative isolate overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur">
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-white/10 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-white/10 blur-3xl rounded-full" />

      <div className="relative z-10 px-6 md:px-10 pt-12 pb-14 text-center">
        <img src={LOGO_URL} alt="Noir" className="h-20 w-20 mx-auto object-contain drop-shadow" />
        <h1 className="mt-6 text-[40px] md:text-[68px] leading-none font-black tracking-tight">
          NOIR&nbsp;MUN&nbsp;2025
        </h1>
        <div className="mt-3 inline-flex items-center gap-2 text-white/80">
          <Calendar size={16} /> {DATES_TEXT} • Faridabad
        </div>
        <div className="mt-5 text-xl md:text-2xl font-semibold">Whispers Today, Echo Tomorrow</div>

        <div className="mt-9 relative z-20 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noreferrer"
            className="click-safe inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 px-6 py-3 text-white border border-white/20 w-full sm:w-auto justify-center"
          >
            Secure your seat <ChevronRight size={18} />
          </a>
          <Link
            to="/signup"
            className="click-safe inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-6 py-3 text-white border border-white/20 w-full sm:w-auto justify-center"
          >
            Sign Up
          </Link>
          <Link
            to="/assistance"
            className="click-safe inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-6 py-3 text-white border border-white/20 w-full sm:w-auto justify-center"
          >
            MUN Assistance
          </Link>
        </div>

        <div className="mt-2 text-white/70 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="click-safe underline">
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- Countdown ---------- */
function MonumentalCountdown() {
  const { past, d, h, m, s } = useCountdown(TARGET_DATE_IST);
  return (
    <section className="mt-12 border border-white/12 rounded-[28px] p-6 md:p-8 bg-white/[0.04]">
      {!past ? (
        <div className="flex flex-col items-center">
          <div className="text-white/65 text-xs tracking-[0.35em] uppercase">Countdown</div>
          <div className="mt-4 flex gap-5 flex-wrap justify-center">
            <BigBlock label="Days" value={d} />
            <BigBlock label="Hours" value={h} />
            <BigBlock label="Mins" value={m} />
            <BigBlock label="Secs" value={s} />
          </div>
        </div>
      ) : (
        <div className="text-center text-white/80">See you at Noir MUN — thank you!</div>
      )}
    </section>
  );
}

/* ---------- Committee cards ---------- */
/* NEW: Proportional, responsive logo well with clamp() */
function LogoBadge({ src, alt }) {
  return (
    <div
      className="mx-auto mt-2 shrink-0 grid place-items-center rounded-2xl border border-white/18 bg-white/[0.06] aspect-square"
      style={{ width: "clamp(56px, 8.5vw, 96px)" }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="block object-contain"
        style={{ width: "78%", height: "78%", imageRendering: "auto" }}
        onError={(e) => {
          e.currentTarget.style.opacity = 0.35;
        }}
      />
    </div>
  );
}

function PosterWall({ onOpen }) {
  return (
    <section className="mt-16">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold">The Councils</h2>
        <p className="mt-2 text-white/70">Tap a poster to open the dossier.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMMITTEES.map((c, idx) => (
          <button
            key={c.name}
            onClick={() => onOpen(idx)}
            className="group relative rounded-[26px] overflow-hidden border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.025] text-left focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            <div className="aspect-[16/10] md:aspect-[16/9] w-full grid place-items-center px-6 pt-6 text-center">
              <LogoBadge src={c.logo} alt={`${c.name} logo`} />
              <div className="mt-4">
                <div className="font-semibold text-lg leading-tight">{c.name}</div>
                <div className="text-xs text-white/70 line-clamp-3 mt-2">{c.agenda}</div>
              </div>
            </div>
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: "inset 0 0 140px rgba(255,255,255,.09)" }}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function ImpactCTA() {
  return (
    <section className="mt-16 rounded-[28px] border border-white/12 p-8 md:p-10 bg-white/[0.04] text-center">
      <div className="text-[28px] md:text-[36px] font-extrabold leading-tight">
        The council that will echo tomorrow.
      </div>
      <div className="mt-2 text-white/70">
        Two days. One stage. Bring your discipline, your design, your diplomacy.
      </div>
      <a
        href={REGISTER_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 px-6 py-3 text-white border border-white/20"
      >
        Register Now <ChevronRight size={18} />
      </a>
    </section>
  );
}

/* --------------------------------------------------
 * WILT Mini (Talk to us) — with Staff Q&A
 * -------------------------------------------------- */
function answerStaffQuery(qRaw) {
  const q = norm(qRaw);

  // 0) “Who is the ED?”
  const special = specialEDIntercept(q);
  if (special) return special;

  // 1) If message includes any staff NAME → return their role
  for (const [name, role] of Object.entries(STAFF)) {
    const n = norm(name);
    if (q.includes(n)) return `${titleCase(name)} — ${role}`;
  }

  // 2) If message includes a ROLE or its synonym → return name(s)
  const possible = Object.keys(ROLE_TO_NAMES)
    .concat(Object.keys(ROLE_SYNONYMS))
    .sort((a, b) => b.length - a.length);

  for (const token of possible) {
    const key = ROLE_SYNONYMS[token] ? ROLE_SYNONYMS[token] : token;
    if (q.includes(token)) {
      const names = ROLE_TO_NAMES[norm(key)];
      if (names?.length) {
        const pretty = names.map((n) => titleCase(n)).join(", ");
        return `${pretty} — ${titleCase(key)}`;
      }
    }
  }

  // 3) “who is <role>?”
  const whoRole = q.match(/who(?:\s+is|'?s)?\s+(the\s+)?([a-z\s']{2,40})\??$/);
  if (whoRole) {
    const roleText = norm((whoRole[2] || "").replace(/\bof\b.*$/, "").trim());
    const key = ROLE_SYNONYMS[roleText] || roleText;
    const names = ROLE_TO_NAMES[key];
    if (names?.length) {
      const pretty = names.map((n) => titleCase(n)).join(", ");
      return `${pretty} — ${titleCase(key)}`;
    }
  }

  // 4) “who is <name>?”
  const whoName = q.match(/who(?:\s+is|'?s)?\s+([a-z\s']{2,40})\??$/);
  if (whoName) {
    const nameGuess = norm(whoName[1]);
    for (const [name, role] of Object.entries(STAFF)) {
      if (name.includes(nameGuess) || nameGuess.includes(name.split(" ")[0])) {
        return `${titleCase(name)} — ${role}`;
      }
    }
  }

  return null;
}

function TalkToUs() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thread, setThread] = useState([
    {
      from: "bot",
      text:
        "Hey! I’m WILT Mini — ask dates, fee, venue, founders, committees, or any staff role like ‘Who is the ED?’",
    },
  ]);
  const add = (m) => setThread((t) => [...t, m]);

  const send = () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    add({ from: "user", text: msg });

    const q = norm(msg);

    if (/\b(date|when)\b/.test(q)) return add({ from: "bot", text: "Dates: 11–12 October, 2025." });
    if (/\b(fee|price|cost)\b/.test(q)) return add({ from: "bot", text: "Delegate fee: ₹2300." });
    if (/\b(venue|where|location)\b/.test(q))
      return add({ from: "bot", text: "Venue: TBA — want WhatsApp updates when we announce?" });

    const staffAnswer = answerStaffQuery(q);
    if (staffAnswer) return add({ from: "bot", text: staffAnswer });

    if (/\b(founder|organiser|organizer|oc|eb|lead|leadership|team)\b/.test(q))
      return add({
        from: "bot",
        text:
          "Leadership — Founder: Sameer Jhamb, Co‑Founder: Maahir Gulati, President: Gautam Khera. Ask me any role by name too, e.g., ‘Who is the ED?’",
      });

    if (/\b(committee|agenda|topic)\b/.test(q))
      return add({ from: "bot", text: "Open Assistance for full briefs → /assistance" });

    if (/\b(register|sign)\b/.test(q))
      return add({ from: "bot", text: "Open Linktree → " + REGISTER_URL });

    if (/\b(exec|human|someone|whatsapp|help)\b/.test(q)) {
      try {
        window.open(WHATSAPP_ESCALATE, "_blank");
      } catch {}
      return add({ from: "bot", text: "Opening WhatsApp…" });
    }

    return add({
      from: "bot",
      text:
        "Try: dates • fee • venue • founders • committees • register • ‘Who is the ED?’ • ‘Who is Nimay Gupta?’",
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-96 max-w-[92vw] rounded-2xl shadow-2xl overflow-hidden border border-white/15 backdrop-blur bg-white/10 text-white"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-white/10">
              <div className="font-semibold">Talk to us (WILT Mini)</div>
              <button onClick={() => setOpen(false)} className="p-1 hover:opacity-80">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-96 overflow-auto p-3 space-y-3">
              {thread.map((m, i) => (
                <div key={i} className={`flex ${m.from === "bot" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`${
                      m.from === "bot" ? "bg-white/20" : "bg-white/30"
                    } text-sm px-3 py-2 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-3 pb-2 flex flex-wrap gap-2">
              <button onClick={() => (setInput("Dates?"), setTimeout(send))} className="text-xs rounded-full px-3 py-1 bg-white/15">
                Dates
              </button>
              <button onClick={() => (setInput("Fee?"), setTimeout(send))} className="text-xs rounded-full px-3 py-1 bg-white/15">
                Fee
              </button>
              <button onClick={() => (setInput("Venue?"), setTimeout(send))} className="text-xs rounded-full px-3 py-1 bg-white/15">
                Venue
              </button>
              <button onClick={() => (setInput("Who is the ED?"), setTimeout(send))} className="text-xs rounded-full px-3 py-1 bg-white/15">
                Who is the ED?
              </button>
              <Link to="/assistance" className="text-xs rounded-full px-3 py-1 bg-white/15">
                Open Assistance
              </Link>
            </div>

            <div className="p-3 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything… e.g., Who is Nimay Gupta?"
                className="flex-1 bg-white/15 px-3 py-2 rounded-xl outline-none placeholder-white/60"
              />
              <button onClick={send} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ y: -2 }}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl text-white shadow-xl bg-[--theme] border border-white/20 hover:shadow-2xl"
          style={{ "--theme": THEME_HEX }}
        >
          <MessageCircle size={18} /> Talk to us
        </motion.button>
      )}
    </div>
  );
}

/* ---------- Inline Footer ---------- */
function InlineFooter() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-3 text-white/80">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Noir" className="h-10 w-10 object-contain" />
          <div>
            <div className="font-semibold">Noir MUN</div>
            <div className="text-xs text-white/60">Faridabad, India</div>
          </div>
        </div>
        <div>
          <div className="font-semibold">Explore</div>
          <Link to="/assistance" className="block text-sm hover:underline">
            Assistance
          </Link>
          <Link to="/login" className="block text-sm hover:underline">
            Login
          </Link>
          <Link to="/signup" className="block text-sm hover:underline">
            Sign Up
          </Link>
          <a href={REGISTER_URL} target="_blank" rel="noreferrer" className="block text-sm hover:underline">
            Register
          </a>
        </div>
        <div>
          <div className="font-semibold">Legal</div>
          <Link to="/legal" className="block text-sm hover:underline">
            Terms & Privacy
          </Link>
          <div className="text-xs text-white/60">© {new Date().getFullYear()} Noir MUN — “Whispers Today, Echo Tomorrow.”</div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Main Page ---------- */
export default function Home() {
  const { scrollYProgress } = useScroll();
  const yHalo = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const [briefIdx, setBriefIdx] = useState(null);

  // Mobile menu state (opens ONLY on hamburger click)
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [menuOpen]);

  useEffect(() => {
    document.documentElement.style.setProperty("--theme", THEME_HEX);
    document.body.style.background = THEME_HEX;
  }, []);

  return (
    <div className="min-h-screen text-white relative">
      <Atmosphere />
      <motion.div className="pointer-events-none fixed -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" style={{ y: yHalo }} />
      <motion.div className="pointer-events-none fixed -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" style={{ y: yHalo }} />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-gradient-to-b from-[#000026]/60 to-transparent backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-shrink-0" style={{ whiteSpace: "nowrap" }}>
            <img src={LOGO_URL} alt="Noir" className="h-9 w-9 object-contain" />
            <span className="font-semibold tracking-wide">Noir MUN</span>
          </div>

          {/* Desktop pills only */}
          <nav className="nav-bar hidden sm:flex">
            <Link to="/assistance" className="nav-pill">Assistance</Link>
            <Link to="/legal" className="nav-pill">Legal</Link>
            <Link to="/login" className="nav-pill nav-pill--ghost">Login</Link>
            <Link to="/signup" className="nav-pill">Sign Up</Link>
            <a href={REGISTER_URL} target="_blank" rel="noreferrer" className="nav-pill nav-pill--primary">
              Register <ChevronRight size={16} style={{ marginLeft: 6 }} />
            </a>
          </nav>

          {/* Mobile hamburger — menu opens ONLY when this is clicked */}
          <button
            className="sm:hidden rounded-xl border border-white/20 p-2"
            aria-label="Menu"
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Sheet (hidden until hamburger is tapped) */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              id="mobile-menu"
              className="fixed top-0 left-0 right-0 z-50 rounded-b-2xl border-b border-white/15 bg-[#07071a]/95"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={LOGO_URL} alt="Noir" className="h-8 w-8 object-contain" />
                  <span className="font-semibold">Noir MUN</span>
                </div>
                <button className="p-2 rounded-lg border border-white/15" onClick={() => setMenuOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="px-4 pb-4 grid gap-2">
                <Link onClick={() => setMenuOpen(false)} to="/assistance" className="menu-item">Assistance</Link>
                <Link onClick={() => setMenuOpen(false)} to="/legal" className="menu-item">Legal</Link>
                <Link onClick={() => setMenuOpen(false)} to="/login" className="menu-item">Login</Link>
                <Link onClick={() => setMenuOpen(false)} to="/signup" className="menu-item">Sign Up</Link>
                <a onClick={() => setMenuOpen(false)} href={REGISTER_URL} target="_blank" rel="noreferrer" className="menu-item menu-item--primary">
                  Register <ChevronRight size={16} className="inline-block ml-1" />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-10">
        <Hero />
        <MonumentalCountdown />
        <PosterWall onOpen={(i) => setBriefIdx(i)} />
        <ImpactCTA />
      </main>

      {/* Footer + Chat */}
      <InlineFooter />
      <TalkToUs />

      {/* Committee Brief Modal */}
      <BriefModal idx={briefIdx} onClose={() => setBriefIdx(null)} />

      <style>{`
        :root { --theme: ${THEME_HEX}; }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Desktop nav pills */
        .nav-bar {
          display: flex;
          gap: 8px;
          flex-wrap: nowrap;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          max-width: 70vw;
        }
        .nav-bar::-webkit-scrollbar { display: none; }

        .nav-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.20);
          padding: 8px 12px;
          border-radius: 14px;
          color: #fff;
          text-decoration: none;
          white-space: nowrap;
          background: rgba(255,255,255,.06);
          transition: background .2s ease, border-color .2s ease, transform .15s ease;
        }
        .nav-pill:hover { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.28); transform: translateY(-1px); }
        .nav-pill--ghost { background: rgba(255,255,255,.04); }
        .nav-pill--primary { background: rgba(255,255,255,.10); border-color: rgba(255,255,255,.30); }

        @media (min-width: 640px) {
          .nav-bar { max-width: none; }
          .nav-pill { padding: 10px 14px; border-radius: 16px; }
        }

        /* Mobile menu items */
        .menu-item {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.06);
          color: #fff;
          text-decoration: none;
        }
        .menu-item--primary {
          background: rgba(255,255,255,.12);
          border-color: rgba(255,255,255,.24);
        }

        /* Ensure CTAs always receive taps even if other layers exist */
        .click-safe { position: relative; z-index: 30; pointer-events: auto; }

        /* --- Logo polish --- */
        img[decoding="async"] { vertical-align: middle; }
        @media (max-width: 360px) {
          /* Slight bump for very small phones */
          .mx-auto.mt-2.shrink-0.grid.place-items-center.rounded-2xl { width: 68px !important; }
        }
      `}</style>
    </div>
  );
}
