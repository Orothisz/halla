import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Calendar, Clock, MessageCircle, X, ChevronRight, Shield, Sparkles, ArrowRight, Send, Stars, Bot, ExternalLink } from "lucide-react";
import {
  EVENT_NAME, DATES_TEXT, TARGET_DATE_IST, THEME_HEX, REGISTER_URL, LOGO_URL, WHATSAPP_ESCALATE,
  COMMITTEES
} from "./shared/constants";

// ---------- Countdown ----------
const useCountdown = (targetISO) => {
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
};

const FlipTile = ({ label, value }) => (
  <div className="flex flex-col items-center">
    <div className="relative w-20 h-24">
      <div className="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 grid place-items-center text-4xl font-black">
        {String(value).padStart(2, "0")}
      </div>
    </div>
    <div className="mt-2 text-xs uppercase tracking-widest text-white/70">{label}</div>
  </div>
);

const Countdown = () => {
  const { past, d, h, m, s } = useCountdown(TARGET_DATE_IST);
  return (
    <div className="w-full flex flex-col items-center gap-3">
      {!past ? (
        <>
          <div className="text-white/80 text-xs uppercase tracking-[0.3em]">Countdown to Opening</div>
          <div className="flex gap-4 flex-wrap justify-center">
            <FlipTile label="Days" value={d} />
            <FlipTile label="Hours" value={h} />
            <FlipTile label="Mins" value={m} />
            <FlipTile label="Secs" value={s} />
          </div>
        </>
      ) : (
        <div className="text-center text-white">
          <div className="text-sm uppercase tracking-[0.25em] text-white/70">The big day has passed</div>
          <div className="text-2xl md:text-3xl font-semibold mt-1">
            Noir MUN {DATES_TEXT} — Thank you for an unforgettable edition!
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Particles ----------
const Particles = () => {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let w = (c.width = window.innerWidth);
    let h = (c.height = window.innerHeight);
    let raf = 0;
    const p = Array.from({ length: 100 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.9;
      p.forEach((a) => {
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath();
        ctx.arc(a.x, a.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
      for (let i = 0; i < p.length; i++)
        for (let j = i + 1; j < p.length; j++) {
          const dx = p[i].x - p[j].x, dy = p[i].y - p[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 130) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 130) * 0.18})`;
            ctx.beginPath();
            ctx.moveTo(p[i].x, p[i].y);
            ctx.lineTo(p[j].x, p[j].y);
            ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => {
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
};

// ---------- Header ----------
const Header = () => (
  <div className="fixed top-0 left-0 right-0 z-30">
    <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src={LOGO_URL} alt="Noir" className="h-10 w-10 object-contain" />
        <span className="text-white font-semibold tracking-wide">{EVENT_NAME}</span>
      </div>
      <div className="flex items-center gap-3">
        <a
          href={REGISTER_URL}
          target="_blank"
          rel="noreferrer"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border border-white/30 px-4 py-2 text-white"
        >
          <span className="absolute inset-0 -translate-x-full bg-white/10 group-hover:translate-x-0 transition-transform"></span>
          <Sparkles size={16} /> <span className="relative">Register</span>{" "}
          <ArrowRight size={16} className="relative" />
        </a>
      </div>
    </div>
  </div>
);

// ---------- Hero ----------
const Hero = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 6]);
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[96vh] pt-24 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[--theme] to-black" style={{ "--theme": THEME_HEX }} />
        <Particles />
      </div>
      <motion.div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" style={{ y: y1 }} />
      <motion.div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" style={{ rotate }} />
      <div className="relative mx-auto max-w-7xl px-4 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col items-center text-center">
          <img src={LOGO_URL} alt="Noir" className="h-24 w-24 object-contain drop-shadow-lg" />
          <h1 className="mt-6 text-4xl md:text-6xl font-black tracking-tight text-white">{EVENT_NAME}</h1>
          <div className="mt-3 flex items-center gap-3 text-white/80">
            <Calendar size={18} /> <span>{DATES_TEXT}</span>
          </div>
          <div className="mt-8"><Countdown /></div>
          <div className="mt-10 flex flex-col items-center gap-3">
            <a
              href={REGISTER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 px-6 py-3 text-white border border-white/20"
            >
              Secure your seat <ChevronRight size={18} />
            </a>
            <button
              onClick={() => navigate("/assistance")}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-5 py-2.5 text-white border border-white/20"
            >
              MUN Assistance <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ---------- Committee Grid + Modal ----------
const Committees = ({ onOpenBrief }) => (
  <section className="relative py-24">
    <div className="mx-auto max-w-7xl px-4">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">Committee Line-Up</h2>
        <p className="mt-2 text-white/70">Dynamic, diverse, and dangerously good debates.</p>
      </div>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMMITTEES.map((c, idx) => (
          <motion.button
            key={c.name}
            onClick={() => onOpenBrief(idx)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            className="text-left group relative rounded-3xl border border-white/15 bg-white/5 backdrop-blur p-6 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
            <div className="flex items-center gap-4">
              <img src={c.logo} alt={c.name} className="h-14 w-14 object-contain drop-shadow" />
              <div className="text-white font-semibold leading-tight">{c.name}</div>
            </div>
            <p className="mt-4 text-white/80">{c.agenda}</p>
            <div className="mt-5 flex items-center gap-2 text-white/70 text-sm">
              <Shield size={16} /> Tap to open brief
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-widest text-white/50">
              <Clock size={14} /> 2 days • Faridabad, India
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  </section>
);

const CommitteeBriefModal = ({ idx, onClose }) => {
  if (idx === null) return null;
  const c = COMMITTEES[idx];
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
          className="max-w-3xl w-full max-h-[85vh] overflow-auto rounded-2xl border border-white/15 bg-[#0a0a1a] text-white p-6">
          <div className="flex items-center gap-3">
            <img src={c.logo} className="h-12 w-12" alt="committee" />
            <h3 className="text-xl font-bold">{c.name}</h3>
            <button onClick={onClose} className="ml-auto p-1 hover:opacity-80">
              <X size={18} />
            </button>
          </div>
          <div className="mt-4 text-white/80"><span className="font-semibold">Agenda:</span> {c.agenda}</div>
          <div className="mt-5 grid md:grid-cols-2 gap-5">
            <div>
              <div className="text-white font-semibold">Overview</div>
              <p className="mt-2 text-white/80">{c.brief.overview}</p>
              <div className="mt-4 text-white font-semibold">Objectives</div>
              <ul className="mt-2 list-disc list-inside text-white/80 space-y-1">
                {c.brief.objectives.map((o, i) => (<li key={i}>{o}</li>))}
              </ul>
            </div>
            <div>
              <div className="text-white font-semibold">Format</div>
              <p className="mt-2 text-white/80">{c.brief.format}</p>
              <div className="mt-4 text-white font-semibold">Suggested Resources</div>
              <ul className="mt-2 list-disc list-inside text-white/80 space-y-1">
                {c.brief.resources.map((r, i) => (<li key={i}>{r}</li>))}
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ---------- Chat widget ----------
const CORE_KB = {
  meta: {
    dates: DATES_TEXT,
    fee: "₹2300",
    venue: "TBA",
    founders: "Founder: Sameer Jhamb, Co-Founder: Maahir Gulati, President: Gautam Khera",
    register: REGISTER_URL,
  },
  committees: COMMITTEES.map((c) => ({ name: c.name, agenda: c.agenda })),
};

const detectIntent = (msg) => {
  const q = String(msg || "").toLowerCase();
  if (/date|when|schedule|day/.test(q)) return { type: "dates" };
  if (/fee|fees|price|cost/.test(q)) return { type: "fee" };
  if (/venue|where|location|place/.test(q)) return { type: "venue" };
  if (/register|apply|join|sign ?up/.test(q)) return { type: "register" };
  if (/founder|who (made|runs)|organiser|organizer|oc|eb/.test(q)) return { type: "founders" };
  if (/committee|agenda|focus|topics?/.test(q)) return { type: "committees" };
  if (/human|executive|real person|someone|talk/.test(q)) return { type: "escalate" };
  return { type: "fallback" };
};

const replyFor = (intent) => {
  switch (intent.type) {
    case "dates": return `Dates: ${CORE_KB.meta.dates}.`;
    case "fee": return `Delegate fee: ${CORE_KB.meta.fee}.`;
    case "venue": return `Venue: ${CORE_KB.meta.venue}. Want WhatsApp updates when we announce?`;
    case "register": return `Tap ‘Register’ — it opens ${CORE_KB.meta.register}`;
    case "founders": return `Leadership — ${CORE_KB.meta.founders}.`;
    case "committees":
      return `Committees & agendas:\n• ${CORE_KB.committees.map((x) => `${x.name}: ${x.agenda}`).join("\n• ")}`;
    case "escalate": return `I can connect you to an executive now. Should I open WhatsApp?`;
    default: return `I’m your Noir assistant 🤖 Ask about dates, fees, venue, founders, committees — or say ‘executive’.`;
  }
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thread, setThread] = useState([{ from: "bot", text: "Hey! I’m Noir — your event assistant. Ask about dates, fee, venue, committees, founders… or say ‘executive’." }]);

  const add = (m, delay = 0) => setTimeout(() => setThread((t) => [...t, m]), delay);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setThread((t) => [...t, { from: "user", text: userMsg }]);
    const intent = detectIntent(userMsg);
    const reply = replyFor(intent);
    add({ from: "bot", text: reply }, 250);
    if (/open whatsapp|yes|sure|ok/i.test(userMsg) || intent.type === "escalate") {
      add({ from: "bot", text: "Opening WhatsApp…" }, 500);
      window.open(WHATSAPP_ESCALATE, "_blank");
    }
    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="w-96 max-w-[92vw] rounded-2xl shadow-2xl overflow-hidden border border-white/15 backdrop-blur bg-white/10 text-white">
            <div className="flex items-center justify-between px-4 py-3 bg-white/10">
              <div className="flex items-center gap-2 font-semibold"><Bot size={18} /> Noir Assistant</div>
              <button onClick={() => setOpen(false)} className="p-1 hover:opacity-80"><X size={18} /></button>
            </div>
            <div className="max-h-96 overflow-auto p-3 space-y-3">
              {thread.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.from === "bot" ? "justify-start" : "justify-end"}`}>
                  <div className={`${m.from === "bot" ? "bg-white/20" : "bg-white/30"} text-sm px-3 py-2 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="p-3 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder="Message…"
                className="flex-1 bg-white/15 px-3 py-2 rounded-xl outline-none placeholder-white/60"
              />
              <button onClick={send} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30"><Send size={16} /></button>
            </div>
            <div className="px-3 pb-3 text-[11px] text-white/70 flex items-center gap-2"><Stars size={12} /> Smart replies on-page; complex queries escalate to an executive.</div>
          </motion.div>
        )}
      </AnimatePresence>
      {!open && (
        <motion.button onClick={() => setOpen(true)} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileHover={{ y: -2 }}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl text-white shadow-xl bg-[--theme] border border-white/20 hover:shadow-2xl"
          style={{ "--theme": THEME_HEX }}>
          <MessageCircle size={18} /> Talk to us
        </motion.button>
      )}
    </div>
  );
};

// ---------- Footer (links to Legal page) ----------
const Footer = () => (
  <footer className="relative border-t border-white/10">
    <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-3 gap-8 text-white/80">
      <div>
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} className="h-10 w-10" alt="logo" />
          <div className="font-semibold">Noir MUN</div>
        </div>
        <p className="mt-3 text-sm">Faridabad, India • Precision, presence, and policy — in motion.</p>
      </div>
      <div>
        <div className="font-semibold">Legal</div>
        <Link
          to="/legal"
          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 hover:bg-white/10"
        >
          Privacy & Terms <ExternalLink size={16} />
        </Link>
      </div>
      <div>
        <div className="font-semibold">Stay in touch</div>
        <a
          href={REGISTER_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 hover:bg-white/10"
        >
          Linktree <ExternalLink size={16} />
        </a>
      </div>
    </div>
    <div className="px-4 pb-10 mx-auto max-w-7xl">
      <div className="rounded-3xl border border-white/10 p-6 text-sm text-white/80 bg-white/5 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} /> <span>Whispers Today, Echo Tomorrow.</span>
          </div>
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 px-4 py-2 text-white border border-white/20"
          >
            Register now <ChevronRight size={16} />
          </a>
        </div>
      </div>
    </div>
  </footer>
);

// ---------- Page ----------
export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [briefIdx, setBriefIdx] = useState(null);

  useEffect(() => {
    const onReady = () => setTimeout(() => setLoaded(true), 900);
    if (document.readyState === "complete") onReady();
    else window.addEventListener("load", onReady);
    return () => window.removeEventListener("load", onReady);
  }, []);
  useEffect(() => {
    document.documentElement.style.setProperty("--theme", THEME_HEX);
    document.body.style.background = THEME_HEX;
  }, []);

  return (
    <div
      className="min-h-screen text-white relative"
      style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, 'Helvetica Neue', Arial" }}
    >
      {/* Preloader */}
      <AnimatePresence>
        {!loaded && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-[--theme] text-white"
            initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
            <div className="relative w-80 h-44">
              <div className="absolute bottom-8 left-0 right-0 h-1 overflow-hidden">
                <div className="w-full h-full bg-white/20 rounded-full animate-[slide_1s_linear_infinite]"></div>
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs tracking-widest uppercase text-white/80">
                Loading Noir MUN…
              </div>
            </div>
            <style>{`@keyframes slide { from { transform: translateX(-100%);} to { transform: translateX(100%);} }`}</style>
          </motion.div>
        )}
      </AnimatePresence>

      <Header />
      <main>
        <Hero />
        <Committees onOpenBrief={(i) => setBriefIdx(i)} />
      </main>
      <Footer />
      <CommitteeBriefModal idx={briefIdx} onClose={() => setBriefIdx(null)} />
      <ChatWidget />

      <style>{`
        :root { --theme: ${THEME_HEX}; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.2); border-radius: 999px; }
        ::selection{ background: rgba(255,255,255,.25); }
      `}</style>
    </div>
  );
}
