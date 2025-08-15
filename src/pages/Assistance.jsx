import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LOGO_URL,
  REGISTER_URL,
  WHATSAPP_ESCALATE,
  ASSIST_TEXT,
  DATES_TEXT,
  COMMITTEES,
} from "../shared/constants";
import {
  Sparkles, ExternalLink, Bot, Send, BookOpen, Compass, Award,
  Menu, X, ShieldCheck, Info
} from "lucide-react";

/* ===================== Minimal Background ===================== */
function Bg() {
  return (
    <>
      {/* Radial gradients */}
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(1200px_800px_at_80%_-20%,rgba(255,255,255,0.08),rgba(0,0,0,0)),radial-gradient(1000px_600px_at_10%_20%,rgba(255,255,255,0.06),rgba(0,0,0,0))]" />
      {/* Subtle noise */}
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

/* ===================== Tabs ===================== */
const TABS = [
  { key: "chat", label: "Chat", icon: <Bot size={14} /> },
  { key: "rop", label: "ROP", icon: <BookOpen size={14} /> },
  { key: "quiz", label: "Quiz", icon: <Compass size={14} /> },
  { key: "rubric", label: "Rubric", icon: <Award size={14} /> },
];

/* ===================== Cloud ask ===================== */
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

/* ===================== Welcome (always on open) ===================== */
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
        className="relative w-full sm:max-w-md rounded-2xl bg-white/5 border border-white/10 p-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <Bot size={18} />
          <div className="font-semibold">Meet WILT+</div>
        </div>
        <div className="text-sm text-white/80">Your web‑smart MUN copilot — searches, reads, cites.</div>
        <div className="mt-3 grid gap-2">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => onUsePrompt(p)}
              className="text-left rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[11px] text-white/60 flex items-center gap-1">
            <Info size={14} /> Auto‑decides when to search vs. use event facts.
          </div>
          <button onClick={onClose} className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10">
            Start
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ===================== Chat ===================== */
function WILTChat() {
  const [thread, setThread] = useState([
    { from: "bot", text: "I’m WILT+. Ask Noir basics or world affairs — I can search and cite.\nTry: “Summarise today’s top UN story in 4 lines.”" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [verified, setVerified] = useState(false);

  // Always show welcome on page open
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
        <div className={`flex items-center gap-1 text-xs ${verified ? "text-emerald-300" : "text-white/50"}`}>
          <ShieldCheck size={14} />
          <span>{verified ? "Sources attached" : "Awaiting sources"}</span>
        </div>
      </div>

      <div className="h-[50dvh] min-h-[240px] overflow-auto space-y-2 rounded-xl bg-white/5 p-3 border border-white/10">
        {thread.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-3 py-2 rounded-xl whitespace-pre-wrap leading-relaxed break-words ${
              m.from === "bot" ? "bg-white/5 border border-white/10" : "bg-white/10 ml-auto"
            }`}
          >
            {m.text}
            {m.source && <div className="mt-1 text-[10px] uppercase tracking-wider text-white/70">Source: {m.source}</div>}
          </div>
        ))}
        {typing && <div className="px-3 py-2 rounded-xl bg-white/10 w-24">thinking…</div>}
      </div>

      <div className="flex flex-wrap gap-1">
        {quicks.map((t) => (
          <button key={t} onClick={() => send(t)} className="text-[11px] rounded-full px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10">
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-2 ios-safe-bottom">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask WILT+ anything…"
          inputMode="text"
          className="flex-1 bg-white/5 px-3 py-2 rounded-lg outline-none border border-white/10"
        />
        <button onClick={() => send()} className="rounded-lg border border-white/10 px-3 hover:bg-white/10" aria-label="Send">
          <Send size={16} />
        </button>
      </div>

      <WelcomeModal open={showWelcome} onClose={closeWelcome} onUsePrompt={usePrompt} />
    </div>
  );
}

/* ===================== ROP (minimal cards) ===================== */
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
      <div className="rounded-xl bg-white/5 p-3 border border-white/10">
        <div className="font-semibold mb-2">Motions</div>
        <div className="flex flex-col gap-2">
          {motions.map((m) => (
            <button
              key={m.k}
              onClick={() => add(`Raise: “${m.p}” • Voting: ${m.vote}`, m.val)}
              className="rounded-lg border border-white/10 px-3 py-2 bg-white/5 text-left hover:bg-white/10"
            >
              <div className="font-medium">{m.k}</div>
              <div className="text-xs text-white/70">Voting: {m.vote}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white/5 p-3 border border-white/10">
        <div className="font-semibold mb-2">Points</div>
        <div className="flex flex-col gap-2">
          {points.map((p) => (
            <button
              key={p.k}
              onClick={() => add(`State: “${p.p}”`, p.val)}
              className="rounded-lg border border-white/10 px-3 py-2 bg-white/5 text-left hover:bg-white/10"
            >
              <div className="font-medium">{p.k}</div>
              <div className="text-xs text-white/70">{p.p}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white/5 p-3 border border-white/10">
        <div className="font-semibold mb-2">Floor Confidence</div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full"
            style={{ background: "linear-gradient(90deg, rgba(255,255,255,.85), rgba(255,255,255,.25))" }}
            initial={{ width: "0%" }}
            animate={{ width: score + "%" }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
          />
        </div>
        <div className="text-xs text-white/70 mt-2">{score}/100</div>
        <div className="mt-3 text-xs font-semibold text-white/80">Recent actions</div>
        <div className="mt-1 space-y-1 max-h-32 overflow-auto">
          {log.map((l, i) => (
            <div key={i} className="text-xs text-white/80 bg-white/5 border border-white/10 rounded-md px-2 py-1">
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===================== Smart, Minimal Quiz ===================== */
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
    { k: "topic", q: "Topic lane?", opts: [["rights","Rights"],["econ","Economics"],["tech","Cyber/AI"],["media","Media"],["sports","Sports‑biz"]] },
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

    if (ans.domain === "global") { s.UNGA+=4; s.UNCSW+=4; reasons.push("Global policy fit."); }
    if (ans.domain === "domestic") { s.AIPPM+=4; s.IPL+=1; reasons.push("Domestic politics fit."); }

    if (ans.tempo === "formal") { s.UNGA+=2; s.UNCSW+=2; s.AIPPM+=2; }
    if (ans.tempo === "crisis") { s.YT+=3; s.IPL+=3; s.IP+=1; }
    if (ans.crisis === "high") { s.YT+=2; s.IPL+=2; }
    if (ans.crisis === "low")  { s.UNGA+=1; s.UNCSW+=1; }

    if (ans.strength === "writing") { s.UNCSW+=4; s.IP+=3; reasons.push("Strong writer."); }
    if (ans.strength === "speaking") { s.UNGA+=3; s.AIPPM+=3; s.IPL+=1; reasons.push("Strong speaker."); }
    if (ans.strength === "both") { s.UNGA+=2; s.AIPPM+=2; s.UNCSW+=2; }

    if (ans.negotiation === "bloc") { s.UNGA+=2; s.UNCSW+=2; }
    if (ans.negotiation === "attack") { s.AIPPM+=3; s.YT+=2; }
    if (ans.negotiation === "solo") { s.IP+=2; s.YT+=1; }

    if (ans.evidence === "high") { s.UNCSW+=3; s.UNGA+=2; s.IP+=2; reasons.push("Evidence‑driven."); }
    if (ans.evidence === "mid")  { s.UNGA+=1; s.AIPPM+=1; }
    if (ans.evidence === "low")  { s.YT+=1; s.AIPPM+=1; }

    if (ans.topic === "rights") { s.UNCSW+=4; s.UNGA+=2; reasons.push("Rights lens."); }
    if (ans.topic === "econ")   { s.UNGA+=3; s.AIPPM+=2; }
    if (ans.topic === "tech")   { s.UNGA+=2; s.YT+=2; }
    if (ans.topic === "media")  { s.IP+=4; s.YT+=2; reasons.push("Media/PR leaning."); }
    if (ans.topic === "sports") { s.IPL+=5; reasons.push("Sports‑biz."); }

    if (ans.press === "yes") { s.IP+=5; }
    if (ans.sportbiz === "yes") { s.IPL+=4; }

    if (ans.creative === "high") { s.YT+=3; s.AIPPM+=1; }
    if (ans.creative === "mid")  { s.UNGA+=1; s.UNCSW+=1; }
    if (ans.creative === "low")  { s.UNCSW+=1; }

    if (ans.domain === "global" && ans.tempo === "formal") s.UNGA += 0.5;
    if (ans.domain === "domestic" && ans.tempo === "formal") s.AIPPM += 0.5;
    if (ans.tempo === "crisis" && ans.creative === "high") s.YT += 0.5;

    const sorted = Object.entries(s).sort((a,b) => b[1]-a[1]);
    const top = sorted[0], alt = sorted[1];
    const spread = top[1] - alt[1];
    const total = sorted.reduce((acc, [,v]) => acc+v, 0) || 1;
    const confidence = Math.round(Math.max(5, Math.min(95, (spread/total)*100 + 55)));

    const agenda = (COMMITTEES.find((c) => (c.name || "").startsWith(NAMES[top[0]])) || {}).agenda;

    setOut({ top, alt, confidence, reasons: Array.from(new Set(reasons)).slice(0,3), agenda });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="rounded-xl bg-white/5 p-4 border border-white/10">
        <div className="space-y-4">
          {Q.map((qq) => (
            <div key={qq.k} className="space-y-2">
              <div className="font-medium">{qq.q}</div>
              <div className="flex flex-wrap gap-2">
                {qq.opts.map(([v,label]) => (
                  <label key={v} className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 cursor-pointer">
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
        <button onClick={compute} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 hover:bg-white/10">
          Compute <Sparkles size={16}/>
        </button>
      </div>

      <div className="rounded-xl bg-white/5 p-4 border border-white/10">
        {!out ? (
          <div className="text-white/70 text-sm">Results will appear here.</div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-white/60">Recommended</div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-lg font-semibold">{NAMES[out.top[0]]}</div>
              {!!out.agenda && <div className="text-sm text-white/80 mt-1">Agenda: {out.agenda}</div>}
              <div className="text-xs text-white/70 mt-2">Confidence: {out.confidence}%</div>
            </div>

            <div className="text-xs uppercase tracking-wider text-white/60">Why</div>
            <ul className="text-sm text-white/85 list-disc pl-5 space-y-1">
              {out.reasons.map((r,i)=> <li key={i}>{r}</li>)}
            </ul>

            <div className="text-xs uppercase tracking-wider text-white/60">Runner‑up</div>
            <div className="rounded-lg bg-white/5 border border-white/10 p-2 text-sm">
              {NAMES[out.alt[0]]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== Rubric (clean) ===================== */
function Rubric() {
  const items = [
    { label: "Substance (35%)", w: 70 },
    { label: "Diplomacy/Bloc (30%)", w: 60 },
    { label: "Docs/Drafting (22.5%)", w: 45 },
    { label: "Procedure/Decorum (12.5%)", w: 35 },
  ];
  return (
    <div className="rounded-xl bg-white/5 p-4 border border-white/10">
      <div className="text-white/80 text-sm mb-3">Aim for balance. Keep content tight, build coalitions, convert ideas into paper.</div>
      <div className="grid gap-3">
        {items.map((b) => (
          <div key={b.label}>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full"
                style={{ background: "linear-gradient(90deg, rgba(255,255,255,.9), rgba(255,255,255,.25))" }}
                initial={{ width: 0 }}
                whileInView={{ width: b.w + "%" }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 60, damping: 16 }}
              />
            </div>
            <div className="text-xs text-white/70 mt-1">{b.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== Page ===================== */
export default function Assistance() {
  const [tab, setTab] = useState("chat");
  const [focus, setFocus] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className="min-h-[100dvh] text-white relative pb-[calc(env(safe-area-inset-bottom,0)+8px)]">
      <Bg />

      <header className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0">
          <img src={LOGO_URL} alt="Noir" className="h-8 w-8 object-contain" />
          <div className="font-semibold truncate">Noir MUN Assistant</div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-2">
          <button onClick={() => setFocus((v) => !v)} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10">
            {focus ? "Show Guide" : "Focus Mode"}
          </button>
          <a href={REGISTER_URL} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 px-3 py-1.5 text-sm inline-flex items-center gap-1 hover:bg-white/10">
            Register <ExternalLink size={12}/>
          </a>
          <Link to="/" className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10">Home</Link>
        </nav>

        {/* Mobile menu */}
        <button className="sm:hidden rounded-lg border border-white/10 p-2" onClick={() => setOpenMenu((v) => !v)} aria-label="Menu">
          {openMenu ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {openMenu && (
        <div className="sm:hidden px-4 py-2 border-b border-white/10 bg-black/30 backdrop-blur flex items-center gap-2">
          <button onClick={() => { setFocus((v) => !v); setOpenMenu(false); }} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm">
            {focus ? "Show Guide" : "Focus Mode"}
          </button>
          <a href={REGISTER_URL} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 px-3 py-1.5 text-sm">
            Register
          </a>
          <Link to="/" className="rounded-lg border border-white/10 px-3 py-1.5 text-sm">Home</Link>
        </div>
      )}

      {/* Banner */}
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck size={14} className="opacity-90" />
            <span className="text-white/85">WILT+ — web‑smart answers with citations</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-white/70">
            <Sparkles size={14} /> Try: “Best Mod Cauc topics for cyber norms.”
          </div>
        </div>
      </div>

      <main className={`max-w-6xl mx-auto p-4 grid gap-4 ${focus ? "grid-cols-1" : "md:grid-cols-[320px_1fr]"}`}>
        {!focus && (
          <aside className="rounded-xl bg-white/5 p-4 border border-white/10">
            <div className="flex items-center gap-2 text-white/90">
              <Sparkles size={14} /> UNA‑USA ROPs — Lightning Guide
            </div>
            <pre className="mt-3 whitespace-pre-wrap text-white/80 text-[13px] leading-relaxed">
{ASSIST_TEXT}

• Event: {DATES_TEXT}
• Linktree: {REGISTER_URL}
• WhatsApp Exec: {WHATSAPP_ESCALATE}
• Email: allotments.noirmun@gmail.com
            </pre>
          </aside>
        )}

        <section className="rounded-xl bg-white/5 p-4 border border-white/10">
          {/* Segmented Tabs */}
          <div className="inline-flex rounded-full bg-white/5 border border-white/10 p-1 mb-4">
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-3 py-1.5 text-sm rounded-full inline-flex items-center gap-1 transition ${
                    active ? "bg-white/15" : "hover:bg-white/10"
                  }`}
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
        </section>
      </main>

      {/* Disclaimer bar (like ChatGPT) */}
      <footer className="w-full border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-2 text-center text-[11px] text-white/70">
          Wilt, and Wilt + can make mistakes. Check Important info.
        </div>
      </footer>

      <style>{`
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.18); border-radius: 999px; }
        ::selection{ background: rgba(255,255,255,.22); }
        .ios-safe-bottom { padding-bottom: max(0px, env(safe-area-inset-bottom)); }
        .touch-manipulation { touch-action: manipulation; }
      `}</style>
    </div>
  );
}
