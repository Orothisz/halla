// src/pages/Home.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Columns,
  MapPin,
  ExternalLink,
  Navigation,
  Star,
  Sparkles,
} from "lucide-react";

import {
  LOGO_URL,
  DATES_TEXT,
  TARGET_DATE_IST,
  THEME_HEX, // ignored; we force THEME_BASE below
  COMMITTEES,
  WHATSAPP_ESCALATE,
  VENUE,
  PARTNERS,
  ITINERARY,
} from "../shared/constants";

/* --------------------------------------------------
 * Local constants
 * -------------------------------------------------- */
const THEME_BASE = "#000026"; // <<<< forced theme color (per your request)

const REGISTER_HREF = "https://noirmun.com/register";
const EB_APPLY_HREF =
  "https://docs.google.com/forms/d/e/1FAIpQLSckm785lhMOj09BOBpaFWxbBzxp6cO5UjJulhbzZQz__lFtxw/viewform";
const IG_HREF = "https://instagram.com/noirmodelun";
const LINKTREE_HREF = "https://linktr.ee/noirmun";
const VENUE_HOTEL_URL =
  "https://www.sarovarhotels.com/delite-sarovar-portico-faridabad/";

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

/* --------------------------------------------------
 * Helpers
 * -------------------------------------------------- */
function norm(s = "") {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}
function titleCase(s = "") {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
const ROLE_TO_NAMES = Object.entries(STAFF).reduce((acc, [name, role]) => {
  const k = norm(role);
  (acc[k] = acc[k] || []).push(name);
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
  "charge d' affairs": "charge d'affaires",
  "charge d'affaires": "charge d'affaires",
  "chef d cabinet": "chef d cabinet",
  "conference director": "conference director",
  founder: "founder",
};

/* Special override: “Who is the ED?” */
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

/* ---------- RomanLayer (same background feel as Assistance.jsx) ---------- */
function RomanLayer() {
  const { scrollYProgress } = useScroll();
  const yBust = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const yColumn = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const yLaurel = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const IMG_LEFT = "https://i.postimg.cc/sDqGkrr6/Untitled-design-5.png";
  const IMG_RIGHT = "https://i.postimg.cc/J0ttFTdC/Untitled-design-6.png";
  const IMG_CENTER = "https://i.postimg.cc/66DGSKwH/Untitled-design-7.png";

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[.18]"
        style={{
          backgroundImage:
            "radial-gradient(1100px 700px at 80% -10%, rgba(255,255,255,.16), rgba(0,0,0,0)), radial-gradient(900px 600px at 12% 20%, rgba(255,255,255,.11), rgba(0,0,0,0))",
        }}
      />
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
      {/* Parallax statues (background) */}
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
      {/* Film grain */}
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

/* ---------- Partner filtering (now includes new roles) ---------- */
function useCorePartners() {
  return useMemo(() => {
    if (!Array.isArray(PARTNERS)) return [];
    return PARTNERS.filter((p) => {
      const role = (p.role || "").toLowerCase();
      return (
        role.includes("study partner") ||
        role.includes("gaming partner") ||
        role.includes("rewards partner") ||
        role.includes("kitchen partner") ||
        role.includes("venue & catering partner") ||
        role.includes("brand association partner")
      );
    });
  }, []);
}

/* ---------- Partner Medallion (hero ribbon) ---------- */
function PartnerMedallion({ role, name, logo }) {
  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.1] transition backdrop-blur">
      <div className="shrink-0 w-12 h-12 rounded-xl border border-white/15 bg-white/5 grid place-items-center shadow-[0_0_0_1px_rgba(255,255,255,.06)_inset]">
        <img
          src={logo}
          alt={`${name} logo`}
          className="w-9 h-9 object-contain"
          onError={(e) => (e.currentTarget.style.opacity = 0.35)}
        />
      </div>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-[0.28em] text-white/60">{role}</div>
        <div className="text-sm font-semibold">{name}</div>
      </div>
    </div>
  );
}

/* Hero ribbon with large partner presence (filtered) */
function HeroPartnersRibbon() {
  const CORE = useCorePartners();
  if (CORE.length === 0) return null;
  return (
    <div className="mt-8">
      <div className="text-xs uppercase tracking-[0.35em] text-white/60 mb-3 flex items-center justify-start sm:justify-center gap-2">
        <Star size={14} className="opacity-80" /> <span>In Proud Association</span> <Star size={14} className="opacity-80" />
      </div>
      <div className="flex flex-wrap items-stretch justify-start sm:justify-center gap-3 text-left">
        {CORE.map((p) => (
          <PartnerMedallion key={`hero-${p.name}`} role={p.role} name={p.name} logo={p.logo} />
        ))}
      </div>
    </div>
  );
}

/* Super-smooth, constant-speed marquee (filtered) */
function PartnerTicker() {
  const CORE = useCorePartners();
  const railRef = useRef(null);
  const trackRef = useRef(null);
  const animRef = useRef({ x: 0, last: 0 });
  const SPEED_PX_PER_S = 48;

  useEffect(() => {
    const rail = railRef.current;
    const track = trackRef.current;
    if (!rail || !track || CORE.length === 0) return;

    // Clear any previous clones
    track.innerHTML = "";
    const base = document.createElement("div");
    base.setAttribute("data-chunk", "base");
    base.className = "flex items-center gap-8";
    CORE.forEach((p, i) => {
      const item = document.createElement("div");
      item.className = "flex items-center gap-2 text-white/70";
      item.innerHTML = `
        <img src="${p.logo}" alt="${p.name} logo" class="h-6 w-6 object-contain" />
        <span class="text-[11px] whitespace-nowrap">
          <span class="text-white/55">${p.role}:</span> <span class="font-medium">${p.name}</span>
        </span>`;
      base.appendChild(item);
    });
    track.appendChild(base);

    const cloneA = base.cloneNode(true);
    const cloneB = base.cloneNode(true);
    cloneA.setAttribute("data-chunk", "cloneA");
    cloneB.setAttribute("data-chunk", "cloneB");
    track.appendChild(cloneA);
    track.appendChild(cloneB);

    const chunkWidth = base.getBoundingClientRect().width;

    let rafId = 0;
    const onFrame = (ts) => {
      if (!animRef.current.last) animRef.current.last = ts;
      const dt = (ts - animRef.current.last) / 1000;
      animRef.current.last = ts;

      animRef.current.x -= SPEED_PX_PER_S * dt;
      if (-animRef.current.x >= chunkWidth) {
        animRef.current.x += chunkWidth;
      }
      track.style.transform = `translate3d(${animRef.current.x}px,0,0)`;
      rafId = requestAnimationFrame(onFrame);
    };

    rafId = requestAnimationFrame(onFrame);
    return () => {
      cancelAnimationFrame(rafId);
      animRef.current = { x: 0, last: 0 };
      if (track) track.style.transform = "translate3d(0,0,0)";
      if (track) track.innerHTML = "";
    };
  }, [CORE.length]);

  if (CORE.length === 0) return null;

  return (
    <div className="bg-white/[0.05] border-b border-white/10 backdrop-blur-sm overflow-hidden" style={{ contain: "paint", willChange: "transform" }}>
      <div className="relative mx-auto max-w-7xl" ref={railRef}>
        <div
          ref={trackRef}
          className="flex items-center gap-8 py-2"
          style={{ willChange: "transform", backfaceVisibility: "hidden", transform: "translate3d(0,0,0)" }}
        />
      </div>
    </div>
  );
}

/* ---------- Venue Pill ---------- */
function VenuePill() {
  const [hover, setHover] = useState(false);
  return (
    <div className="relative inline-block">
      <a
        href={VENUE_HOTEL_URL}
        target="_blank"
        rel="noreferrer"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs sm:text-sm border border-white/20 transition"
        aria-label="Open venue website"
        title={VENUE.name}
      >
        <MapPin size={14} />
        <span className="truncate max-w-[62vw] sm:max-w-none">Venue: {VENUE.name}</span>
        <ExternalLink size={14} className="opacity-80" />
      </a>

      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute left-1/2 -translate-x-1/2 mt-2 w-[280px] rounded-2xl border border-white/15 bg-[#0a0a1a]/95 backdrop-blur p-3 shadow-xl z-20 hidden md:block"
          >
            <div className="h-28 w-full rounded-xl bg-cover bg-center opacity-90" style={{ backgroundImage: `url(${VENUE.image})` }} aria-hidden />
            <div className="mt-3 text-sm font-medium">{VENUE.name}</div>
            <div className="mt-2 flex gap-2">
              <a href={VENUE_HOTEL_URL} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 border border-white/15 text-xs">
                <ExternalLink size={14} /> Explore Hotel
              </a>
              <a href={VENUE.location} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 border border-white/15 text-xs">
                <Navigation size={14} /> Open in Maps
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Section Heading ---------- */
function SectionHeading({ kicker, title, icon }) {
  return (
    <div className="mb-6 text-left">
      <div className="text-white/60 text-xs tracking-[0.35em] uppercase">{kicker}</div>
      <div className="mt-2 flex items-center gap-3">
        {icon}
        <h2 className="text-2xl md:text-3xl font-extrabold">{title}</h2>
      </div>
    </div>
  );
}

/* ---------- Partners Section (cards) ---------- */
function PartnerBadgeCard({ role, name, logo }) {
  return (
    <div className="group rounded-2xl border border-white/12 bg-white/[0.04] p-4 backdrop-blur-sm hover:bg-white/[0.07] transition relative overflow-hidden text-left">
      <div className="flex items-center gap-3">
        <div className="shrink-0 rounded-xl border border-white/15 bg-white/5 w-14 h-14 grid place-items-center shadow-[0_0_0_1px_rgba(255,255,255,.05)_inset]">
          <img src={logo} alt={`${name} logo`} className="w-10 h-10 object-contain" onError={(e) => (e.currentTarget.style.opacity = 0.35)} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/60">{role}</div>
          <div className="text-sm font-semibold">{name}</div>
        </div>
      </div>
    </div>
  );
}
function PartnersSection() {
  const FEATURED = useMemo(() => {
    const roles = [
      "venue & catering partner",
      "rewards partner",
      "kitchen partner",
      "brand association partner",
    ];
    return (PARTNERS || []).filter((p) => roles.includes((p.role || "").toLowerCase()));
  }, []);
  if (FEATURED.length === 0) return null;
  return (
    <section className="mt-16 rounded-[28px] border border-white/12 p-6 md:p-10 bg-white/[0.04] backdrop-blur-sm ring-1 ring-white/5">
      <SectionHeading kicker="Chapter III½" title="Allies & Partners" icon={<Crown size={20} className="text-white/70" />} />
      <p className="text-white/80 leading-relaxed">Institutions that stand with Noir — strengthening access, study, and community.</p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
        {FEATURED.map((p) => (
          <PartnerBadgeCard key={`${p.role}-${p.name}`} role={p.role} name={p.name} logo={p.logo} />
        ))}
      </div>

      {/* Mobile quick chips row */}
      <div className="mt-6 overflow-x-auto sm:hidden pl-1 [-webkit-overflow-scrolling:touch]">
        <div className="flex gap-3 min-w-max">
          {FEATURED.map((p) => (
            <div key={`mini-${p.name}`} className="px-3 py-2 rounded-full border border-white/12 bg-white/[0.04] text-xs whitespace-nowrap">
              {p.role}: <span className="font-medium">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Itinerary Section ---------- */
function DressIcon({ type }) {
  if (type.toLowerCase().includes("indian")) {
    return (
      <svg viewBox="0 0 64 64" className="w-5 h-5">
        <path d="M18 10h28l2 10-16 6-16-6 2-10zM32 26l-10 6v16h20V32l-10-6z" fill="currentColor" opacity="0.85" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className="w-5 h-5">
      <path d="M24 10h16l4 10-12 6-12-6 4-10zm-2 18h20l-2 20H24l-2-20z" fill="currentColor" opacity="0.85" />
    </svg>
  );
}
function ItinerarySection() {
  return (
    <section className="mt-16 rounded-[28px] border border-white/12 p-6 md:p-10 bg-white/[0.04] backdrop-blur-sm ring-1 ring-white/5 text-left">
      <SectionHeading kicker="Chapter V" title="Itinerary & Dress Code  *Tentative" icon={<Sparkles size={20} className="text-white/70" />} />
      <div className="grid md:grid-cols-2 gap-6">
        {ITINERARY.map((day) => (
          <div key={day.day} className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Day {day.day} — {day.dateText}</div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/70">
                <DressIcon type={day.dressCode} />
                {day.dressCode}
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {day.events.map((e, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-white/70" />
                  <div>
                    <div className="text-sm font-medium">{e.title}</div>
                    <div className="text-xs text-white/70">{e.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-white/60">*Tentative — final timings will be announced closer to the conference.</div>
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
    {
      from: "bot",
      text: "Ave! I’m WILT Mini — ask dates, fee, venue, founders, committees, or any staff role like ‘Who is the ED?’",
    },
  ]);
  const add = (m) => setThread((t) => [...t, m]);

  const send = () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput("");
    add({ from: "user", text: msg });

    const q = norm(msg);

    if (/\b(date|when|schedule|day|dates|what\s+day|which\s+date)\b/.test(q)) {
      return add({ from: "bot", text: `Dates: ${DATES_TEXT}.` });
    }
    if (/\b(fee|price|cost|charges?)\b/.test(q)) {
      return add({ from: "bot", text: "Delegate fee: ₹2300." });
    }
    if (/\b(venue|where|location|address)\b/.test(q)) {
      try { window.open(VENUE_HOTEL_URL, "_blank"); } catch {}
      return add({
        from: "bot",
        text: `Venue: ${VENUE.name}.\nHotel page → ${VENUE_HOTEL_URL}\nMaps → ${VENUE.location}`,
      });
    }
    if (/\b(register|sign\s*up|enrol|enroll|apply|secure\s*(my|your)?\s*seat)\b/.test(q)) {
      try { window.open(REGISTER_HREF, "_blank"); } catch {}
      return add({ from: "bot", text: `Opening registration → ${REGISTER_HREF}` });
    }
    if (/\b(insta|instagram)\b/.test(q)) {
      try { window.open(IG_HREF, "_blank"); } catch {}
      return add({ from: "bot", text: `Instagram → ${IG_HREF}` });
    }
    if (/\blinktr|linktree|links?\b/.test(q)) {
      try { window.open(LINKTREE_HREF, "_blank"); } catch {}
      return add({ from: "bot", text: `Links hub → ${LINKTREE_HREF}` });
    }
    if (/\b(committee|committees|councils?|agenda|topics?)\b/.test(q)) {
      const names = COMMITTEES.map((c) => c.name).join(", ");
      return add({ from: "bot", text: `Councils: ${names}.\nOpen Assistance for full briefs → /assistance` });
    }
    const staffAnswer = answerStaffQuery(q);
    if (staffAnswer) return add({ from: "bot", text: staffAnswer });

    if (/\b(founder|organiser|organizer|oc|eb|lead|leadership|team)\b/.test(q)) {
      return add({
        from: "bot",
        text: "Leadership — Founder: Sameer Jhamb, Co-Founder: Maahir Gulati, President: Gautam Khera. Ask me any role by name too.",
      });
    }
    if (/\b(exec|human|someone|whatsapp|help|contact|support)\b/.test(q)) {
      try { window.open(WHATSAPP_ESCALATE, "_blank"); } catch {}
      return add({ from: "bot", text: "Opening WhatsApp…" });
    }
    return add({
      from: "bot",
      text: "Try: dates • fee • venue • committees • register • founders • staff lookups • Instagram • Linktree",
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
              <button onClick={() => { setInput("Committees"); setTimeout(send, 0); }} className="text-xs rounded-full px-3 py-1 bg-white/15">Committees</button>
              <button onClick={() => { setInput("Register"); setTimeout(send, 0); }} className="text-xs rounded-full px-3 py-1 bg-white/15">Register</button>
              <button onClick={() => { setInput("Instagram"); setTimeout(send, 0); }} className="text-xs rounded-full px-3 py-1 bg-white/15">Instagram</button>
              <button onClick={() => { setInput("Linktree"); setTimeout(send, 0); }} className="text-xs rounded-full px-3 py-1 bg-white/15">Linktree</button>
              <Link to="/assistance" className="text-xs rounded-full px-3 py-1 bg-white/15">Open Assistance</Link>
            </div>

            <div className="p-3 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything… e.g., dates, fee, venue, committees"
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
          style={{ "--theme": THEME_BASE }}
        >
          <MessageCircle size={18} /> Talk to us
        </motion.button>
      )}
    </div>
  );
}

/* ---------- Footer ---------- */
function InlineFooter() {
  const CORE = useCorePartners();
  return (
    <footer className="mt-16 border-top border-white/10">
      {CORE.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="text-xs uppercase tracking-[0.28em] text-white/50 text-left sm:text-center mb-3">Partners</div>
          <div className="flex items-center justify-start sm:justify-center gap-6 flex-wrap">
            {CORE.map((p) => (
              <div key={`footer-${p.name}`} className="flex items-center gap-2 text-white/70">
                <img
                  src={p.logo}
                  alt={`${p.name} logo`}
                  className="h-6 w-6 object-contain opacity-90"
                  onError={(e) => (e.currentTarget.style.opacity = 0.35)}
                />
                <span className="text-xs">
                  <span className="text-white/60">{p.role}:</span> <span className="font-medium">{p.name}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-4 text-white/80">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="Noir"
            width="40"
            height="40"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            className="h-10 w-10 object-contain"
          />
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
          <a href={REGISTER_HREF} target="_blank" rel="noreferrer" className="block text-sm hover:underline">Register</a>
        </div>
        <div>
          <div className="font-semibold">Socials</div>
          <a href={IG_HREF} target="_blank" rel="noreferrer" className="block text-sm hover:underline">Instagram</a>
          <a href={LINKTREE_HREF} target="_blank" rel="noreferrer" className="block text-sm hover:underline">Linktree</a>
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

/* ---------- Brief Modal ---------- */
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

/* ---------- Prologue (Hero) ---------- */
// NOTE: Roman statues REMOVED from hero; background RomanLayer still active globally.
function Prologue() {
  return (
    <section className="relative isolate overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur">
      {/* soft glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-white/10 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-white/10 blur-3xl rounded-full" />

      <div className="relative z-10 px-6 md:px-10 pt-12 pb-14 text-center">
        <img
          src={LOGO_URL}
          alt="Noir"
          width="80"
          height="80"
          loading="eager"
          fetchpriority="high"
          decoding="async"
          className="h-20 w-20 mx-auto object-contain drop-shadow"
        />
        <h1 className="mt-6 text-[40px] md:text-[68px] leading-none font-black tracking-tight">NOIR&nbsp;MUN&nbsp;2025</h1>
        <div className="mt-3 inline-flex items-center gap-2 text-white/80">
          <Calendar size={16} /> {DATES_TEXT} • Faridabad
        </div>

        <div className="mt-3">
          <VenuePill />
        </div>

        <div className="mt-5 text-xl md:text-2xl font-semibold">
          <Gilded>Whispers Today, Echo Tomorrow</Gilded>
        </div>

        <HeroPartnersRibbon />

        <QuoteCard>
          In marble and laurel, discipline met rhetoric. Noir brings that precision to diplomacy — a modern pantheon where words shape order.
        </QuoteCard>

        <div className="mt-9 relative z-20 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href={REGISTER_HREF} target="_blank" rel="noreferrer" className="click-safe inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 px-6 py-3 text-white border border-white/20 w-full sm:w-auto justify-center">
            Secure your seat <ChevronRight size={18} />
          </a>
          <a href={EB_APPLY_HREF} target="_blank" rel="noreferrer" className="click-safe inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-6 py-3 text-white border border-white/20 w-full sm:w-auto justify-center" title="Apply for the Executive Board">
            EB Applications <ChevronRight size={18} />
          </a>
          <Link to="/signup" className="click-safe inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-6 py-3 text-white border border-white/20 w-full sm:w-auto justify-center">
            Sign Up
          </Link>
          <Link to="/assistance" className="click-safe inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-6 py-3 text-white border border-white/20 w-full sm:w-auto justify-center">
            MUN Assistance
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- Separate Countdown Section ---------- */
function CountdownSection() {
  const { past, d, h, m, s } = useCountdown(TARGET_DATE_IST);
  return (
    <section className="mt-8 rounded-[28px] border border-white/12 p-6 md:p-10 bg-white/[0.04] backdrop-blur-sm ring-1 ring-white/5 text-center">
      <SectionHeading
        kicker="Chapter 0"
        title="Countdown to Noir"
        icon={<Sparkles size={20} className="text-white/70" />}
      />
      {!past ? (
        <div className="mt-4 flex gap-5 flex-wrap justify-center">
          <BigBlock label="Days" value={d} />
          <BigBlock label="Hours" value={h} />
          <BigBlock label="Mins" value={m} />
          <BigBlock label="Secs" value={s} />
        </div>
      ) : (
        <div className="mt-4 text-white/80">See you at Noir MUN — thank you!</div>
      )}
    </section>
  );
}

/* ---------- Councils grid ---------- */
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
      <div className="text-center text-left sm:text-center">
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
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: "inset 0 0 140px rgba(255,255,255,.09)" }} />
              <div className="absolute inset-0 rounded-[26px] border border-yellow-200/0 group-hover:border-yellow-100/25 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </section>
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
    document.documentElement.style.setProperty("--theme", THEME_BASE);
    document.body.style.background = THEME_BASE;
  }, []);

  return (
    <div className="min-h-screen text-white relative">
      {/* Global background (theme + roman layer) */}
      <Atmosphere />
      <RomanLayer />
      <motion.div className="pointer-events-none fixed -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" style={{ y: yHalo }} />
      <motion.div className="pointer-events-none fixed -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" style={{ y: yHalo }} />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-gradient-to-b from-[#000026]/60 to-transparent backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-3 flex-shrink-0 min-w-0" style={{ whiteSpace: "nowrap" }}>
            <img
              src={LOGO_URL}
              alt="Noir"
              width="36"
              height="36"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              className="h-9 w-9 object-contain"
            />
            <span className="font-semibold tracking-wide">Noir MUN</span>
          </div>

          {/* Mobile Register pill — appears BETWEEN logo and hamburger */}
          <a
            href={REGISTER_HREF}
            target="_blank"
            rel="noreferrer"
            className="sm:hidden ml-auto mr-2 inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-sm border border-white/20 bg-white/10"
          >
            Register
            <ChevronRight size={14} />
          </a>

          {/* Desktop nav */}
          <nav className="nav-bar hidden sm:flex ml-auto">
            <a href={REGISTER_HREF} target="_blank" rel="noreferrer" className="nav-pill nav-pill--primary">
              Register <ChevronRight size={16} style={{ marginLeft: 6 }} />
            </a>
            <a href={EB_APPLY_HREF} target="_blank" rel="noreferrer" className="nav-pill" title="Apply for the Executive Board">
              EB Applications <ChevronRight size={16} style={{ marginLeft: 6 }} />
            </a>
            <a href={VENUE_HOTEL_URL} target="_blank" rel="noreferrer" className="nav-pill" title={`Conference Venue — ${VENUE.name}`}>
              Venue <ExternalLink size={14} style={{ marginLeft: 6 }} />
            </a>
            <a href={VENUE.location} target="_blank" rel="noreferrer" className="nav-pill nav-pill--ghost" title="Open in Google Maps">
              Maps <Navigation size={14} style={{ marginLeft: 6 }} />
            </a>
            <Link to="/login" className="nav-pill nav-pill--ghost">Login</Link>
            <Link to="/signup" className="nav-pill">Sign Up</Link>
            <Link to="/assistance" className="nav-pill">Assistance</Link>
            <Link to="/legal" className="nav-pill">Legal</Link>
          </nav>

          {/* Hamburger (mobile) */}
          <button
            className="sm:hidden rounded-2xl border border-white/20 p-2 ml-0"
            aria-label="Menu"
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Partner ticker directly under header */}
        <PartnerTicker />
      </header>

      {/* Mobile Menu */}
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
                <a onClick={() => setMenuOpen(false)} href={REGISTER_HREF} target="_blank" rel="noreferrer" className="menu-item menu-item--primary">
                  Register <ChevronRight size={16} className="inline-block ml-1" />
                </a>
                <a onClick={() => setMenuOpen(false)} href={EB_APPLY_HREF} target="_blank" rel="noreferrer" className="menu-item" title="Apply for the Executive Board">
                  EB Applications <ChevronRight size={16} className="inline-block ml-1" />
                </a>
                <a onClick={() => setMenuOpen(false)} href={VENUE_HOTEL_URL} target="_blank" rel="noreferrer" className="menu-item">
                  Venue <ExternalLink size={16} className="inline-block ml-1" />
                </a>
                <a onClick={() => setMenuOpen(false)} href={VENUE.location} target="_blank" rel="noreferrer" className="menu-item">
                  Open in Maps <Navigation size={16} className="inline-block ml-1" />
                </a>
                <Link onClick={() => setMenuOpen(false)} to="/login" className="menu-item">Login</Link>
                <Link onClick={() => setMenuOpen(false)} to="/signup" className="menu-item">Sign Up</Link>
                <Link onClick={() => setMenuOpen(false)} to="/assistance" className="menu-item">Assistance</Link>
                <Link onClick={() => setMenuOpen(false)} to="/legal" className="menu-item">Legal</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Narrative */}
      <main className="mx-auto max-w-7xl px-4 py-10">
        <Prologue />
        <CountdownSection />

        <section className="mt-16 rounded-[28px] border border-white/12 p-6 md:p-10 bg-white/[0.04] backdrop-blur-sm ring-1 ring-white/5">
          <SectionHeading kicker="Chapter I" title="The Origin" icon={<Shield size={20} className="text-white/70" />} />
          <div className="text-white/80 leading-relaxed">
            Born from a love of design and debate, Noir is led by a council of builders and diplomats.
            <LaurelDivider />
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Landmark size={16} /> <em>Ordo • Disciplina • Dignitas</em>
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-[28px] border border-white/12 p-6 md:p-10 bg-white/[0.04] backdrop-blur-sm ring-1 ring-white/5">
          <SectionHeading kicker="Chapter II" title="The Pantheon of Councils" icon={<Columns size={20} className="text-white/70" />} />
          <div className="text-white/80">Each chamber upholds a different creed — strategy, justice, history, negotiation. Choose your arena, study the agenda, and step into the role. Tap a poster to open its dossier.</div>
          <PosterWall onOpen={(i) => setBriefIdx(i)} />
        </section>

        <PartnersSection />
        <ItinerarySection />

        <section className="mt-16 rounded-[28px] border border-white/12 p-8 md:p-10 bg-white/[0.04] text-center backdrop-blur-sm">
          <div className="text-[28px] md:text-[36px] font-extrabold leading-tight">
            <Gilded>The council that will echo tomorrow.</Gilded>
          </div>
          <div className="mt-2 text-white/70">Two days. One stage. Bring your discipline, your design, your diplomacy.</div>
          <a href={REGISTER_HREF} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 px-6 py-3 text-white border border-white/20">
            Register Now <ChevronRight size={18} />
          </a>
        </section>
      </main>

      <InlineFooter />
      <TalkToUs />

      <BriefModal idx={briefIdx} onClose={() => setBriefIdx(null)} />

      {/* inline styles */}
      <style>{`
        :root { --theme: ${THEME_BASE}; }
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
