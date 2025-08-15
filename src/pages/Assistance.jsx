import { useEffect, useMemo, useRef, useState } from "react";
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

/* ---------- Minimal starfield bg (subtle) ---------- */
function Starfield() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let w = (c.width = window.innerWidth);
    let h = (c.height = window.innerHeight);
    const s = Array.from({ length: 120 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      v: Math.random() * 0.5 + 0.15,
    }));
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,.4)";
      for (const p of s) {
        p.y += p.v;
        if (p.y > h) p.y = 0;
        ctx.fillRect(p.x, p.y, 1, 1);
      }
      raf = requestAnimationFrame(draw);
    };
    const onResize = () => {
      w = (c.width = window.innerWidth);
      h = (c.height = window.innerHeight);
    };
    window.addEventListener("resize", onResize, { passive: true });
    draw();
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 -z-10 w-full h-full pointer-events-none" />;
}

/* ---------- Welcome Modal (flagship touch) ---------- */
function WelcomeModal({ open, onClose, onUsePrompt }) {
  if (!open) return null;
  const prompts = [
    "Summarise today’s top UN story in 4 lines.",
    "Compare UNHRC vs UNGA mandates.",
    "Best Mod Cauc topics for cyber norms (UNGA)."
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg rounded-2xl border border-white/15 bg-gradient-to-b from-white/10 to-white/5 p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Bot size={18} />
          <div className="font-semibold">Meet <span className="font-bold">WILT+</span></div>
        </div>
        <div className="text-sm text-white/80 leading-relaxed">
          Your web‑smart MUN copilot. It searches online, reads pages, and answers with citations.
        </div>
        <div className="mt-3 grid gap-2">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => onUsePrompt(p)}
              className="text-left rounded-xl border border-white/15 bg-white/10 px-3 py-2 hover:bg-white/15"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="text-[11px] text-white/60 flex items-center gap-1">
            <Info size={14} /> Auto‑decides when to search vs. use event facts.
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Tabs meta ---------- */
const TABS = [
  { key: "chat", label: "Chat (WILT+)", icon: <Bot size={16} /> },
  { key: "rop", label: "ROP Simulator", icon: <BookOpen size={16} /> },
  { key: "quiz", label: "Committee Quiz", icon: <Compass size={16} /> },
  { key: "rubric", label: "Awards Rubric", icon: <Award size={16} /> },
];

/* ---------- Cloud brain call ---------- */
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

/* ---------- Chat (flagship, verified badge, welcome, mobile‑safe) ---------- */
function WILTChat() {
  const [thread, setThread] = useState([
    {
      from: "bot",
      text:
        "I’m WILT+. Ask Noir basics or anything on world affairs — I can search and cite.\nTry: “Summarise today’s top UN story in 4 lines.”",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [verified, setVerified] = useState(false); // lights up when answers include sources
  const [showWelcome, setShowWelcome] = useState(false);

  // One-time welcome popup
  useEffect(() => {
    try {
      const seen = localStorage.getItem("wilt_welcome_seen");
      if (!seen) setShowWelcome(true);
    } catch {}
  }, []);

  const usePrompt = (p) => {
    setShowWelcome(false);
    localStorage.setItem("wilt_welcome_seen", "1");
    send(p);
  };
  const closeWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem("wilt_welcome_seen", "1");
  };

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
    setInput("");
    setTyping(true);
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
      {/* Header row with Verified badge */}
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm text-white/80 flex items-center gap-2">
          <Bot size={16} /> WILT+ Chat
        </div>
        <div className={`flex items-center gap-1 text-xs ${verified ? "text-emerald-300" : "text-white/50"}`}>
          <ShieldCheck size={14} />
          <span>{verified ? "WILT+ Verified (sources attached)" : "Awaiting sources"}</span>
        </div>
      </div>

      <div className="h-[52dvh] min-h-[260px] overflow-auto space-y-2 rounded-xl bg-white/5 p-3 border border-white/10">
        {thread.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-3 py-2 rounded-2xl whitespace-pre-wrap leading-relaxed break-words ${
              m.from === "bot" ? "bg-white/15" : "bg-white/25 ml-auto"
            }`}
          >
            {m.text}
            {m.source && (
              <div className="mt-1 text-[10px] uppercase tracking-wider text-white/70">
                Source: {m.source}
              </div>
            )}
          </div>
        ))}
        {typing && <div className="px-3 py-2 rounded-2xl bg-white/15 w-24">thinking…</div>}
      </div>

      <div className="flex flex-wrap gap-2">
        {quicks.map((t) => (
          <button
            key={t}
            onClick={() => send(t)}
            className="text-xs rounded-full px-3 py-1 bg-white/10 border border-white/15 touch-manipulation"
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-2 ios-safe-bottom">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder='Ask WILT+ anything… (e.g., "UNGA today?")'
          inputMode="text"
          className="flex-1 bg-white/10 px-3 py-2 rounded-lg outline-none border border-white/15 break-words"
        />
        <button onClick={() => send()} className="rounded-lg border border-white/20 px-3 touch-manipulation" aria-label="Send">
          <Send size={16} />
        </button>
      </div>

      {/* Welcome modal */}
      <WelcomeModal open={showWelcome} onClose={closeWelcome} onUsePrompt={usePrompt} />
    </div>
  );
}

/* ---------- ROP Simulator (compact) ---------- */
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
        <div className="font-semibold text-white/90 mb-2">Motions</div>
        <div className="flex flex-col gap-2">
          {motions.map((m) => (
            <button
              key={m.k}
              onClick={() => add(`Raise: “${m.p}” • Voting: ${m.vote}`, m.val)}
              className="rounded-lg border border-white/15 px-3 py-2 bg-white/10 text-left hover:bg-white/15 touch-manipulation"
            >
              <div className="font-semibold">{m.k}</div>
              <div className="text-xs text-white/80">Voting: {m.vote}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white/5 p-3 border border-white/10">
        <div className="font-semibold text-white/90 mb-2">Points</div>
        <div className="flex flex-col gap-2">
          {points.map((p) => (
            <button
              key={p.k}
              onClick={() => add(`State: “${p.p}”`, p.val)}
              className="rounded-lg border border-white/15 px-3 py-2 bg-white/10 text-left hover:bg-white/15 touch-manipulation"
            >
              <div className="font-semibold">{p.k}</div>
              <div className="text-xs text-white/80 break-words">{p.p}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white/5 p-3 border border-white/10">
        <div className="font-semibold text-white/90 mb-2">Floor Confidence</div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full"
            style={{ background: "linear-gradient(90deg, rgba(255,255,255,.8), rgba(255,255,255,.2))" }}
            initial={{ width: "0%" }}
            animate={{ width: score + "%" }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
          />
        </div>
        <div className="text-xs text-white/70 mt-2">{score}/100</div>
        <div className="mt-3 text-xs font-semibold text-white/80">Recent actions</div>
        <div className="mt-1 space-y-1 max-h-32 overflow-auto">
          {log.map((l, i) => (
            <div key={i} className="text-xs text-white/75 bg-white/10 rounded-md px-2 py-1 break-words">
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Quiz (short & clear) ---------- */
function Quiz() {
  const Q = [
    { k: "domain", q: "What domain excites you more?", opts: [["global", "Global policy / intl law"], ["domestic", "Domestic politics / governance"]] },
    { k: "tempo", q: "Preferred tempo?", opts: [["formal", "Formal & structured"], ["crisis", "Fast, crisis turns"]] },
    { k: "skill", q: "Primary strength?", opts: [["writing", "Drafting & documentation"], ["speaking", "Oratory & negotiations"]] },
    { k: "media", q: "Media/PR interests?", opts: [["press", "Yes — journalism / photography"], ["notpress", "Prefer committee floor"]] },
    { k: "sport", q: "Strategy/sports-business?", opts: [["ipl", "Yes — auctions & trades"], ["noipl", "Not really"]] },
  ];
  const [ans, setAns] = useState({});
  const [out, setOut] = useState(null);

  const compute = () => {
    const s = { UNGA: 0, UNCSW: 0, AIPPM: 0, IPL: 0, IP: 0, YT: 0 };
    if (ans.domain === "global") { s.UNGA += 3; s.UNCSW += 3; } else if (ans.domain === "domestic") { s.AIPPM += 3; s.IPL += 1; }
    if (ans.tempo === "formal") { s.UNGA += 2; s.UNCSW += 2; s.AIPPM += 2; } else if (ans.tempo === "crisis") { s.YT += 3; s.IPL += 3; }
    if (ans.skill === "writing") { s.UNCSW += 3; s.IP += 3; } else if (ans.skill === "speaking") { s.UNGA += 2; s.AIPPM += 2; s.IPL += 1; }
    if (ans.media === "press") s.IP += 4;
    if (ans.sport === "ipl") s.IPL += 4;

    const sorted = Object.entries(s).sort((a, b) => b[1] - a[1]);
    const topScore = sorted[0][1];
    const ties = sorted.filter(([, v]) => v === topScore).map(([k]) => k);
    const priority = ["IP", "IPL", "UNCSW", "AIPPM", "UNGA", "YT"];
    const pick = ties.sort((a, b) => priority.indexOf(a) - priority.indexOf(b))[0];

    const names = {
      UNGA: "United Nations General Assembly (UNGA)",
      UNCSW: "United Nations Commission on the Status of Women (UNCSW)",
      AIPPM: "All India Political Parties Meet (AIPPM)",
      IPL: "Indian Premier League (IPL)",
      IP: "International Press (IP)",
      YT: "YouTube All Stars",
    };

    setOut({
      pretty: names[pick],
      agenda: (COMMITTEES.find((c) => c.name.startsWith(names[pick])) || {}).agenda || "",
      scores: sorted,
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="rounded-xl bg-white/5 p-4 border border-white/10">
        <div className="space-y-4">
          {Q.map((qq) => (
            <div key={qq.k}>
              <div className="font-semibold">{qq.q}</div>
              <div className="mt-2 grid gap-2">
                {qq.opts.map(([v, label]) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={qq.k}
                      value={v}
                      checked={ans[qq.k] === v}
                      onChange={(e) => setAns({ ...ans, [qq.k]: e.target.value })}
                    />
                    <span className="text-white/80 text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={compute}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 hover:bg-white/10 touch-manipulation"
        >
          Compute Result <Sparkles size={16} />
        </button>
      </div>

      <div className="rounded-xl bg-white/5 p-4 border border-white/10">
        {!out ? (
          <div className="text-white/70 text-sm">Results will appear here.</div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-white/60">Recommended committee</div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-3">
              <div className="text-lg font-bold break-words">{out.pretty}</div>
              {!!out.agenda && (
                <div className="text-sm text-white/80 mt-1 break-words">Agenda: {out.agenda}</div>
              )}
            </div>
            <div className="text-xs uppercase tracking-wider text-white/60">Scoreboard</div>
            <div className="grid grid-cols-2 gap-2">
              {out.scores.map(([k, v]) => (
                <div key={k} className="rounded-lg bg-white/10 p-2">
                  <div className="text-xs text-white/70">{k}</div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-1">
                    <motion.div
                      className="h-full"
                      style={{ background: "linear-gradient(90deg, rgba(255,255,255,.8), rgba(255,255,255,.2))" }}
                      initial={{ width: 0 }}
                      animate={{ width: Math.min(100, v * 10) + "%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Rubric (simple) ---------- */
function Rubric() {
  const items = [
    { label: "Substance (35%)", w: 70 },
    { label: "Diplomacy/Bloc (30%)", w: 60 },
    { label: "Docs/Drafting (22.5%)", w: 45 },
    { label: "Procedure/Decorum (12.5%)", w: 35 },
  ];
  return (
    <div className="rounded-xl bg-white/5 p-4 border border-white/10">
      <div className="text-white/80 text-sm mb-3">
        Aim for balance. Keep content tight, build coalitions, convert ideas into paper.
      </div>
      <div className="grid gap-3">
        {items.map((b) => (
          <div key={b.label}>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full"
                style={{ background: "linear-gradient(90deg, rgba(255,255,255,.8), rgba(255,255,255,.2))" }}
                initial={{ width: 0 }}
                whileInView={{ width: b.w + "%" }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 60, damping: 16 }}
              />
            </div>
            <div className="text-xs text-white/70 mt-1 break-words">{b.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Page (clean, focus mode, flagship header) ---------- */
export default function Assistance() {
  const [tab, setTab] = useState("chat");
  const [focus, setFocus] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className="min-h-[100dvh] text-white relative pb-[calc(env(safe-area-inset-bottom,0)+8px)]">
      <Starfield />
      <header className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="flex items-center gap-3 min-w-0">
          <img src={LOGO_URL} alt="Noir" className="h-9 w-9 object-contain flex-shrink-0" />
          <div className="font-semibold truncate">Noir MUN Assistance</div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => setFocus((v) => !v)}
            className="rounded-xl border border-white/20 px-3 py-2 touch-manipulation"
            title="Toggle Focus Mode"
          >
            {focus ? "Show Guide" : "Focus Mode"}
          </button>
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/20 px-3 py-2 inline-flex items-center gap-2 touch-manipulation"
          >
            Register <ExternalLink size={14} />
          </a>
          <Link to="/" className="rounded-xl border border-white/20 px-3 py-2 inline-flex items-center gap-2 touch-manipulation">
            Home
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="sm:hidden rounded-xl border border-white/20 p-2 touch-manipulation"
          onClick={() => setOpenMenu((v) => !v)}
          aria-label="Menu"
        >
          {openMenu ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Mobile dropdown */}
      {openMenu && (
        <div className="sm:hidden px-4 py-2 border-b border-white/10 bg-white/5 backdrop-blur flex items-center gap-2">
          <button
            onClick={() => { setFocus((v) => !v); setOpenMenu(false); }}
            className="rounded-xl border border-white/20 px-3 py-2 text-sm touch-manipulation"
          >
            {focus ? "Show Guide" : "Focus Mode"}
          </button>
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/20 px-3 py-2 text-sm touch-manipulation"
          >
            Register
          </a>
          <Link to="/" className="rounded-xl border border-white/20 px-3 py-2 text-sm touch-manipulation">
            Home
          </Link>
        </div>
      )}

      {/* Flagship banner */}
      <div className="mx-auto max-w-7xl px-4 pt-3">
        <div className="rounded-xl border border-white/15 bg-gradient-to-r from-white/10 to-white/5 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck size={16} className="opacity-90" />
            <span className="text-white/85">WILT+ is live — web‑smart answers with citations.</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-white/70">
            <Sparkles size={14} /> Try: “Best Mod Cauc topics for cyber norms.”
          </div>
        </div>
      </div>

      <main className={`max-w-7xl mx-auto p-4 grid gap-4 ${focus ? "grid-cols-1" : "md:grid-cols-[360px_1fr]"}`}>
        {!focus && (
          <aside className="rounded-xl bg-white/5 p-4 border border-white/10">
            <div className="flex items-center gap-2 text-white/85">
              <Sparkles size={16} /> UNA-USA ROPs — Lightning Guide
            </div>
            <pre className="mt-2 whitespace-pre-wrap text-white/80 text-sm leading-relaxed break-words">
{ASSIST_TEXT}

• Event: {DATES_TEXT}
• Linktree: {REGISTER_URL}
• WhatsApp Exec: {WHATSAPP_ESCALATE}
• Email: allotments.noirmun@gmail.com
            </pre>
          </aside>
        )}

        <section className="rounded-xl bg-white/5 p-4 border border-white/10">
          <div className="flex flex-wrap gap-2 mb-4">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-xl border border-white/20 px-3 py-2 inline-flex items-center gap-2 touch-manipulation ${
                  tab === t.key ? "bg-white/10" : ""
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {tab === "chat" && <WILTChat />}
          {tab === "rop" && <ROPSim />}
          {tab === "quiz" && <Quiz />}
          {tab === "rubric" && <Rubric />}
        </section>
      </main>

      <style>{`
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.2); border-radius: 999px; }
        ::selection{ background: rgba(255,255,255,.25); }
        .ios-safe-bottom { padding-bottom: max(0px, env(safe-area-inset-bottom)); }
        .touch-manipulation { touch-action: manipulation; }
      `}</style>
    </div>
  );
}
