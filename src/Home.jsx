import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LOGO_URL,
  REGISTER_URL,
  DATES_TEXT,
  TARGET_DATE_IST,
  THEME_HEX,
  COMMITTEES,
} from "./shared/constants";
import { Calendar, ChevronRight, X } from "lucide-react";

/* ---------- Subtle starfield ---------- */
function Starfield() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let w = (c.width = window.innerWidth);
    let h = (c.height = window.innerHeight);
    const s = Array.from({ length: 140 }, () => ({
      x: Math.random() * w, y: Math.random() * h, v: Math.random() * 0.4 + 0.15,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,.45)";
      s.forEach(p => { p.y += p.v; if (p.y > h) p.y = 0; ctx.fillRect(p.x, p.y, 1, 1); });
      requestAnimationFrame(draw);
    };
    const onResize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    draw();
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return <canvas ref={ref} className="fixed inset-0 -z-10 w-full h-full" />;
}

/* ---------- Mouse spotlight (no extra deps) ---------- */
function Spotlight() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      el.style.background = `radial-gradient(300px 300px at ${x}px ${y}px, rgba(255,255,255,.08), transparent 60%)`;
    };
    window.addEventListener("mousemove", move);
    move({ clientX: window.innerWidth / 2, clientY: 200 });
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return <div ref={ref} className="pointer-events-none fixed inset-0 -z-10" />;
}

/* ---------- Countdown ---------- */
function useCountdown(targetISO) {
  const [diff, setDiff] = useState(() => new Date(targetISO).getTime() - Date.now());
  useEffect(() => {
    const t = setInterval(() => setDiff(new Date(targetISO).getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [targetISO]);
  const past = diff <= 0, abs = Math.abs(diff);
  const d = Math.floor(abs / (1000 * 60 * 60 * 24));
  const h = Math.floor((abs / (1000 * 60 * 60)) % 24);
  const m = Math.floor((abs / (1000 * 60)) % 60);
  const s = Math.floor((abs / 1000) % 60);
  return { past, d, h, m, s };
}
const Flip = ({ label, value }) => (
  <div className="flex flex-col items-center">
    <div className="w-20 h-24 rounded-2xl bg-white/10 border border-white/15 grid place-items-center text-4xl font-black">
      {String(value).padStart(2, "0")}
    </div>
    <div className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/70">{label}</div>
  </div>
);

/* ---------- Brief Modal ---------- */
function BriefModal({ idx, onClose }) {
  if (idx === null) return null;
  const c = COMMITTEES[idx];
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}
          className="max-w-3xl w-full max-h-[85vh] overflow-auto rounded-2xl border border-white/15 bg-[#0a0a1a] text-white p-6"
        >
          <div className="flex items-center gap-3">
            <img src={c.logo} className="h-12 w-12" alt="committee" />
            <h3 className="text-xl font-bold">{c.name}</h3>
            <button onClick={onClose} className="ml-auto p-1 hover:opacity-80"><X size={18} /></button>
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
                {c.brief.objectives.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-white font-semibold">Format</div>
              <p className="mt-2 text-white/80">{c.brief.format}</p>
              <div className="mt-4 text-white font-semibold">Suggested Resources</div>
              <ul className="mt-2 list-disc list-inside text-white/80 space-y-1">
                {c.brief.resources.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- Intro + Tagline ---------- */
function Intro() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
      <div className="absolute -top-20 -left-16 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-white/10 blur-3xl rounded-full" />
      <div className="px-6 pt-8 pb-10 text-center">
        <motion.img
          src={LOGO_URL}
          alt="Noir"
          className="h-20 w-20 mx-auto object-contain drop-shadow"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
        <motion.h1
          className="mt-4 text-4xl md:text-6xl font-black tracking-tight"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          Noir Model United Nations
        </motion.h1>
        <motion.div
          className="mt-2 inline-flex items-center gap-2 text-white/80"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        >
          <Calendar size={16} /> {DATES_TEXT}
        </motion.div>

        {/* Tagline: Whispers → Echo */}
        <div className="mt-6">
          <div className="relative inline-block">
            <motion.div
              className="text-white/60"
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8 }}
            >
              Whispers Today,
            </motion.div>
            <motion.div
              className="text-2xl md:text-3xl font-semibold"
              initial={{ opacity: 0, y: 8, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0.02em" }}
              transition={{ delay: 0.35, duration: 0.8 }}
            >
              Echo Tomorrow
            </motion.div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={REGISTER_URL} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 px-6 py-3 text-white border border-white/20"
          >
            Secure your seat <ChevronRight size={18} />
          </a>
          <Link
            to="/assistance"
            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-6 py-3 text-white border border-white/20"
          >
            MUN Assistance <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------- Countdown ---------- */
function Countdown() {
  const { past, d, h, m, s } = useCountdown(TARGET_DATE_IST);
  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      {!past ? (
        <>
          <div className="text-white/70 text-xs tracking-[0.25em] uppercase">Countdown</div>
          <div className="flex gap-4 flex-wrap justify-center">
            <Flip label="Days" value={d} />
            <Flip label="Hours" value={h} />
            <Flip label="Mins" value={m} />
            <Flip label="Secs" value={s} />
          </div>
        </>
      ) : (
        <div className="text-white/80">See you at Noir MUN — thank you!</div>
      )}
    </div>
  );
}

/* ---------- Echo ribbon (pure visual, no text) ---------- */
function EchoRibbon() {
  return (
    <div
      className="mt-12 h-16 rounded-2xl border border-white/10 overflow-hidden"
      style={{
        background:
          "repeating-linear-gradient( -45deg, rgba(255,255,255,.06) 0 12px, rgba(255,255,255,.02) 12px 24px )",
      }}
    >
      <div className="h-full w-[200%] animate-[slide_14s_linear_infinite]"
           style={{ background: "linear-gradient(90deg, rgba(255,255,255,.12), rgba(255,255,255,0), rgba(255,255,255,.12))" }} />
      <style>{`@keyframes slide { from { transform: translateX(-50%);} to { transform: translateX(0%);} }`}</style>
    </div>
  );
}

/* ---------- Lobby (click → open brief) ---------- */
function Lobby({ onOpen }) {
  return (
    <section className="mt-16">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold">Committee Lobby</h2>
        <p className="mt-2 text-white/70">Tap a door to open a dossier brief.</p>
      </div>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMMITTEES.map((c, idx) => (
          <motion.button
            key={c.name}
            onClick={() => onOpen(idx)}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="group relative h-48 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] text-left"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                 style={{ boxShadow: "inset 0 0 120px rgba(255,255,255,.12)" }} />
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 blur-2xl rounded-full" />
            <div className="absolute inset-0 grid place-items-center">
              <img src={c.logo} alt={c.name} className="h-14 w-14 object-contain drop-shadow" />
              <div className="mt-3 text-center px-4">
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-white/70 line-clamp-2 mt-1">{c.agenda}</div>
              </div>
            </div>
            <motion.div
              className="absolute inset-0"
              whileHover={{ rotateY: -12, scale: 1.02 }}
              style={{ transformStyle: "preserve-3d" }}
            />
          </motion.button>
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

  useEffect(() => {
    document.documentElement.style.setProperty("--theme", THEME_HEX);
    document.body.style.background = THEME_HEX;
  }, []);

  return (
    <div className="min-h-screen text-white relative">
      <Starfield />
      <Spotlight />
      {/* soft halos */}
      <motion.div
        className="pointer-events-none fixed -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl"
        style={{ y: yHalo }}
      />
      <motion.div
        className="pointer-events-none fixed -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"
        style={{ y: yHalo }}
      />

      <header className="sticky top-0 z-20 bg-gradient-to-b from-[#000026]/60 to-transparent backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Noir" className="h-10 w-10 object-contain" />
            <span className="font-semibold tracking-wide">Noir MUN</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link to="/assistance" className="rounded-xl border border-white/20 px-3 py-2">
              Assistance
            </Link>
            <a
              href={REGISTER_URL} target="_blank" rel="noreferrer"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-white/30 px-4 py-2"
            >
              <span className="absolute inset-0 -translate-x-full bg-white/10 group-hover:translate-x-0 transition-transform" />
              <span className="relative">Register</span> <ChevronRight size={16} className="relative" />
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10">
        <Intro />
        <Countdown />
        <EchoRibbon />
        <Lobby onOpen={(i) => setBriefIdx(i)} />
      </main>

      <footer className="mt-16 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-white/70">
          © {new Date().getFullYear()} Noir MUN • Faridabad, India •
          <span className="ml-2">“Whispers Today, Echo Tomorrow.”</span>
        </div>
      </footer>

      <BriefModal idx={briefIdx} onClose={() => setBriefIdx(null)} />

      <style>{`
        :root { --theme: ${THEME_HEX}; }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>
    </div>
  );
}
