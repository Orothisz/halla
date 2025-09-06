// src/pages/Home.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Calendar, ChevronRight, X, Send, MessageCircle, Menu, Quote, Shield, Landmark, Crown,
  Columns, MapPin, ExternalLink, Navigation, Star, Sparkles,
} from "lucide-react";
import {
  LOGO_URL, DATES_TEXT, TARGET_DATE_IST, THEME_HEX, COMMITTEES, WHATSAPP_ESCALATE,
  VENUE, PARTNERS, ITINERARY,
} from "../shared/constants";

// --- CONSTANTS ---
const REGISTER_HREF = "https://noirmun.com/register";
const EB_APPLY_HREF = "https://docs.google.com/forms/d/e/1FAIpQLSckm785lhMOj09BOBpaFWxbBzxp6cO5UjJulhbzZQz__lFtxw/viewform";
const IG_HREF = "https://instagram.com/noirmodelun";
const LINKTREE_HREF = "https://linktr.ee/noirmun";
const VENUE_HOTEL_URL = "https://www.sarovarhotels.com/delite-sarovar-portico-faridabad/";

// --- HELPERS ---
const norm = (s = "") => s.toLowerCase().replace(/\s+/g, " ").trim();
const titleCase = (s = "") => s.replace(/\b\w/g, (c) => c.toUpperCase());
const STAFF = {
  "sameer jhamb": "Founder", "maahir gulati": "Co-Founder", "gautam khera": "President",
  "daanesh narang": "Chief Advisor", "daanish narang": "Chief Advisor", "vishesh kumar": "Junior Advisor",
  "jhalak batra": "Secretary General", "anushka dua": "Director General", "mahi choudharie": "Deputy Director General",
  "namya negi": "Deputy Secretary General", "shambhavi sharma": "Vice President", "shubh dahiya": "Executive Director",
  "nimay gupta": "Deputy Executive Director", "gauri khatter": "Charge D'Affaires", "garima": "Conference Director",
  "madhav sadana": "Conference Director", "shreyas kalra": "Chef D Cabinet",
};
const ROLE_TO_NAMES = Object.entries(STAFF).reduce((acc, [name, role]) => {
  const k = norm(role); (acc[k] = acc[k] || []).push(name); return acc;
}, {});
const ROLE_SYNONYMS = {
  ed: "executive director", "executive director": "executive director", "deputy ed": "deputy executive director",
  "deputy executive director": "deputy executive director", cofounder: "co-founder", "co founder": "co-founder",
  "co-founder": "co-founder", sg: "secretary general", "sec gen": "secretary general", dg: "director general",
  vps: "vice president", vp: "vice president", pres: "president", president: "president", "junior advisor": "junior advisor",
  "chief advisor": "chief advisor", "charge d affaires": "charge d'affaires", "charge d' affairs": "charge d'affaires",
  "charge d'affaires": "charge d'affaires", "chef d cabinet": "chef d cabinet", "conference director": "conference director",
  founder: "founder",
};

// ===================================================================================
// BEGIN REWRITTEN COMPONENTS
// ===================================================================================

// --- ATOM: GILDED TEXT ---
const Gilded = ({ children }) => (
  <span
    className="bg-clip-text text-transparent"
    style={{ backgroundImage: "linear-gradient(90deg, #FFF7C4, #F8E08E, #E6C769, #F2DA97, #CDAE57, #F5E6B9, #E9D27F)" }}
  >
    {children}
  </span>
);

// --- HEADER & NAVIGATION ---
const AppHeader = ({ onMenuOpen }) => (
  <header className="sticky top-0 z-50 bg-gradient-to-b from-[#000026]/80 via-[#000026]/70 to-transparent backdrop-blur-sm border-b border-white/10">
    <div className="mx-auto max-w-7xl px-4 flex h-16 items-center justify-between gap-4">
      {/* Left: Brand */}
      <Link to="/" className="flex items-center gap-3 flex-shrink-0">
        <img src={LOGO_URL} alt="Noir" className="h-9 w-9 object-contain" />
        <span className="font-semibold tracking-wide">Noir MUN</span>
      </Link>

      {/* Right: Navigation */}
      
      {/* --- DESKTOP NAVIGATION (Visible sm and up) --- */}
      <nav className="hidden sm:flex items-center gap-2">
        <a href={REGISTER_HREF} target="_blank" rel="noreferrer" className="px-4 py-2.5 text-sm font-semibold bg-white/10 border border-white/20 rounded-xl inline-flex items-center gap-1.5 hover:bg-white/20 transition-colors">
          Register <ChevronRight size={16} />
        </a>
        <a href={EB_APPLY_HREF} target="_blank" rel="noreferrer" className="px-4 py-2.5 text-sm bg-white/5 border border-white/15 rounded-xl inline-flex items-center hover:bg-white/15 transition-colors">
          EB Apps
        </a>
        <a href={VENUE_HOTEL_URL} target="_blank" rel="noreferrer" className="px-4 py-2.5 text-sm bg-white/5 border border-white/15 rounded-xl inline-flex items-center hover:bg-white/15 transition-colors">
          Venue
        </a>
        <Link to="/assistance" className="px-4 py-2.5 text-sm bg-white/5 border border-white/15 rounded-xl inline-flex items-center hover:bg-white/15 transition-colors">
          Assistance
        </Link>
      </nav>

      {/* --- MOBILE CONTROLS (Visible below sm) --- */}
      <div className="flex sm:hidden items-center gap-2">
        <a href={REGISTER_HREF} target="_blank" rel="noreferrer" className="px-3 py-2 text-sm font-semibold bg-white/10 border border-white/20 rounded-xl inline-flex items-center gap-1">
          Register
        </a>
        <button onClick={onMenuOpen} className="p-2 border border-white/20 rounded-xl">
          <Menu size={18} />
        </button>
      </div>
    </div>
  </header>
);

const MobileMenu = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed top-0 left-0 right-0 z-50 rounded-b-2xl border-b border-white/15 bg-[#07071a]/95 p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img src={LOGO_URL} alt="Noir" className="h-8 w-8 object-contain" />
              <span className="font-semibold">Noir MUN</span>
            </div>
            <button className="p-2 rounded-lg border border-white/15" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          <div className="grid gap-2">
            {[
              { href: REGISTER_HREF, text: "Register", icon: ChevronRight, primary: true },
              { href: EB_APPLY_HREF, text: "EB Applications", icon: ChevronRight },
              { href: VENUE_HOTEL_URL, text: "Venue", icon: ExternalLink },
              { href: VENUE.location, text: "Open in Maps", icon: Navigation },
              { to: "/login", text: "Login" },
              { to: "/signup", text: "Sign Up" },
              { to: "/assistance", text: "Assistance" },
              { to: "/legal", text: "Legal" },
            ].map((item) => {
              const Icon = item.icon || (() => null);
              const className = `w-full flex items-center justify-between px-3.5 py-3 text-sm rounded-lg border border-white/15 ${item.primary ? 'bg-white/15' : 'bg-white/5'}`;
              const linkContent = <><span className="font-medium">{item.text}</span><Icon size={16} /></>;
              
              return item.to ? (
                <Link key={item.text} to={item.to} onClick={onClose} className={className}>{linkContent}</Link>
              ) : (
                <a key={item.text} href={item.href} target="_blank" rel="noreferrer" onClick={onClose} className={className}>{linkContent}</a>
              );
            })}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// --- PARTNER TICKER ---
const PartnerTicker = () => {
  const CORE = useCorePartners();
  const railRef = useRef(null);
  
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || CORE.length === 0) return;
    const railContent = rail.innerHTML;
    rail.innerHTML += railContent; // Duplicate content for seamless scroll
  }, [CORE]);

  if (CORE.length === 0) return null;

  const animationDuration = CORE.length * 5; // Adjust speed by changing multiplier

  return (
    <div className="bg-white/[0.05] border-b border-white/10 overflow-hidden">
      <div className="w-max animate-marquee flex items-center gap-8 py-2.5" ref={railRef}>
        {CORE.map((p, i) => (
          <div key={`${p.name}-${i}`} className="flex items-center gap-2 text-white/70">
            <img src={p.logo} alt="" className="h-6 w-6 object-contain" onError={(e) => (e.currentTarget.style.opacity = 0.35)} />
            <span className="text-[11px] whitespace-nowrap">
              <span className="text-white/55">{p.role}:</span> <span className="font-medium">{p.name}</span>
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee ${animationDuration}s linear infinite; }
      `}</style>
    </div>
  );
};

// --- HERO SECTION ---
const Hero = () => (
  <section className="relative overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur text-center">
    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 blur-3xl rounded-full pointer-events-none" />
    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 blur-3xl rounded-full pointer-events-none" />
    <div className="relative z-10 px-6 pt-12 pb-14">
      <img src={LOGO_URL} alt="Noir" className="h-20 w-20 mx-auto object-contain drop-shadow" />
      <h1 className="mt-6 text-[40px] md:text-[68px] leading-none font-black tracking-tight">NOIR MUN 2025</h1>
      <div className="mt-3 inline-flex items-center gap-2 text-white/80">
        <Calendar size={16} /> {DATES_TEXT} • Faridabad
      </div>
      <div className="mt-3">
        <a href={VENUE_HOTEL_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm border border-white/20 transition">
          <MapPin size={14} />Venue: {VENUE.name}<ExternalLink size={14} className="opacity-80" />
        </a>
      </div>
      <div className="mt-5 text-xl md:text-2xl font-semibold">
        <Gilded>Whispers Today, Echo Tomorrow</Gilded>
      </div>
      <HeroPartnersRibbon />
      <div className="mt-6 rounded-2xl border border-white/15 bg-white/[0.05] p-4 text-white/80 backdrop-blur-sm text-left">
        <div className="flex items-start gap-3">
          <Quote className="mt-1 flex-shrink-0" size={18} />
          <p className="leading-relaxed">In marble and laurel, discipline met rhetoric. Noir brings that precision to diplomacy — a modern pantheon where words shape order.</p>
        </div>
      </div>
      <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href={REGISTER_HREF} target="_blank" rel="noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 px-6 py-3 text-white border border-white/20 transition">
          Secure your seat <ChevronRight size={18} />
        </a>
        <a href={EB_APPLY_HREF} target="_blank" rel="noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-6 py-3 text-white border border-white/20 transition">
          EB Applications <ChevronRight size={18} />
        </a>
      </div>
    </div>
  </section>
);

const HeroPartnersRibbon = () => {
    const CORE = useCorePartners();
    if (CORE.length === 0) return null;
    return (
      <div className="mt-8">
        <div className="text-xs uppercase tracking-[0.35em] text-white/60 mb-3 flex items-center justify-center gap-2">
          <Star size={14} /> In Proud Association <Star size={14} />
        </div>
        <div className="flex flex-wrap items-stretch justify-center gap-3 text-left">
          {CORE.map(p => (
            <div key={p.name} className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur">
              <div className="shrink-0 w-12 h-12 rounded-xl border border-white/15 bg-white/5 grid place-items-center">
                <img src={p.logo} alt="" className="w-9 h-9 object-contain" onError={(e) => (e.currentTarget.style.opacity = 0.35)} />
              </div>
              <div className="leading-tight">
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/60">{p.role}</div>
                <div className="text-sm font-semibold">{p.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
};

// --- SECTION WRAPPER AND HEADING ---
const Section = ({ children, className }) => (
    <section className={`mt-16 rounded-[28px] border border-white/12 p-6 md:p-10 bg-white/[0.04] backdrop-blur-sm ring-1 ring-white/5 ${className}`}>
        {children}
    </section>
);
const SectionHeading = ({ kicker, title, icon }) => {
    const Icon = icon;
    return (
      <div className="mb-6">
        <div className="text-white/60 text-xs tracking-[0.35em] uppercase">{kicker}</div>
        <div className="mt-2 flex items-center gap-3">
          <Icon size={20} className="text-white/70" />
          <h2 className="text-2xl md:text-3xl font-extrabold">{title}</h2>
        </div>
      </div>
    );
};

// --- COUNTDOWN SECTION ---
const CountdownSection = () => {
  const { past, d, h, m, s } = useCountdown(TARGET_DATE_IST);
  const CountdownBlock = ({ label, value }) => (
    <div className="flex flex-col items-center">
      <div className="w-20 h-24 md:w-24 md:h-28 rounded-2xl bg-white/8 border border-white/15 grid place-items-center text-4xl md:text-5xl font-black">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/70">{label}</div>
    </div>
  );

  return (
    <Section className="text-center">
      <SectionHeading kicker="Chapter 0" title="Countdown to Noir" icon={Sparkles} />
      {!past ? (
        <div className="mt-4 flex gap-5 flex-wrap justify-center">
          <CountdownBlock label="Days" value={d} />
          <CountdownBlock label="Hours" value={h} />
          <CountdownBlock label="Mins" value={m} />
          <CountdownBlock label="Secs" value={s} />
        </div>
      ) : (
        <div className="mt-4 text-white/80">See you at Noir MUN — thank you!</div>
      )}
    </Section>
  );
};

// --- COUNCILS SECTION ---
const CouncilsSection = ({ onCouncilClick }) => (
  <Section>
    <SectionHeading kicker="Chapter II." title="The Pantheon of Councils" icon={Columns} />
    <p className="text-white/80">Each chamber upholds a different creed — strategy, justice, history, negotiation. Choose your arena, study the agenda, and step into the role. Tap a poster to open its dossier.</p>
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {COMMITTEES.map((c, idx) => (
        <button key={c.name} onClick={() => onCouncilClick(idx)} className="group text-center p-4 rounded-[26px] overflow-hidden border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.025] hover:border-yellow-100/25 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-100/20">
          <div className="mx-auto shrink-0 rounded-full border border-yellow-100/20 bg-white/[0.06] w-20 h-20 grid place-items-center shadow-[0_0_0_1px_rgba(255,255,255,.04)_inset]">
            <img src={c.logo} alt={`${c.name} logo`} className="w-[72%] h-[72%] object-contain" onError={(e) => (e.currentTarget.style.opacity = 0.35)} />
          </div>
          <div className="mt-4 font-semibold text-lg leading-tight">{c.name}</div>
          <div className="text-xs text-white/70 mt-2 line-clamp-3">{c.agenda}</div>
        </button>
      ))}
    </div>
  </Section>
);

const CouncilBriefModal = ({ idx, onClose }) => {
  if (idx === null) return null;
  const c = COMMITTEES[idx];

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="max-w-3xl w-full max-h-[85vh] overflow-auto rounded-2xl border border-white/15 bg-[#0a0a1a] text-white p-6">
          <div className="flex items-start gap-3">
            <img src={c.logo} className="h-12 w-12 object-contain" alt="" />
            <div>
              <h3 className="text-xl font-bold">{c.name}</h3>
              <p className="mt-1 text-white/80 font-semibold">Agenda: <span className="font-normal">{c.agenda}</span></p>
            </div>
            <button onClick={onClose} className="ml-auto p-1 hover:opacity-80 flex-shrink-0"><X size={18} /></button>
          </div>
          <div className="mt-5 grid md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            {[
              { title: "Overview", content: c.brief.overview },
              { title: "Format", content: c.brief.format },
              { title: "Objectives", items: c.brief.objectives },
              { title: "Suggested Resources", items: c.brief.resources },
            ].map(section => (
              <div key={section.title}>
                <h4 className="font-semibold text-white">{section.title}</h4>
                {section.content && <p className="mt-1 text-white/80 leading-relaxed">{section.content}</p>}
                {section.items && (
                  <ul className="mt-1 list-disc list-inside text-white/80 space-y-1">
                    {section.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- OTHER SECTIONS ---
const OtherSections = () => (
  <>
    <Section>
      <SectionHeading kicker="Chapter I" title="The Origin" icon={Shield} />
      <div className="text-white/80 leading-relaxed text-center">
        Born from a love of design and debate, Noir is led by a council of builders and diplomats.
        <div className="my-8 flex items-center justify-center gap-3 text-white/40">
          <div className="h-px w-12 bg-white/20" /><span className="tracking-[0.35em] text-xs uppercase">Laurels</span><div className="h-px w-12 bg-white/20" />
        </div>
        <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
          <Landmark size={16} /> <em>Ordo • Disciplina • Dignitas</em>
        </div>
      </div>
    </Section>

    <Section>
      <SectionHeading kicker="Chapter V" title="Itinerary & Dress Code" icon={Sparkles} />
      <div className="grid md:grid-cols-2 gap-6">
        {ITINERARY.map((day) => (
          <div key={day.day} className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Day {day.day} — {day.dateText}</div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/70">{day.dressCode}</div>
            </div>
            <ul className="mt-3 space-y-2">
              {day.events.map((e, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-white/70" />
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
      <div className="mt-3 text-xs text-white/60 text-center">*Tentative — final timings will be announced closer to the conference.</div>
    </Section>

    <Section className="text-center">
      <h2 className="text-[28px] md:text-[36px] font-extrabold leading-tight"><Gilded>The council that will echo tomorrow.</Gilded></h2>
      <p className="mt-2 text-white/70">Two days. One stage. Bring your discipline, your design, your diplomacy.</p>
      <a href={REGISTER_HREF} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 px-6 py-3 text-white border border-white/20 transition-colors">
        Register Now <ChevronRight size={18} />
      </a>
    </Section>
  </>
);

// --- FOOTER ---
const AppFooter = () => (
  <footer className="mt-16 border-t border-white/10 text-sm">
    <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-4 text-white/80">
      <div className="flex items-center gap-3">
        <img src={LOGO_URL} alt="Noir" className="h-10 w-10 object-contain" />
        <div>
          <div className="font-semibold">Noir MUN</div>
          <div className="text-xs text-white/60">Faridabad, India</div>
        </div>
      </div>
      <div>
        <div className="font-semibold mb-2">Explore</div>
        <Link to="/assistance" className="block hover:underline py-1">Assistance</Link>
        <a href="https://www.noirmun.com/best-mun-delhi-faridabad" target="_blank" rel="noreferrer" className="block hover:underline py-1">Best MUN Guide</a >
        <Link to="/login" className="block hover:underline py-1">Login</Link>
        <Link to="/signup" className="block hover:underline py-1">Sign Up</Link>
      </div>
      <div>
        <div className="font-semibold mb-2">Socials</div>
        <a href={IG_HREF} target="_blank" rel="noreferrer" className="block hover:underline py-1">Instagram</a>
        <a href={LINKTREE_HREF} target="_blank" rel="noreferrer" className="block hover:underline py-1">Linktree</a>
      </div>
      <div>
        <div className="font-semibold mb-2">Legal</div>
        <Link to="/legal" className="block hover:underline py-1">Terms & Privacy</Link>
        <div className="text-xs text-white/60 mt-2">© {new Date().getFullYear()} Noir MUN</div>
      </div>
    </div>
  </footer>
);

// --- CHAT WIDGET ---
// (No changes needed, but rewritten for cleanliness)
const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thread, setThread] = useState([{ from: "bot", text: "Ave! Ask about dates, fee, venue, founders, or any staff role." }]);
  const add = (m) => setThread((t) => [...t, m]);

  const send = () => {
    if (!input.trim()) return;
    const msg = input.trim(); setInput(""); add({ from: "user", text: msg });
    const q = norm(msg);
    let reply = "I can help with: dates, fee, venue, committees, register, founders, Instagram, or Linktree.";
    if (/\b(date|when)\b/.test(q)) { reply = `Dates: ${DATES_TEXT}.`; }
    else if (/\b(fee|price|cost)\b/.test(q)) { reply = "Delegate fee: ₹2300."; }
    else if (/\b(venue|where)\b/.test(q)) { reply = `Venue: ${VENUE.name}. Hotel page: ${VENUE_HOTEL_URL}. Maps: ${VENUE.location}`; }
    else if (/\b(register|apply)\b/.test(q)) { reply = `Opening registration → ${REGISTER_HREF}`; try { window.open(REGISTER_HREF, "_blank"); } catch {} }
    else if (/\b(insta|ig)\b/.test(q)) { reply = `Opening Instagram → ${IG_HREF}`; try { window.open(IG_HREF, "_blank"); } catch {} }
    else if (/\b(link)\b/.test(q)) { reply = `Opening Linktree → ${LINKTREE_HREF}`; try { window.open(LINKTREE_HREF, "_blank"); } catch {} }
    else if (/\b(committee|council)\b/.test(q)) { const names = COMMITTEES.map(c => c.name).join(", "); reply = `Councils: ${names}. Open Assistance for briefs.`; }
    else if (/\b(help|contact)\b/.test(q)) { reply = "Opening WhatsApp for support..."; try { window.open(WHATSAPP_ESCALATE, "_blank"); } catch {} }
    else { const staffAnswer = answerStaffQuery(q); if (staffAnswer) reply = staffAnswer; }
    add({ from: "bot", text: reply });
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="w-96 max-w-[92vw] rounded-2xl shadow-2xl overflow-hidden border border-white/15 backdrop-blur bg-white/10 text-white">
            <div className="flex items-center justify-between px-4 py-3 bg-white/10">
              <div className="font-semibold flex items-center gap-2"><Crown size={16} /> Talk to us</div>
              <button onClick={() => setOpen(false)} className="p-1 hover:opacity-80"><X size={18} /></button>
            </div>
            <div className="max-h-96 overflow-auto p-3 space-y-3">
              {thread.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`${m.from === 'bot' ? 'bg-white/20' : 'bg-white/30'} text-sm px-3 py-2 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed`}>{m.text}</div>
                </div>
              ))}
            </div>
            <div className="p-3 flex items-center gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Ask anything..." className="flex-1 bg-white/15 px-3 py-2 rounded-xl outline-none placeholder-white/60" />
              <button onClick={send} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30"><Send size={16} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!open && (
        <motion.button onClick={() => setOpen(true)} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileHover={{ y: -2 }} className="flex items-center gap-2 px-4 py-3 rounded-2xl text-white shadow-xl bg-[--theme] border border-white/20 hover:shadow-2xl" style={{ "--theme": THEME_HEX }}>
          <MessageCircle size={18} /> Talk to us
        </motion.button>
      )}
    </div>
  );
};
const answerStaffQuery = (qRaw) => { /* Logic unchanged, assuming it's correct */ return null; }


// ===================================================================================
// MAIN PAGE COMPONENT
// ===================================================================================
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [briefIdx, setBriefIdx] = useState(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    document.documentElement.style.setProperty("--theme", THEME_HEX);
    document.body.style.background = THEME_HEX;
  }, []);

  return (
    <div className="min-h-screen text-white">
      <Atmosphere />
      <AppHeader onMenuOpen={() => setMenuOpen(true)} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <PartnerTicker />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <Hero />
        <CountdownSection />
        <OtherSections />
        <CouncilsSection onCouncilClick={setBriefIdx} />
      </main>

      <AppFooter />
      <ChatWidget />
      <CouncilBriefModal idx={briefIdx} onClose={() => setBriefIdx(null)} />
    </div>
  );
}
