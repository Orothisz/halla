import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LOGO_URL,
  REGISTER_URL,
  WHATSAPP_ESCALATE,
  ASSIST_TEXT,
  DATES_TEXT,
  COMMITTEES,
} from "../shared/constants";
import { Sparkles, ExternalLink, Bot, Send, BookOpen, Compass, Award } from "lucide-react";

/* ---------- Minimal starfield bg (subtle) ---------- */
function Starfield() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let w = (c.width = window.innerWidth);
    let h = (c.height = window.innerHeight);
    const s = Array.from({ length: 120 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      v: Math.random() * 0.5 + 0.15,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,.4)";
      s.forEach((p) => {
        p.y += p.v;
        if (p.y > h) p.y = 0;
        ctx.fillRect(p.x, p.y, 1, 1);
      });
      requestAnimationFrame(draw);
    };
    const onResize = () => {
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    draw();
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return <canvas ref={ref} className="fixed inset-0 -z-10 w-full h-full" />;
}

/* ---------- Light API helpers ---------- */
async function fetchWiki(topic) {
  const q = topic.replace(/^wiki:|^web:/i, "").trim();
  const res = await fetch(
    "https://en.wikipedia.org/w/rest.php/v1/search/title?q=" +
      encodeURIComponent(q) +
      "&limit=3&lang=en",
    { headers: { Accept: "application/json" } }
  );
  const j = await res.json();
  if (!j?.pages?.length) return { text: "Wikipedia: no results.", source: "Wikipedia" };
  const lines = j.pages.map(
    (p, i) =>
      `${i + 1}. ${p.title} — https://en.wikipedia.org/wiki/${encodeURIComponent(
        p.title.replace(/\s/g, "_")
      )}`
  );
  try {
    const t = j.pages[0].title;
    const sr = await fetch(
      "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(t)
    );
    const s = await sr.json();
    if (s?.extract) lines.unshift("Summary: " + s.extract);
  } catch {}
  return { text: "Wikipedia:\n" + lines.join("\n"), source: "Wikipedia" };
}

async function fetchJina(url) {
  const clean = url.replace(/^read:/i, "").trim().replace(/^https?:\/\//, "");
  const r = await fetch("https://r.jina.ai/http://" + clean);
  const txt = await r.text();
  return {
    text: "Reader:\n" + txt.slice(0, 800) + (txt.length > 800 ? "…" : ""),
    source: "Jina Reader",
  };
}

/* ---------- Tabs meta ---------- */
const TABS = [
  { key: "chat", label: "Chat (WILT+)", icon: <Bot size={16} /> },
  { key: "rop", label: "ROP Simulator", icon: <BookOpen size={16} /> },
  { key: "quiz", label: "Committee Quiz", icon: <Compass size={16} /> },
  { key: "rubric", label: "Awards Rubric", icon: <Award size={16} /> },
];

/* ---------- Chat ---------- */
function WILTChat() {
  const [thread, setThread] = useState([
    {
      from: "bot",
      text:
        "I’m WILT+. Ask Noir basics (dates, fee, venue, founders, committees).\nTry: web: United Nations  •  read: https://en.wikipedia.org/wiki/United_Nations",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const KB = useMemo(
    () => ({
      dates: DATES_TEXT,
      fee: "₹2300",
      venue: "TBA",
      founders:
        "Founder: Sameer Jhamb, Co-Founder: Maahir Gulati, President: Gautam Khera",
      register: REGISTER_URL,
      whatsapp: WHATSAPP_ESCALATE,
      committees: COMMITTEES.map((c) => `${c.name}: ${c.agenda}`),
      rops:
        "UNA-USA ROPs quick keys → Motions: Set Agenda • Mod/Unmod • Introduce Draft • Close Debate. Points: Privilege • Inquiry • Order.",
    }),
    []
  );

  const push = (m) => setThread((t) => [...t, m]);

  const answer = async (q) => {
    const low = q.toLowerCase();
    const intent =
      /^web:|^wiki:/.test(low) ? "web" :
      /^read:/.test(low) ? "read" :
      /date|when/.test(low) ? "dates" :
      /fee|price|cost/.test(low) ? "fee" :
      /venue|where|location/.test(low) ? "venue" :
      /founder|organiser|organizer|oc|eb/.test(low) ? "founders" :
      /register|sign/.test(low) ? "register" :
      /committee|agenda|topic/.test(low) ? "committees" :
      /rop|rules|una/.test(low) ? "rops" :
      /exec|human|someone|whatsapp/.test(low) ? "escalate" :
      "fallback";

    switch (intent) {
      case "dates": return { text: "Dates: " + KB.dates };
      case "fee": return { text: "Delegate fee: " + KB.fee };
      case "venue": return { text: "Venue: " + KB.venue + " — want WhatsApp updates when we announce?" };
      case "founders": return { text: "Leadership — " + KB.founders };
      case "register": return { text: "Open Linktree → " + KB.register };
      case "committees": return { text: "Committees:\n• " + KB.committees.join("\n• ") };
      case "rops": return { text: KB.rops };
      case "web": return await fetchWiki(q);
      case "read": return await fetchJina(q);
      case "escalate": window.open(KB.whatsapp, "_blank"); return { text: "Opening WhatsApp…" };
      default:
        return { text: "Ask Noir basics, or use: web: <topic> • read: <url>" };
    }
  };

  const send = async (preset) => {
    const v = (preset ?? input).trim();
    if (!v) return;
    push({ from: "user", text: v });
    setInput("");
    setTyping(true);
    try {
      const r = await answer(v);
      push({ from: "bot", text: r.text, source: r.source });
    } catch {
      push({ from: "bot", text: "Couldn’t fetch that. Try again?" });
    } finally {
      setTyping(false);
    }
  };

  const quicks = [
    "Dates", "Fee", "Venue", "Founders", "Committees", "Register",
    "web: United Nations",
    "read: https://en.wikipedia.org/wiki/United_Nations",
    "Talk to executive",
  ];

  return (
    <div className="space-y-3">
      <div className="h-72 overflow-auto space-y-2 rounded-xl bg-white/5 p-3 border border-white/10">
        {thread.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-3 py-2 rounded-2xl whitespace-pre-wrap leading-relaxed ${
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
        {typing && <div className="px-3 py-2 rounded-2xl bg-white/15 w-20">typing…</div>}
      </div>

      <div className="flex flex-wrap gap-2">
        {quicks.map((t) => (
          <button
            key={t}
            onClick={() => send(t)}
            className="text-xs rounded-full px-3 py-1 bg-white/10 border border-white/15"
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder='Ask WILT… (try "web: UN Charter")'
          className="flex-1 bg-white/10 px-3 py-2 rounded-lg outline-none border border-white/15"
        />
        <button onClick={() => send()} className="rounded-lg border border-white/20 px-3">
          <Send size={16} />
        </button>
      </div>
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
              className="rounded-lg border border-white/15 px-3 py-2 bg-white/10 text-left hover:bg-white/15"
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
              className="rounded-lg border border-white/15 px-3 py-2 bg-white/10 text-left hover:bg-white/15"
            >
              <div className="font-semibold">{p.k}</div>
              <div className="text-xs text-white/80">{p.p}</div>
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
            <div key={i} className="text-xs text-white/75 bg-white/10 rounded-md px-2 py-1">
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
      agenda: COMMITTEES.find((c) => c.name.startsWith(names[pick]))?.agenda || "",
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
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 hover:bg-white/10"
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
              <div className="text-lg font-bold">{out.pretty}</div>
              {!!out.agenda && (
                <div className="text-sm text-white/80 mt-1">Agenda: {out.agenda}</div>
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
            <div className="text-xs text-white/70 mt-1">{b.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Page (clean, focus mode) ---------- */
export default function Assistance() {
  const [tab, setTab] = useState("chat");
  const [focus, setFocus] = useState(false); // hides KB column

  return (
    <div className="min-h-screen text-white relative">
      <Starfield />
      <header className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Noir" className="h-9 w-9 object-contain" />
          <div className="font-semibold">Noir MUN Assistance</div>
        </div>
        <nav className="flex items-center gap-3">
          <button
            onClick={() => setFocus((v) => !v)}
            className="rounded-xl border border-white/20 px-3 py-2"
            title="Toggle Focus Mode"
          >
            {focus ? "Show Guide" : "Focus Mode"}
          </button>
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/20 px-3 py-2 inline-flex items-center gap-2"
          >
            Register <ExternalLink size={14} />
          </a>
          <Link to="/" className="rounded-xl border border-white/20 px-3 py-2 inline-flex items-center gap-2">
            Home
          </Link>
        </nav>
      </header>

      <main className={`max-w-7xl mx-auto p-4 grid gap-4 ${focus ? "grid-cols-1" : "md:grid-cols-[360px_1fr]"}`}>
        {!focus && (
          <aside className="rounded-xl bg-white/5 p-4 border border-white/10">
            <div className="flex items-center gap-2 text-white/85">
              <Sparkles size={16} /> UNA-USA ROPs — Lightning Guide
            </div>
            <pre className="mt-2 whitespace-pre-wrap text-white/80 text-sm leading-relaxed">
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
                className={`rounded-xl border border-white/20 px-3 py-2 inline-flex items-center gap-2 ${
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
      `}</style>
    </div>
  );
}
