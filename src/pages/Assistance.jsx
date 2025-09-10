// src/pages/Assistance.jsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  LOGO_URL,
  WHATSAPP_ESCALATE,
  DATES_TEXT,
  COMMITTEES,
  THEME_HEX, // palette identical to Home
} from "../shared/constants";
import {
  Sparkles, ExternalLink, Bot, Send, BookOpen, Compass, Award,
  Menu, X, ShieldCheck, Info, Brain, Gauge, Check, MapPin, Calendar as CalIcon
} from "lucide-react";

/* =========================================================
 * Shared palette tokens (kept for panels/buttons)
 * =======================================================*/
const GOLD = "#d6c089";
const GOLD_SOFT = "rgba(214,192,137,.45)";

function setCSSVars() {
  const root = document.documentElement;
  root.style.setProperty("--noir-theme", THEME_HEX || "#0a0a1a");
  root.style.setProperty("--noir-bg0", "#090918");
  root.style.setProperty("--noir-bg1", "#0D0D1F");
  root.style.setProperty("--noir-bg2", "#141429");
  root.style.setProperty("--noir-ink", "rgba(255,255,255,.86)");
  root.style.setProperty("--noir-ink-dim", "rgba(255,255,255,.72)");
  root.style.setProperty("--noir-stroke", "rgba(255,255,255,.12)");
  root.style.setProperty("--noir-stroke-soft", "rgba(255,255,255,.08)");
  root.style.setProperty("--noir-glass", "rgba(255,255,255,.06)");
  root.style.setProperty("--noir-glass-2", "rgba(255,255,255,.10)");
  root.style.setProperty("--noir-gold", GOLD);
}

/* =========================================================
 * Background: EXACTLY like Home.jsx (Atmosphere + RomanLayer)
 * =======================================================*/
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

function RomanLayer() {
  const { scrollYProgress } = useScroll();
  const yBust = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const yColumn = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const yLaurel = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const IMG_LEFT  = "https://noirmun.com/roman1.png";
  const IMG_RIGHT = "https://noirmun.com/roman%202.png";
  const IMG_CENTER= "https://noirmun.com/roman3.png";

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

      {/* Parallax statues */}
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

/* =========================================================
 * Gilded panel + Pill
 * =======================================================*/
function Gilded({ children, className = "" }) {
  return (
    <div
      className={`relative rounded-2xl ${className}`}
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.03))",
        border: "1px solid var(--noir-stroke)",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,.04), 0 10px 30px rgba(0,0,0,.35)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ boxShadow: `inset 0 0 0 1px ${GOLD_SOFT}` }}
      />
      {children}
    </div>
  );
}

function Pill({ children, className = "", as = "button", ...rest }) {
  const Comp = as;
  return (
    <Comp
      {...rest}
      className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition select-none ${className}`}
      style={{
        color: "var(--noir-ink)",
        background: "var(--noir-glass)",
        border: "1px solid var(--noir-stroke)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.05)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD_SOFT)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--noir-stroke)")}
    >
      {children}
    </Comp>
  );
}

/* =========================================================
 * Tabs
 * =======================================================*/
const TABS = [
  { key: "chat", label: "Chat", icon: <Bot size={14} /> },
  { key: "rop", label: "ROP", icon: <BookOpen size={14} /> },
  { key: "quiz", label: "Quiz", icon: <Compass size={14} /> },
  { key: "rubric", label: "Rubric", icon: <Award size={14} /> },
];

/* =========================================================
 * Cloud ask
 * =======================================================*/
async function cloudAsk(history, userText) {
  const msgs = [
    ...history.slice(-4).map((m) => ({
      role: m.from === "user" ? "user" : "assistant",
      content: m.text,
    })),
    { role: "user", content: userText },
  ];
  const r = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: msgs }),
  });
  const j = await r.json().catch(() => ({}));
  const hasSources = Array.isArray(j.sources) && j.sources.length > 0;
  let citeBlock = "";
  if (hasSources) {
    const lines = j.sources.slice(0, 5).map((s) => `• ${s.title} — ${s.url}`).join("\n");
    citeBlock = `\n\nSources:\n${lines}`;
  }
  return {
    text: (j.answer || "Sorry, I couldn’t find much for that.") + citeBlock,
    hasSources,
  };
}

/* =========================================================
 * Welcome
 * =======================================================*/
function WelcomeModal({ open, onClose, onUsePrompt }) {
  if (!open) return null;
  const prompts = [
    "Summarise today’s top UN story in 4 lines.",
    "Compare UNHRC vs UNGA mandates.",
    "Best Mod Cauc topics for cyber norms (UNGA).",
  ];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full sm:max-w-md rounded-2xl border p-4"
        style={{
          background: "rgba(16,16,34,.96)",
          borderColor: "var(--noir-stroke)",
          boxShadow: `0 0 0 1px ${GOLD_SOFT} inset`,
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Bot size={18} />
          <div className="font-semibold tracking-wide">Meet WILT+</div>
        </div>
        <div className="text-sm text-white/80">Your web-smart MUN copilot — searches, reads, cites.</div>
        <div className="mt-3 grid gap-2">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => onUsePrompt(p)}
              className="text-left rounded-lg px-3 py-2 transition"
              style={{
                background: "var(--noir-glass)",
                border: "1px solid var(--noir-stroke)",
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[11px] text-white/60 flex items-center gap-1">
            <Info size={14} /> Auto-decides when to search vs. use event facts.
          </div>
          <Pill onClick={onClose}>Start</Pill>
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================
 * Animated typing dots
 * =======================================================*/
function TypingDots() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-5">
        <span className="dot" />
        <span className="dot dot-2" />
        <span className="dot dot-3" />
      </div>
      <span className="text-[11px] uppercase tracking-wider text-white/45">thinking…</span>
      <style>{`
        .dot {
          position: absolute;
          left: 0; top: 8px; width: 6px; height: 6px; border-radius: 999px;
          background: rgba(255,255,255,.75);
          animation: noirDot 1.2s infinite ease-in-out;
        }
        .dot-2 { left: 10px; animation-delay: .15s; }
        .dot-3 { left: 20px; animation-delay: .30s; }
        @keyframes noirDot { 0%, 80%, 100% { transform: translateY(0); opacity:.6; } 40% { transform: translateY(-4px); opacity:1; } }
      `}</style>
    </div>
  );
}

/* =========================================================
 * Chat
 * =======================================================*/
function WILTChat() {
  const [thread, setThread] = useState([
    { from: "bot", text: "I’m WILT+. Ask Noir basics or world affairs — I can search and cite.\nTry: “Summarise today’s top UN story in 4 lines.”" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [verified, setVerified] = useState(false);

  const [showWelcome, setShowWelcome] = useState(true);
  useEffect(() => { setShowWelcome(true); }, []);

  const usePrompt = (p) => { setShowWelcome(false); send(p); };
  const closeWelcome = () => setShowWelcome(false);
  const push = (m) => setThread((t) => [...t, m]);

  const quicks = [
    "When is Noir MUN?",
    "Venue?",
    "Registration link",
    "Best Mod Cauc topics for UNGA (finance).",
    "Compare UNHRC vs UNGA mandates.",
    "Summarise today’s top UN story in 4 lines.",
  ];

  const send = async (preset) => {
    const v = (preset ?? input).trim();
    if (!v) return;
    push({ from: "user", text: v });
    setInput(""); setTyping(true);
    try {
      const r = await cloudAsk(thread, v);
      push({ from: "bot", text: r.text, source: r.hasSources ? "Web" : undefined });
      setVerified(r.hasSources);
    } catch {
      push({ from: "bot", text: "Couldn’t fetch that. Try again?" });
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/80 flex items-center gap-2">
          <Bot size={16} /> WILT+ Chat
        </div>
        <div className={`flex items-center gap-1 text-xs ${verified ? "text-emerald-300" : "text-white/55"}`}>
          <ShieldCheck size={14} />
          <span>{verified ? "Sources attached" : "Awaiting sources"}</span>
        </div>
      </div>

      {/* chat well */}
      <Gilded className="p-0 overflow-hidden">
        <div
          className="h-[50dvh] min-h-[260px] overflow-auto p-3"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.02))",
          }}
        >
          {thread.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] mb-2 px-3 py-2 rounded-xl whitespace-pre-wrap leading-relaxed break-words ${
                m.from === "bot" ? "border" : "ml-auto border"
              }`}
              style={{
                color: "var(--noir-ink)",
                background: m.from === "bot" ? "var(--noir-glass)" : "var(--noir-glass-2)",
                borderColor: "var(--noir-stroke)",
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,.04), 0 10px 20px rgba(0,0,0,.15)",
                backdropFilter: "blur(6px)",
              }}
            >
              {m.text}
              {m.source && (
                <div className="mt-1 text-[10px] uppercase tracking-wider text-white/65">
                  Source: {m.source}
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div
              className="max-w-[85%] mb-2 px-3 py-2 rounded-xl border"
              style={{ background: "var(--noir-glass)", borderColor: "var(--noir-stroke)" }}
            >
              <TypingDots />
            </div>
          )}
        </div>
      </Gilded>

      {/* uniform quick options */}
      <div className="flex flex-wrap gap-1">
        {quicks.map((t) => (
          <Pill key={t} onClick={() => send(t)}>{t}</Pill>
        ))}
      </div>

      <div className="flex gap-2 ios-safe-bottom">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask WILT+ anything…"
          inputMode="text"
          className="flex-1 px-3 py-2 rounded-lg outline-none border"
          style={{ background: "var(--noir-glass)", borderColor: "var(--noir-stroke)", color: "var(--noir-ink)" }}
        />
        <Pill onClick={() => send()} aria-label="Send">
          <Send size={16} /> Send
        </Pill>
      </div>

      <WelcomeModal open={showWelcome} onClose={closeWelcome} onUsePrompt={usePrompt} />
    </div>
  );
}

/* =========================================================
 * ROP
 * =======================================================*/
function ROPSim() {
  const [log, setLog] = useState([]);
  const [score, setScore] = useState(50);

  const motions = [
    { k: "Set Agenda", p: "Motion to set the agenda to …", vote: "Simple majority", val: +6 },
    { k: "Moderated Caucus", p: "Motion for a moderated caucus of X minutes, Y speaking time on …", vote: "Simple majority", val: +5 },
    { k: "Unmoderated Caucus", p: "Motion for an unmoderated caucus of X minutes.", vote: "Simple majority", val: +3 },
    { k: "Introduce Draft", p: "Motion to introduce draft resolution/working paper …", vote: "Simple majority", val: +7 },
    { k: "Close Debate", p: "Motion to close debate and move to voting.", vote: "2/3 majority", val: +8 },
  ];
  const points = [
    { k: "Point of Privilege", p: "For audibility/comfort; may interrupt.", val: +2 },
    { k: "Point of Inquiry", p: "Ask chair about procedure; no debate.", val: +3 },
    { k: "Point of Order", p: "Procedural violation; may interrupt.", val: +4 },
  ];

  const add = (txt, delta) => {
    setLog((l) => [txt, ...l].slice(0, 10));
    setScore((s) => Math.max(0, Math.min(100, s + delta)));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Gilded className="p-3">
        <div className="font-semibold mb-2">Motions</div>
        <div className="flex flex-col gap-2">
          {motions.map((m) => (
            <button
              key={m.k}
              onClick={() => add(`Raise: “${m.p}” • Voting: ${m.vote}`, m.val)}
              className="rounded-lg px-3 py-2 text-left transition border"
              style={{ background: "var(--noir-glass)", borderColor: "var(--noir-stroke)" }}
            >
              <div className="font-medium">{m.k}</div>
              <div className="text-xs text-white/70">Voting: {m.vote}</div>
            </button>
          ))}
        </div>
      </Gilded>

      <Gilded className="p-3">
        <div className="font-semibold mb-2">Points</div>
        <div className="flex flex-col gap-2">
          {points.map((p) => (
            <button
              key={p.k}
              onClick={() => add(`State: “${p.p}”`, p.val)}
              className="rounded-lg px-3 py-2 text-left transition border"
              style={{ background: "var(--noir-glass)", borderColor: "var(--noir-stroke)" }}
            >
              <div className="font-medium">{p.k}</div>
              <div className="text-xs text-white/70">{p.p}</div>
            </button>
          ))}
        </div>
      </Gilded>

      <Gilded className="p-3">
        <div className="font-semibold mb-2">Floor Confidence</div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--noir-stroke-soft)" }}>
          <motion.div
            className="h-full"
            style={{ background: `linear-gradient(90deg, ${GOLD}, rgba(255,255,255,.35))` }}
            initial={{ width: "0%" }}
            animate={{ width: score + "%" }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
          />
        </div>
        <div className="text-xs text-white/70 mt-2">{score}/100</div>
        <div className="mt-3 text-xs font-semibold text-white/80">Recent actions</div>
        <div className="mt-1 space-y-1 max-h-32 overflow-auto">
          {log.map((l, i) => (
            <div key={i} className="text-xs text-white/80 rounded-md px-2 py-1 border"
              style={{ background: "var(--noir-glass)", borderColor: "var(--noir-stroke)" }}
            >
              {l}
            </div>
          ))}
        </div>
      </Gilded>
    </div>
  );
}

/* =========================================================
 * Smarter Quiz (top 3, persona, tips)
 * =======================================================*/
const NAMES = {
  UNGA: "United Nations General Assembly (UNGA)",
  UNCSW: "United Nations Commission on the Status of Women (UNCSW)",
  AIPPM: "All India Political Parties Meet (AIPPM)",
  IPL: "Indian Premier League (IPL)",
  IP: "International Press (IP)",
  YT: "YouTube All Stars",
};

function Quiz() {
  const Q = [
    { k: "domain", q: "Space?", opts: [["global","Global policy"],["domestic","Indian politics"]] },
    { k: "tempo", q: "Tempo?", opts: [["formal","Formal"],["crisis","Fast/Crisis"]] },
    { k: "strength", q: "Core strength?", opts: [["writing","Writing"],["speaking","Speaking"],["both","Both"]] },
    { k: "negotiation", q: "Negotiation style?", opts: [["bloc","Consensus"],["attack","Adversarial"],["solo","Independent"]] },
    { k: "evidence", q: "Evidence comfort?", opts: [["high","High"],["mid","Medium"],["low","Low"]] },
    { k: "topic", q: "Topic lane?", opts: [["rights","Rights"],["econ","Economics"],["tech","Cyber/AI"],["media","Media"],["sports","Sports-biz"]] },
    { k: "press", q: "Like journalism/photo?", opts: [["yes","Yes"],["no","No"]] },
    { k: "sportbiz", q: "Auctions/trades?", opts: [["yes","Yes"],["no","No"]] },
    { k: "crisis", q: "Chaos tolerance?", opts: [["high","High"],["low","Low"]] },
    { k: "creative", q: "Creativity?", opts: [["high","High"],["mid","Medium"],["low","Low"]] },
  ];

  const [ans, setAns] = useState({});
  const [out, setOut] = useState(null);

  const compute = () => {
    const s = { UNGA:0, UNCSW:0, AIPPM:0, IPL:0, IP:0, YT:0 };
    const reasons = [];

    if (ans.domain === "global") { s.UNGA+=5; s.UNCSW+=4; reasons.push("Global policy fit"); }
    if (ans.domain === "domestic") { s.AIPPM+=5; s.IPL+=2; reasons.push("Domestic politics fit"); }

    if (ans.tempo === "formal") { s.UNGA+=3; s.UNCSW+=3; s.AIPPM+=2; reasons.push("Formal tempo"); }
    if (ans.tempo === "crisis") { s.YT+=3; s.IPL+=3; s.IP+=1; reasons.push("Crisis-friendly"); }
    if (ans.crisis === "high") { s.YT+=2; s.IPL+=2; reasons.push("High crisis tolerance"); }
    if (ans.crisis === "low")  { s.UNGA+=1; s.UNCSW+=1; }

    if (ans.strength === "writing") { s.UNCSW+=5; s.IP+=3; reasons.push("Strong writer"); }
    if (ans.strength === "speaking") { s.UNGA+=4; s.AIPPM+=4; s.IPL+=1; reasons.push("Strong speaker"); }
    if (ans.strength === "both") { s.UNGA+=3; s.AIPPM+=3; s.UNCSW+=3; reasons.push("Balanced"); }

    if (ans.negotiation === "bloc") { s.UNGA+=2; s.UNCSW+=2; reasons.push("Consensus builder"); }
    if (ans.negotiation === "attack") { s.AIPPM+=3; s.YT+=2; reasons.push("Adversarial play"); }
    if (ans.negotiation === "solo") { s.IP+=2; s.YT+=1; reasons.push("Independent"); }

    if (ans.evidence === "high") { s.UNCSW+=4; s.UNGA+=2; s.IP+=2; reasons.push("Evidence-driven"); }
    if (ans.evidence === "mid")  { s.UNGA+=1; s.AIPPM+=1; }
    if (ans.evidence === "low")  { s.YT+=1; s.AIPPM+=1; }

    if (ans.topic === "rights") { s.UNCSW+=5; s.UNGA+=2; reasons.push("Rights focus"); }
    if (ans.topic === "econ")   { s.UNGA+=4; s.AIPPM+=2; reasons.push("Economic policy"); }
    if (ans.topic === "tech")   { s.UNGA+=3; s.YT+=2; reasons.push("Cyber/AI"); }
    if (ans.topic === "media")  { s.IP+=5; s.YT+=2; reasons.push("Media/PR"); }
    if (ans.topic === "sports") { s.IPL+=6; reasons.push("Sports-biz"); }

    if (ans.press === "yes") { s.IP+=6; reasons.push("Journalism/photo"); }
    if (ans.sportbiz === "yes") { s.IPL+=5; reasons.push("Auctions/trades"); }

    if (ans.creative === "high") { s.YT+=3; s.AIPPM+=1; reasons.push("High creativity"); }
    if (ans.creative === "mid")  { s.UNGA+=1; s.UNCSW+=1; }
    if (ans.creative === "low")  { s.UNCSW+=1; }

    if (ans.domain === "global" && ans.tempo === "formal") s.UNGA += 1.5;
    if (ans.domain === "domestic" && ans.tempo === "formal") s.AIPPM += 1.5;
    if (ans.tempo === "crisis" && ans.creative === "high") s.YT += 1;
    if (ans.press === "yes" && ans.topic === "media") s.IP += 2;
    if (ans.sportbiz === "yes" && ans.tempo === "crisis") s.IPL += 1.5;

    const sorted = Object.entries(s).sort((a,b) => b[1]-a[1]);
    const max = sorted[0][1] || 1;
    const top3 = sorted.slice(0,3).map(([k,v]) => [k, Math.round((v/max)*100)]);
    const [top, alt, third] = top3;

    const spread = (sorted[0][1] - (sorted[1]?.[1] ?? 0));
    const total = sorted.reduce((acc, [,v]) => acc+v, 0) || 1;
    const confidence = Math.round(Math.max(5, Math.min(95, (spread/total)*100 + 55)));

    const agendaOf = (key) => {
      const pretty = NAMES[key];
      const match =
        COMMITTEES.find((c) => (c.name || "").startsWith(pretty)) ||
        COMMITTEES.find((c) => (c.name || "").toLowerCase().includes(pretty?.split("(")[0].trim().toLowerCase() || ""));
      return match?.agenda;
    };

    const persona = [
      ans.strength === "speaking" && "orator",
      ans.strength === "writing" && "drafter",
      ans.negotiation === "bloc" && "coalition-builder",
      ans.negotiation === "attack" && "power-player",
      ans.negotiation === "solo" && "independent",
    ].filter(Boolean).join(" • ");

    const tipsByTop = {
      UNGA: ["Bring 2 crisp Mod Cauc ideas", "Quote a recent GA resolution", "Draft a bloc outline by break"],
      UNCSW: ["Keep 3 stats handy (UN Women, WB)", "Write a 2-clause operative early", "Propose a data exchange"],
      AIPPM: ["Prep 2 attack lines & 1 compromise", "Name allies in opening", "Steer tempo with motions"],
      IPL: ["Track purse/RTM", "Float 1 trade rumor", "Prep a media angle"],
      IP: ["Pitch 2 story angles + 1 visual", "Collect quotes early", "Deliver a 120-word brief quickly"],
      YT: ["Hook in 8 seconds", "One vivid example per speech", "Use callbacks to own the room"],
    };

    setOut({
      top, alt, third, confidence,
      reasons: Array.from(new Set(reasons)).slice(0,5),
      agendas: {
        [top[0]]: agendaOf(top[0]),
        [alt[0]]: agendaOf(alt[0]),
        [third[0]]: agendaOf(third[0]),
      },
      persona,
      tips: tipsByTop[top[0]] || [],
    });
  };

  const Bar = ({ pct }) => (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--noir-stroke-soft)" }}>
      <motion.div
        className="h-full"
        style={{ background: `linear-gradient(90deg, ${GOLD}, rgba(255,255,255,.35))` }}
        initial={{ width: 0 }}
        animate={{ width: pct + "%" }}
        transition={{ type: "spring", stiffness: 70, damping: 16 }}
      />
    </div>
  );

  const Row = ({ title, agenda, pct }) => (
    <div className="rounded-lg p-3 border" style={{ background: "var(--noir-glass)", borderColor: "var(--noir-stroke)" }}>
      <div className="text-sm font-semibold">{title}</div>
      {!!agenda && <div className="text-xs text-white/75 mt-1">Agenda: {agenda}</div>}
      <div className="mt-2"><Bar pct={pct} /></div>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Gilded className="p-4">
        <div className="flex items-center gap-2 text-white/90 mb-2">
          <Brain size={16}/> Tell us your style
        </div>
        <div className="space-y-4">
          {Q.map((qq) => (
            <div key={qq.k} className="space-y-2">
              <div className="font-medium">{qq.q}</div>
              <div className="flex flex-wrap gap-2">
                {qq.opts.map(([v,label]) => (
                  <label key={v} className="inline-flex items-center gap-2 rounded-full px-3 py-1 cursor-pointer transition border"
                    style={{ background: "var(--noir-glass)", borderColor: "var(--noir-stroke)" }}>
                    <input
                      type="radio"
                      className="accent-white"
                      name={qq.k}
                      value={v}
                      checked={ans[qq.k] === v}
                      onChange={(e) => setAns({ ...ans, [qq.k]: e.target.value })}
                    />
                    <span className="text-sm text-white/85">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Pill onClick={compute} className="mt-4"><Sparkles size={16}/> Compute</Pill>
      </Gilded>

      <Gilded className="p-4">
        {!out ? (
          <div className="text-white/70 text-sm">Results will appear here.</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg p-3 border" style={{ background: "var(--noir-glass)", borderColor: "var(--noir-stroke)" }}>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{NAMES[out.top[0]]}</div>
                <div className="text-xs text-white/70 inline-flex items-center gap-1"><Gauge size={14}/> {out.confidence}%</div>
              </div>
              {!!out.agendas[out.top[0]] && <div className="text-sm text-white/80 mt-1">Agenda: {out.agendas[out.top[0]]}</div>}
              <div className="mt-2"><Bar pct={out.top[1]} /></div>
            </div>

            <Row title={NAMES[out.alt[0]]} agenda={out.agendas[out.alt[0]]} pct={out.alt[1]} />
            <Row title={NAMES[out.third[0]]} agenda={out.agendas[out.third[0]]} pct={out.third[1]} />

            {out.persona && (
              <>
                <div className="text-xs uppercase tracking-wider text-white/60">Persona</div>
                <div className="rounded-md px-3 py-2 inline-flex items-center gap-2 border"
                  style={{ background: "var(--noir-glass)", borderColor: "var(--noir-stroke)" }}>
                  <Check size={14}/> {out.persona}
                </div>
              </>
            )}

            <div className="text-xs uppercase tracking-wider text-white/60">Why</div>
            <div className="flex flex-wrap gap-2">
              {out.reasons.map((r,i)=> (
                <span key={i} className="text-[12px] rounded-full px-3 py-1 border"
                  style={{ background: "var(--noir-glass)", borderColor: "var(--noir-stroke)" }}>
                  {r}
                </span>
              ))}
            </div>

            <div className="text-xs uppercase tracking-wider text-white/60">Do this on Day 1</div>
            <ul className="text-sm text-white/85 list-disc pl-5 space-y-1">
              {out.tips.map((t,i)=> <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}
      </Gilded>
    </div>
  );
}

/* =========================================================
 * Rubric
 * =======================================================*/
function Rubric() {
  const bands = [
    { label: "Substance (35%)", w: 70, tips: ["Bring 2 stats + 1 source", "Problem → mechanism → impact"] },
    { label: "Diplomacy/Bloc (30%)", w: 60, tips: ["Name allies early", "Offer a trade: clause for support"] },
    { label: "Docs/Drafting (22.5%)", w: 45, tips: ["Write 2 OPs before lunch", "Use actionable verbs"] },
    { label: "Procedure/Decorum (12.5%)", w: 35, tips: ["Raise crisp motions", "Yield & PoIs cleanly"] },
  ];

  const checks = [
    { k: "hook", label: "Strong 20-sec hook" },
    { k: "evidence", label: "Quoted a credible source" },
    { k: "ally", label: "Secured at least 2 allies" },
    { k: "clause", label: "Drafted 1+ operative clause" },
    { k: "motion", label: "Raised a useful motion" },
  ];

  const [done, setDone] = useState({});
  const score = Object.values(done).filter(Boolean).length * 20;

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Gilded className="p-4">
        <div className="text-white/80 text-sm mb-3">Aim for balance. Keep content tight, build coalitions, convert ideas into paper.</div>
        <div className="grid gap-3">
          {bands.map((b) => (
            <div key={b.label}>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--noir-stroke-soft)" }}>
                <motion.div
                  className="h-full"
                  style={{ background: `linear-gradient(90deg, ${GOLD}, rgba(255,255,255,.35))` }}
                  initial={{ width: 0 }}
                  whileInView={{ width: b.w + "%" }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 60, damping: 16 }}
                />
              </div>
              <div className="text-xs text-white/70 mt-1 flex items-center justify-between">
                <span>{b.label}</span>
                <span className="hidden sm:block text-white/60">{b.tips.join(" • ")}</span>
              </div>
            </div>
          ))}
        </div>
      </Gilded>

      <Gilded className="p-4">
        <div className="font-semibold mb-2 flex items-center gap-2"><Gauge size={16}/> Self-check (live score)</div>
        <div className="flex flex-wrap gap-2">
          {checks.map((c) => (
            <label key={c.k} className="inline-flex items-center gap-2 rounded-lg px-3 py-1 cursor-pointer transition border"
              style={{ background: "var(--noir-glass)", borderColor: "var(--noir-stroke)" }}>
              <input
                type="checkbox"
                className="accent-white"
                checked={!!done[c.k]}
                onChange={(e) => setDone((d) => ({ ...d, [c.k]: e.target.checked }))}
              />
              <span className="text-sm">{c.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-4">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--noir-stroke-soft)" }}>
            <motion.div
              className="h-full"
              style={{ background: `linear-gradient(90deg, ${GOLD}, rgba(255,255,255,.35))` }}
              initial={{ width: 0 }}
              animate={{ width: score + "%" }}
              transition={{ type: "spring", stiffness: 70, damping: 18 }}
            />
          </div>
          <div className="mt-1 text-xs text-white/70">{score}/100</div>
          <div className="mt-2 text-xs text-white/75">
            {score < 40 && "Focus: open strong + secure 1 ally."}
            {score >= 40 && score < 80 && "Good shape: get a clause drafted and cited."}
            {score >= 80 && "Excellent: polish delivery and help another bloc member."}
          </div>
        </div>
      </Gilded>
    </div>
  );
}

/* =========================================================
 * Event Keycard
 * =======================================================*/
function EventKeycard() {
  return (
    <Gilded className="p-4 overflow-hidden">
      <div className="flex items-center gap-2 text-white/90">
        <span className="inline-block w-4 h-4 rounded-full" style={{ background: GOLD }} />
        <span className="font-semibold tracking-wide">Noir MUN — Brief</span>
      </div>

      <div className="mt-3 space-y-2 text-sm text-white/85">
        <div className="flex items-center gap-2"><CalIcon size={14}/> {DATES_TEXT}</div>
        <div className="flex items-center gap-2"><MapPin size={14}/> Faridabad, India</div>
      </div>

      <div className="mt-3 flex gap-2 flex-wrap">
        <a href="https://noirmun.com/register" target="_blank" rel="noreferrer"><Pill>Register <ExternalLink size={12}/></Pill></a>
        <a href={WHATSAPP_ESCALATE} target="_blank" rel="noreferrer"><Pill>WhatsApp Exec</Pill></a>
      </div>

      <div className="pointer-events-none absolute -right-6 -bottom-6 w-32 h-32 opacity-[.09] rounded-full"
        style={{
          boxShadow: `inset 0 0 0 2px ${GOLD_SOFT}`,
          background:
            "radial-gradient(circle at 30% 30%, rgba(214,192,137,.25), rgba(214,192,137,0) 65%)",
          filter: "blur(.3px)"
        }}
      />
    </Gilded>
  );
}

/* =========================================================
 * Page
 * =======================================================*/
export default function Assistance() {
  const [tab, setTab] = useState("chat");
  const [focus, setFocus] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    setCSSVars(); // panels/buttons palette
    // match Home: theme var + body background
    document.documentElement.style.setProperty("--theme", THEME_HEX);
    document.body.style.background = THEME_HEX;
  }, []);

  return (
    <div className="min-h-[100dvh] text-white relative pb-[calc(env(safe-area-inset-bottom,0)+8px)]">
      {/* Home background */}
      <Atmosphere />
      <RomanLayer />

      {/* Header (logo → home) */}
      <header className="px-4 py-3 flex items-center justify-between border-b bg-gradient-to-b from-[#000026]/60 to-transparent backdrop-blur"
              style={{ borderColor: "var(--noir-stroke)" }}>
        <div className="flex items-center gap-2 min-w-0">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={LOGO_URL} alt="Noir" className="h-8 w-8 object-contain transition-transform group-hover:scale-110" />
            <div className="font-semibold truncate group-hover:text-white/90">Noir MUN Assistant</div>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-2">
          <Pill onClick={() => setFocus((v) => !v)}>{focus ? "Show Info" : "Focus Mode"}</Pill>
          <a href="https://noirmun.com/register" target="_blank" rel="noreferrer"><Pill>Register <ExternalLink size={12}/></Pill></a>
          <Link to="/"><Pill>Home</Pill></Link>
        </nav>

        {/* Mobile menu */}
        <Pill className="sm:hidden p-2" onClick={() => setOpenMenu((v) => !v)} aria-label="Menu">
          {openMenu ? <X size={18} /> : <Menu size={18} />}
        </Pill>
      </header>

      {openMenu && (
        <div className="sm:hidden px-4 py-2 border-b bg-black/40 backdrop-blur-md flex items-center gap-2"
             style={{ borderColor: "var(--noir-stroke)" }}>
          <Pill onClick={() => { setFocus((v) => !v); setOpenMenu(false); }}>
            {focus ? "Show Info" : "Focus Mode"}
          </Pill>
          <a href="https://noirmun.com/register" target="_blank" rel="noreferrer"><Pill>Register</Pill></a>
          <Link to="/"><Pill>Home</Pill></Link>
        </div>
      )}

      {/* Banner */}
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <Gilded className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck size={14} color={GOLD} />
              <span className="text-white/85">WILT+ — web-smart answers with citations</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/70">
              <Sparkles size={14} /> Try: “Best Mod Cauc topics for cyber norms.”
            </div>
          </div>
        </Gilded>
      </div>

      {/* Main */}
      <main className={`max-w-6xl mx-auto p-4 grid gap-4 ${focus ? "grid-cols-1" : "md:grid-cols-[320px_1fr]"}`}>
        {!focus && <EventKeycard />}

        <Gilded className="p-4">
          {/* Segmented Tabs */}
          <div className="inline-flex rounded-full p-1 mb-4 shadow-inner border"
               style={{ background: "rgba(0,0,0,.28)", borderColor: "var(--noir-stroke)" }}>
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-3 py-1.5 text-sm rounded-full inline-flex items-center gap-1 transition ${
                    active ? "text-white" : "text-white/80 hover:bg-white/10"
                  }`}
                  style={active
                    ? { background: "linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.08))",
                        boxShadow: `inset 0 0 0 1px ${GOLD_SOFT}` }
                    : {}}
                >
                  {t.icon} {t.label}
                </button>
              );
            })}
          </div>

          {tab === "chat" && <WILTChat />}
          {tab === "rop" && <ROPSim />}
          {tab === "quiz" && <Quiz />}
          {tab === "rubric" && <Rubric />}
        </Gilded>
      </main>

      {/* Footer */}
      <footer className="w-full bg-black/30 backdrop-blur-md" style={{ borderTop: "1px solid var(--noir-stroke)" }}>
        <div className="max-w-6xl mx-auto px-4 py-2 text-center text-[11px] text-white/70">
          WILT and WILT+ can make mistakes. Verify important info.
        </div>
      </footer>

      <style>{`
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.18); border-radius: 999px; }
        ::selection{ background: ${GOLD_SOFT}; }
        .ios-safe-bottom { padding-bottom: max(0px, env(safe-area-inset-bottom)); }
        .touch-manipulation { touch-action: manipulation; }
        :root { --theme: ${THEME_HEX}; }
      `}</style>
    </div>
  );
}
