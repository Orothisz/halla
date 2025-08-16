// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Calendar,
  ChevronRight,
  X,
  Send,
  MessageCircle,
  Menu,
  Quote,
  Shield,
  Landmark,
  Crown,
  Columns
} from "lucide-react";

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

// helpers
function norm(s = "") {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}
function titleCase(s = "") {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
const ROLE_TO_NAMES = Object.entries(STAFF).reduce((acc, [name, role]) => {
  const k = norm(role);
  acc[k] = acc[k] || [];
  acc[k].push(name);
  return acc;
}, {});
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
  
};

// Special override: “Who is the ED?”
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
      w = (c.width = innerWidth);
      h = (c.height = innerHeight);
    };
    addEventListener("resize", onResize);
    draw();
    return () => removeEventListener("resize", onResize);
  }, []);
  return <canvas ref={star} className="fixed inset-0 -z-20 w-full h-full" />;
}

/* ---------- Roman Layer (real statues, marble, noise, parallax) ---------- */
function RomanLayer() {
  const { scrollYProgress } = useScroll();
  const yBust = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const yColumn = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const yLaurel = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const IMG_LEFT =
    "https://i.postimg.cc/sDqGkrr6/Untitled-design-5.png";
  const IMG_RIGHT =
    "https://i.postimg.cc/J0ttFTdC/Untitled-design-6.png";
  const IMG_CENTER =
    "https://i.postimg.cc/66DGSKwH/Untitled-design-7.png";

  return (
    <>
      {/* Marble gradients */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[.18]"
        style={{
          backgroundImage:
            "radial-gradient(1100px 700px at 80% -10%, rgba(255,255,255,.16), rgba(0,0,0,0)), radial-gradient(900px 600px at 12% 20%, rgba(255,255,255,.11), rgba(0,0,0,0))",
        }}
      />

      {/* Gold glints */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <motion.div
          style={{ y: yBust }}
          className="absolute -top-28 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: yColumn }}
          className="absolute -bottom-28 -right-24 w-[32rem] h-[32rem] rounded-full blur-3xl"
        />
      </div>

      {/* Statues — parallax + blend for premium depth */}
      <motion.img
        src={IMG_LEFT}
        alt=""
        loading="lazy"
        decoding="async"
        className="pointer-events-none fixed left-[-26px] top-[16vh] w-[240px] md:w-[320px] opacity-[.55] md:opacity-[.75] mix-blend-screen select-none -z-10"
        style={{ y: yBust, filter: "grayscale(60%) contrast(110%) blur(0.2px)" }}
      />
      <motion.img
        src={IMG_RIGHT}
        alt=""
        loading="lazy"
        decoding="async"
        className="pointer-events-none fixed right-[-10px] top-[30vh] w-[230px] md:w-[310px] opacity-[.50] md:opacity-[.72] mix-blend-screen select-none -z-10"
        style={{ y: yColumn, filter: "grayscale(60%) contrast(112%) blur(0.2px)" }}
      />
      <motion.img
        src={IMG_CENTER}
        alt=""
        loading="lazy"
        decoding="async"
        className="pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-[4vh] w-[540px] max-w-[88vw] opacity-[.40] md:opacity-[.55] mix-blend-screen select-none -z-10"
        style={{ y: yLaurel, filter: "grayscale(55%) contrast(108%)" }}
      />

      {/* Fine film grain for luxe finish */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 .9'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23n)' /></svg>\")",
        }}
      />
    </>
  );
}

/* ---------- Countdown ---------- */
function useCountdown(targetISO) {
  const [diff, setDiff] = useState(() => new Date(targetISO).getTime() - Date.now());
  useEffect(() => {
    const t = setInterval(() => setDiff(new Date(targetISO).getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [targetISO]);
  const past = diff <= 0;
  const abs = Math.abs(diff);
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

/* ---------- Visual Bits ---------- */
const LaurelDivider = () => (
  <div className="my-8 flex items-center justify-center gap-3 text-white/40">
    <div className="h-px w-12 bg-white/20" />
    <span className="tracking-[0.35em] text-xs uppercase">Laurels</span>
    <div className="h-px w-12 bg-white/20" />
  </div>
);

const QuoteCard = ({ children }) => (
  <div className="mt-6 rounded-2xl border border-white/15 bg-white/[0.05] p-4 text-white/80 backdrop-blur-sm">
    <div className="flex items-start gap-3">
      <Quote className="mt-1" size={18} />
      <p className="leading-relaxed">{children}</p>
    </div>
  </div>
);

/* ---------- Gilded Heading ---------- */
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

/* ---------- Prologue (Hero) ---------- */
function Prologue() {
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
        <div className="mt-5 text-xl md:text-2xl font-semibold">
          <Gilded>Whispers Today, Echo Tomorrow</Gilded>
        </div>

        <QuoteCard>
          In marble and laurel, discipline met rhetoric. Noir brings that precision to diplomacy —
          a modern pantheon where words shape order.
        </QuoteCard>

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

/* ---------- Chapter ---------- */
function Chapter({ kicker, title, children, icon }) {
  return (
    <section className="mt-16 rounded-[28px] border border-white/12 p-6 md:p-10 bg-white/[0.04] backdrop-blur-sm ring-1 ring-white/5">
      <div className="text-white/60 text-xs tracking-[0.35em] uppercase">{kicker}</div>
      <div className="mt-2 flex items-center gap-3">
        {icon}
        <h2 className="text-2xl md:text-3xl font-extrabold">{title}</h2>
      </div>
      <div className="mt-4 text-white/80 leading-relaxed">{children}</div>
    </section>
  );
}

/* ---------- Councils grid (uniform logos) ---------- */
function LogoBadge({ src, alt }) {
  return (
    <div className="mx-auto mt-2 shrink-0 rounded-full border border-yellow-100/20 bg-white/[0.06] w-16 h-16 md:w-20 md:h-20 grid place-items-center shadow-[0_0_0_1px_rgba(255,255,255,.04)_inset]">
      <img
        src={src}
        alt={alt}
        className="w-[72%] h-[72%] object-contain"
        onError={(e) => {
          e.currentTarget.style.opacity = 0.35;
        }}
      />
    </div>
  );
}
function PosterWall({ onOpen }) {
  return (
    <section className="mt-8">
      <div className="text-center">
        <h3 className="text-3xl md:text-4xl font-extrabold">
          <Gilded>The Councils</Gilded>
        </h3>
        <p className="mt-2 text-white/70">Step into chambers where rhetoric rivals legend.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMMITTEES.map((c, idx) => (
          <button
            key={c.name}
            onClick={() => onOpen(idx)}
            className="group relative rounded-[26px] overflow-hidden border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.025] text-left focus:outline-none focus:ring-2 focus:ring-yellow-100/20"
          >
            <div className="aspect-[16/10] md:aspect-[16/9] w-full grid place-items-center px-6 text-center">
              <LogoBadge src={c.logo} alt={`${c.name} logo`} />
              <div className="mt-4">
                <div className="font-semibold text-lg leading-tight">{c.name}</div>
                <div className="text-xs text-white/70 line-clamp-3 mt-2">{c.agenda}</div>
              </div>
            </div>

            {/* premium hover frame */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: "inset 0 0 140px rgba(255,255,255,.09)" }}
              />
              <div className="absolute inset-0 rounded-[26px] border border-yellow-200/0 group-hover:border-yellow-100/25 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function ImpactCTA() {
  return (
    <section className="mt-16 rounded-[28px] border border-white/12 p-8 md:p-10 bg-white/[0.04] text-center backdrop-blur-sm">
      <div className="text-[28px] md:text-[36px] font-extrabold leading-tight">
        <Gilded>The council that will echo tomorrow.</Gilded>
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

/* ---------- WILT Mini (chat) ---------- */
function answerStaffQuery(qRaw) {
  const q = norm(qRaw);
  const special = specialEDIntercept(q);
  if (special) return special;

  for (const [name, role] of Object.entries(STAFF)) {
    const n = norm(name);
    if (q.includes(n)) return `${titleCase(name)} — ${role}`;
  }

  const possible = Object.keys(ROLE_TO_NAMES)
    .concat(Object.keys(ROLE_SYNONYMS))
    .sort((a, b) => b.length - a.length);

  for (const token of possible) {
    const key = ROLE_SYNONYMS[token] ? ROLE_SYNONYMS[token] : token;
    if (q.includes(token)) {
      const names = ROLE_TO_NAMES[norm(key)];
      if (names && names.length) {
        const pretty = names.map((n) => titleCase(n)).join(", ");
        return `${pretty} — ${titleCase(key)}`;
      }
    }
  }

  const whoRole = q.match(/who(?:\s+is|'?s)?\s+(the\s+)?([a-z\s']{2,40})\??$/);
  if (whoRole) {
    const roleText = norm((whoRole[2] || "").replace(/\bof\b.*$/, "").trim());
    const key = ROLE_SYNONYMS[roleText] || roleText;
    const names = ROLE_TO_NAMES[key];
    if (names && names.length) {
      const pretty = names.map((n) => titleCase(n)).join(", ");
      return `${pretty} — ${titleCase(key)}`;
    }
  }

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
    { from: "bot", text: "Ave! I’m WILT Mini — ask dates, fee, venue, founders, committees, or any staff role like ‘Who is the ED?’" },
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
    if (/\b(venue|where|location)\b/.test(q)) return add({ from: "bot", text: "Venue: TBA — want WhatsApp updates when we announce?" });

    const staffAnswer = answerStaffQuery(q);
    if (staffAnswer) return add({ from: "bot", text: staffAnswer });

    if (/\b(founder|organiser|organizer|oc|eb|lead|leadership|team)\b/.test(q)) {
      return add({
        from: "bot",
        text:
          "Leadership — Founder: Sameer Jhamb, Co-Founder: Maahir Gulati, President: Gautam Khera. Ask me any role by name too.",
      });
    }

    if (/\b(committee|agenda|topic)\b/.test(q)) return add({ from: "bot", text: "Open Assistance for full briefs → /assistance" });
    if (/\b(register|sign)\b/.test(q)) return add({ from: "bot", text: "Open Linktree → " + REGISTER_URL });

    if (/\b(exec|human|someone|whatsapp|help)\b/.test(q)) {
      try {
        window.open(WHATSAPP_ESCALATE, "_blank");
      } catch {}
      return add({ from: "bot", text: "Opening WhatsApp…" });
    }

    return add({
      from: "bot",
      text: "Try: dates • fee • venue • founders • committees • register • staff lookups",
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
              <div className="font-semibold flex items-center gap-2">
                <Crown size={16} className="opacity-80" />
                Talk to us (WILT Mini)
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:opacity-80">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-96 overflow-auto p-3 space-y-3">
              {thread.map((m, i) => (
                <div key={i} className={`flex ${m.from === "bot" ? "justify-start" : "justify-end"}`}>
                  <div className={`${m.from === "bot" ? "bg-white/20" : "bg-white/30"} text-sm px-3 py-2 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-3 pb-2 flex flex-wrap gap-2">
              <button onClick={() => { setInput("Dates?"); setTimeout(send, 0); }} className="text-xs rounded-full px-3 py-1 bg-white/15">Dates</button>
              <button onClick={() => { setInput("Fee?"); setTimeout(send, 0); }} className="text-xs rounded-full px-3 py-1 bg-white/15">Fee</button>
              <button onClick={() => { setInput("Venue?"); setTimeout(send, 0); }} className="text-xs rounded-full px-3 py-1 bg-white/15">Venue</button>
              <Link to="/assistance" className="text-xs rounded-full px-3 py-1 bg-white/15">Open Assistance</Link>
            </div>

            <div className="p-3 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything… e.g., leadership, fee, venue"
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

/* ---------- Footer ---------- */
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
          <Link to="/assistance" className="block text-sm hover:underline">Assistance</Link>
          <a
            href="https://www.noirmun.com/best-mun-delhi-faridabad"
            className="block text-sm hover:underline"
            target="_blank"
            rel="noreferrer"
            title="Best Model UN (MUN) in Delhi & Faridabad – 2025 Guide"
          >
            Best MUN in Delhi &amp; Faridabad (2025 Guide)
          </a>
          <Link to="/login" className="block text-sm hover:underline">Login</Link>
          <Link to="/signup" className="block text-sm hover:underline">Sign Up</Link>
          <a href={REGISTER_URL} target="_blank" rel="noreferrer" className="block text-sm hover:underline">Register</a>
        </div>
        <div>
          <div className="font-semibold">Legal</div>
          <Link to="/legal" className="block text-sm hover:underline">Terms & Privacy</Link>
          <div className="text-xs text-white/60">© {new Date().getFullYear()} Noir MUN — “Whispers Today, Echo Tomorrow.”</div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Page ---------- */
export default function Home() {
  const { scrollYProgress } = useScroll();
  const yHalo = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const [briefIdx, setBriefIdx] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    document.documentElement.style.setProperty("--theme", THEME_HEX);
    document.body.style.background = THEME_HEX;
  }, []);

  const { past, d, h, m, s } = useCountdown(TARGET_DATE_IST);

  return (
    <div className="min-h-screen text-white relative">
      <Atmosphere />
      <RomanLayer />

      <motion.div className="pointer-events-none fixed -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" style={{ y: yHalo }} />
      <motion.div className="pointer-events-none fixed -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" style={{ y: yHalo }} />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-gradient-to-b from-[#000026]/60 to-transparent backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-shrink-0" style={{ whiteSpace: "nowrap" }}>
            <img src={LOGO_URL} alt="Noir" className="h-9 w-9 object-contain" />
            <span className="font-semibold tracking-wide">Noir MUN</span>
          </div>

          <nav className="nav-bar hidden sm:flex">
            <Link to="/assistance" className="nav-pill">Assistance</Link>
            <Link to="/legal" className="nav-pill">Legal</Link>
            <Link to="/login" className="nav-pill nav-pill--ghost">Login</Link>
            <Link to="/signup" className="nav-pill">Sign Up</Link>
            <a href={REGISTER_URL} target="_blank" rel="noreferrer" className="nav-pill nav-pill--primary">
              Register <ChevronRight size={16} style={{ marginLeft: 6 }} />
            </a>
          </nav>

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

      {/* Mobile Menu Sheet */}
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

      {/* Main Narrative */}
      <main className="mx-auto max-w-7xl px-4 py-10">
        <Prologue />

        <Chapter
          kicker="Chapter I"
          title="The Origin"
          icon={<Shield size={20} className="text-white/70" />}
        >
          Born from a love of design and debate, Noir is led by a council of builders and diplomats.
          Founder <strong>Sameer Jhamb</strong> with Co-Founder <strong>Maahir Gulati</strong> and
          President <strong>Gautam Khera</strong> set the stage.
          <LaurelDivider />
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Landmark size={16} /> <em>Ordo • Disciplina • Dignitas</em>
          </div>
        </Chapter>

        <Chapter
          kicker="Chapter II"
          title="The Call"
          icon={<Calendar size={20} className="text-white/70" />}
        >
          The dates are set: <strong>{DATES_TEXT}</strong>. Your presence turns whispers into echoes.
          {!past ? (
            <div className="mt-5 flex gap-5 flex-wrap justify-center">
              <BigBlock label="Days" value={d} />
              <BigBlock label="Hours" value={h} />
              <BigBlock label="Mins" value={m} />
              <BigBlock label="Secs" value={s} />
            </div>
          ) : (
            <div className="mt-5 text-center text-white/80">See you at Noir MUN — thank you!</div>
          )}
        </Chapter>

        <Chapter
          kicker="Chapter III"
          title="The Pantheon of Councils"
          icon={<Columns size={20} className="text-white/70" />}
        >
          Each chamber upholds a different creed — strategy, justice, history, negotiation.
          Choose your arena, study the agenda, and step into the role. Tap a poster to open its dossier.
          <PosterWall onOpen={(i) => setBriefIdx(i)} />
        </Chapter>

        <Chapter
          kicker="Chapter IV"
          title="The Oath"
          icon={<ChevronRight size={20} className="text-white/70" />}
        >
          Two days. One stage. Bring your discipline, your design, your diplomacy.
          <ImpactCTA />
        </Chapter>
      </main>

      <InlineFooter />
      <TalkToUs />

      {/* Committee Brief Modal */}
      <BriefModal idx={briefIdx} onClose={() => setBriefIdx(null)} />

      {/* inline styles */}
      <style>{`
        :root { --theme: ${THEME_HEX}; }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .nav-bar { display:flex; gap:8px; flex-wrap:nowrap; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; max-width:70vw; }
        .nav-bar::-webkit-scrollbar { display:none; }
        .nav-pill {
          display:inline-flex; align-items:center; justify-content:center;
          border:1px solid rgba(255,255,255,.20); padding:8px 12px; border-radius:14px;
          color:#fff; text-decoration:none; white-space:nowrap; background:rgba(255,255,255,.06);
          transition: background .2s ease, border-color .2s ease, transform .15s ease;
        }
        .nav-pill:hover { background:rgba(255,255,255,.12); border-color:rgba(255,255,255,.28); transform:translateY(-1px); }
        .nav-pill--ghost { background:rgba(255,255,255,.04); }
        .nav-pill--primary { background:rgba(255,255,255,.10); border-color:rgba(255,255,255,.30); }
        @media (min-width:640px) { .nav-bar { max-width:none; } .nav-pill { padding:10px 14px; border-radius:16px; } }
        .menu-item {
          display:inline-flex; align-items:center; justify-content:space-between;
          padding:12px 14px; border-radius:12px; border:1px solid rgba(255,255,255,.14);
          background:rgba(255,255,255,.06); color:#fff; text-decoration:none;
        }
        .menu-item--primary { background:rgba(255,255,255,.12); border-color:rgba(255,255,255,.24); }
        .click-safe { position:relative; z-index:30; pointer-events:auto; }
      `}</style>
    </div>
  );
}
