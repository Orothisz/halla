import { useEffect, useState } from "react";
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
  Menu, X, ShieldCheck, Info, Brain, Gauge, Check, ChevronRight
} from "lucide-react";

/* ===================== Premium Background ===================== */
function Bg() {
  return (
    <>
      {/* Radiant auras in Noir theme */}
      <div className="fixed inset-0 -z-30 bg-[radial-gradient(1200px_800px_at_85%_-20%,rgba(255,255,255,0.12),rgba(0,0,0,0)),radial-gradient(900px_520px_at_10%_25%,rgba(255,255,255,0.08),rgba(0,0,0,0))]" />
      {/* Soft film grain */}
      <div
        className="fixed inset-0 -z-20 opacity-[.06] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22 viewBox=%220 0 140 140%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22140%22 height=%22140%22 filter=%22url(%23n)%22 opacity=%220.3%22/></svg>')",
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
        className="relative w-full sm:max-w-md rounded-2xl bg-white/5 border border-white/10 p-4 shadow-[0_0_0_1px_rgba(255,255,255,.05)_inset]"
      >
        <div className="flex items-center gap-2 mb-1">
          <Bot size={18} />
          <div className="font-semibold">Meet WILT+</div>
        </div>
        <div className="text-sm text-white/80">Your web-smart MUN copilot — searches, reads, cites.</div>
        <div className="mt-3 grid gap-2">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => onUsePrompt(p)}
              className="text-left rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 transition"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[11px] text-white/60 flex items-center gap-1">
            <Info size={14} /> Auto-decides when to search vs. use event facts.
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

/* ===================== Smart Quiz (Top-3, synergy rules, agendas, tips) ===================== */
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

    // Baselines
    if (ans.domain === "global") { s.UNGA+=5; s.UNCSW+=4; reasons.push("Global policy fit"); }
    if (ans.domain === "domestic") { s.AIPPM+=5; s.IPL+=2; reasons.push("Domestic politics fit"); }

    if (ans.tempo === "formal") { s.UNGA+=3; s.UNCSW+=3; s.AIPPM+=2; reasons.push("Comfort with formal tempo"); }
    if (ans.tempo === "crisis") { s.YT+=3; s.IPL+=3; s.IP+=1; reasons.push("Thrives in fast situations"); }
    if (ans.crisis === "high") { s.YT+=2; s.IPL+=2; reasons.push("High crisis tolerance"); }
    if (ans.crisis === "low")  { s.UNGA+=1; s.UNCSW+=1; }

    if (ans.strength === "writing") { s.UNCSW+=5; s.IP+=3; reasons.push("Strong writer"); }
    if (ans.strength === "speaking") { s.UNGA+=4; s.AIPPM+=4; s.IPL+=1; reasons.push("Strong speaker"); }
    if (ans.strength === "both") { s.UNGA+=3; s.AIPPM+=3; s.UNCSW+=3; reasons.push("Balanced writer-speaker"); }

    if (ans.negotiation === "bloc") { s.UNGA+=2; s.UNCSW+=2; reasons.push("Consensus builder"); }
    if (ans.negotiation === "attack") { s.AIPPM+=3; s.YT+=2; reasons.push("Adversarial strategist"); }
    if (ans.negotiation === "solo") { s.IP+=2; s.YT+=1; reasons.push("Independent operator"); }

    if (ans.evidence === "high") { s.UNCSW+=4; s.UNGA+=2; s.IP+=2; reasons.push("Evidence-driven"); }
    if (ans.evidence === "mid")  { s.UNGA+=1; s.AIPPM+=1; }
    if (ans.evidence === "low")  { s.YT+=1; s.AIPPM+=1; }

    if (ans.topic === "rights") { s.UNCSW+=5; s.UNGA+=2; reasons.push("Rights lens"); }
    if (ans.topic === "econ")   { s.UNGA+=4; s.AIPPM+=2; reasons.push("Economic policy interest"); }
    if (ans.topic === "tech")   { s.UNGA+=3; s.YT+=2; reasons.push("Cyber/AI comfort"); }
    if (ans.topic === "media")  { s.IP+=5; s.YT+=2; reasons.push("Media/PR leaning"); }
    if (ans.topic === "sports") { s.IPL+=6; reasons.push("Sports-biz preference"); }

    if (ans.press === "yes") { s.IP+=6; reasons.push("Enjoys journalism/photo"); }
    if (ans.sportbiz === "yes") { s.IPL+=5; reasons.push("Likes auctions/trades"); }

    if (ans.creative === "high") { s.YT+=3; s.AIPPM+=1; reasons.push("High creativity"); }
    if (ans.creative === "mid")  { s.UNGA+=1; s.UNCSW+=1; }
    if (ans.creative === "low")  { s.UNCSW+=1; }

    // Synergy bonuses
    if (ans.domain === "global" && ans.tempo === "formal") s.UNGA += 1.5;
    if (ans.domain === "domestic" && ans.tempo === "formal") s.AIPPM += 1.5;
    if (ans.tempo === "crisis" && ans.creative === "high") s.YT += 1;
    if (ans.press === "yes" && ans.topic === "media") s.IP += 2;
    if (ans.sportbiz === "yes" && ans.tempo === "crisis") s.IPL += 1.5;

    // Normalize + rank
    const sorted = Object.entries(s).sort((a,b) => b[1]-a[1]);
    const max = sorted[0][1] || 1;
    const top3 = sorted.slice(0,3).map(([k,v]) => [k, Math.round((v/max)*100)]);
    const [top, alt, third] = top3;

    // Confidence band (spread-based)
    const spread = (sorted[0][1] - (sorted[1]?.[1] ?? 0));
    const total = sorted.reduce((acc, [,v]) => acc+v, 0) || 1;
    const confidence = Math.round(Math.max(5, Math.min(95, (spread/total)*100 + 55)));

    // Map agendas from COMMITTEES (best-effort)
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
      UNCSW: ["Keep 3 stats handy (UN Women, WB)", "Write a 2-clause operative early", "Propose a data-sharing mechanism"],
      AIPPM: ["Prep 2 attack lines and 1 compromise", "Name allies in opening", "Push committee procedure to your tempo"],
      IPL: ["Track auctions: budget, purse, RTM", "Float 1 trade rumor to test blocs", "Have a media angle ready"],
      IP: ["Pitch 2 story angles and 1 visual", "Collect quotes early", "Deliver a 120-word brief within 20 min"],
      YT: ["Hook line in 8 seconds", "One vivid example per speech", "Use callbacks to own the room"],
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
      scores: s,
    });
  };

  const Bar = ({ pct }) => (
    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full"
        style={{ background: "linear-gradient(90deg, rgba(255,255,255,.95), rgba(255,255,255,.35))" }}
        initial={{ width: 0 }}
        animate={{ width: pct + "%" }}
        transition={{ type: "spring", stiffness: 70, damping: 16 }}
      />
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="rounded-xl bg-white/5 p-4 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2 text-white/90 mb-2">
          <Brain size={16}/> Tell us your style
        </div>
        <div className="space-y-4">
          {Q.map((qq) => (
            <div key={qq.k} className="space-y-2">
              <div className="font-medium">{qq.q}</div>
              <div className="flex flex-wrap gap-2">
                {qq.opts.map(([v,label]) => (
                  <label key={v} className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 cursor-pointer hover:bg-white/10 transition">
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

      <div className="rounded-xl bg-white/5 p-4 border border-white/10 backdrop-blur-md">
        {!out ? (
          <div className="text-white/70 text-sm">Results will appear here.</div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-wider text-white/60">Top matches</div>

            {/* 1 */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{NAMES[out.top[0]]}</div>
                <div className="text-xs text-white/70 inline-flex items-center gap-1"><Gauge size={14}/> {out.confidence}% confidence</div>
              </div>
              {!!out.agendas[out.top[0]] && <div className="text-sm text-white/80 mt-1">Agenda: {out.agendas[out.top[0]]}</div>}
              <div className="mt-2"><Bar pct={out.top[1]} /></div>
            </div>

            {/* 2 */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-semibold">{NAMES[out.alt[0]]}</div>
              {!!out.agendas[out.alt[0]] && <div className="text-xs text-white/75 mt-1">Agenda: {out.agendas[out.alt[0]]}</div>}
              <div className="mt-2"><Bar pct={out.alt[1]} /></div>
            </div>

            {/* 3 */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-semibold">{NAMES[out.third[0]]}</div>
              {!!out.agendas[out.third[0]] && <div className="text-xs text-white/75 mt-1">Agenda: {out.agendas[out.third[0]]}</div>}
              <div className="mt-2"><Bar pct={out.third[1]} /></div>
            </div>

            {/* Persona + Why */}
            {out.persona && (
              <>
                <div className="text-xs uppercase tracking-wider text-white/60">Persona</div>
                <div className="rounded-md bg-white/5 border border-white/10 px-3 py-2 inline-flex items-center gap-2">
                  <Check size={14}/> {out.persona}
                </div>
              </>
            )}

            <div className="text-xs uppercase tracking-wider text-white/60">Why</div>
            <div className="flex flex-wrap gap-2">
              {out.reasons.map((r,i)=> (
                <span key={i} className="text-[12px] rounded-full px-3 py-1 bg-white/5 border border-white/10">{r}</span>
              ))}
            </div>

            <div className="text-xs uppercase tracking-wider text-white/60">Do this on Day 1</div>
            <ul className="text-sm text-white/85 list-disc pl-5 space-y-1">
              {out.tips.map((t,i)=> <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== Rubric (interactive self-check + animated bars) ===================== */
function Rubric() {
  const bands = [
    { label: "Substance (35%)", w: 70, tips: ["Bring 2 stats + 1 source", "Define problem → mechanism → impact"] },
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
  const score = Object.values(done).filter(Boolean).length * 20; // 5 items → 100

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="rounded-xl bg-white/5 p-4 border border-white/10 backdrop-blur-md">
        <div className="text-white/80 text-sm mb-3">Aim for balance. Keep content tight, build coalitions, convert ideas into paper.</div>
        <div className="grid gap-3">
          {bands.map((b) => (
            <div key={b.label}>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ background: "linear-gradient(90deg, rgba(255,255,255,.95), rgba(255,255,255,.35))" }}
                  initial={{ width: 0 }}
                  whileInView={{ width: b.w + "%" }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 60, damping: 16 }}
                />
              </div>
              <div className="text-xs text-white/70 mt-1 flex items-center justify-between">
                <span>{b.label}</span>
                <span className="hidden sm:block text-white/60">
                  {b.tips.join(" • ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white/5 p-4 border border-white/10 backdrop-blur-md">
        <div className="font-semibold mb-2 flex items-center gap-2"><Gauge size={16}/> Self-check (live score)</div>
        <div className="flex flex-wrap gap-2">
          {checks.map((c) => (
            <label key={c.k} className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1 cursor-pointer hover:bg-white/10 transition">
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
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full"
              style={{ background: "linear-gradient(90deg, rgba(255,255,255,.95), rgba(255,255,255,.35))" }}
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

      {/* Header (logo now links to home) */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-black/25 backdrop-blur-md shadow-lg shadow-black/20">
        <div className="flex items-center gap-2 min-w-0">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={LOGO_URL} alt="Noir" className="h-8 w-8 object-contain transition-transform group-hover:scale-110" />
            <div className="font-semibold truncate group-hover:text-white/90">Noir MUN Assistant</div>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-2">
          <button onClick={() => setFocus((v) => !v)} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10 hover:scale-[1.02] transition">
            {focus ? "Show Guide" : "Focus Mode"}
          </button>
          <a href={REGISTER_URL} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 px-3 py-1.5 text-sm inline-flex items-center gap-1 hover:bg-white/10 hover:scale-[1.02] transition">
            Register <ExternalLink size={12}/>
          </a>
          <Link to="/" className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10 hover:scale-[1.02] transition">Home</Link>
        </nav>

        {/* Mobile menu */}
        <button className="sm:hidden rounded-lg border border-white/10 p-2 hover:bg-white/10" onClick={() => setOpenMenu((v) => !v)} aria-label="Menu">
          {openMenu ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {openMenu && (
        <div className="sm:hidden px-4 py-2 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center gap-2">
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
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between backdrop-blur-sm shadow-inner">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck size={14} className="opacity-90" />
            <span className="text-white/85">WILT+ — web-smart answers with citations</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-white/70">
            <Sparkles size={14} /> Try: “Best Mod Cauc topics for cyber norms.”
          </div>
        </div>
      </div>

      <main className={`max-w-6xl mx-auto p-4 grid gap-4 ${focus ? "grid-cols-1" : "md:grid-cols-[320px_1fr]"}`}>
        {!focus && (
          <aside className="rounded-xl bg-white/5 p-4 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-white/90">
              <Sparkles size={14} /> UNA-USA ROPs — Lightning Guide
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

        <section className="rounded-xl bg-white/5 p-4 border border-white/10 backdrop-blur-md">
          {/* Segmented Tabs */}
          <div className="inline-flex rounded-full bg-black/30 border border-white/10 p-1 mb-4 shadow-inner">
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-3 py-1.5 text-sm rounded-full inline-flex items-center gap-1 transition ${
                    active
                      ? "bg-gradient-to-r from-white/20 to-white/10 shadow-sm text-white"
                      : "hover:bg-white/10 text-white/80"
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

      {/* Disclaimer */}
      <footer className="w-full border-t border-white/10 bg-black/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-2 text-center text-[11px] text-white/70">
          Wilt, and Wilt+ can make mistakes. Always verify important info.
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
