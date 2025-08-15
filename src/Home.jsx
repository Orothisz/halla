import { useEffect, useMemo, useRef, useState } from "react";
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
import { Calendar, ChevronRight, Sparkles } from "lucide-react";

/* ---------- Starfield (very subtle) ---------- */
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

/* ---------- Faux live ticker ---------- */
const TICKER_POOL = [
  "UNGA: Draft framework on accountability gains momentum",
  "AIPPM: Heated exchange over land & faith provisions",
  "UNCSW: Survivors-first reintegration toolkit in focus",
  "IPL: Mega Auction war room simulations underway",
  "IP: Breaking—Photo brief drops at 18:00",
  "YT All Stars: Classified crisis card rumored",
];
function Ticker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % TICKER_POOL.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="mt-10 border border-white/10 bg-white/5 rounded-2xl overflow-hidden">
      <div className="px-4 py-2 text-xs uppercase tracking-widest text-white/60 border-b border-white/10">
        Noir Live (simulated)
      </div>
      <div className="px-4 py-3 text-white/85 whitespace-nowrap overflow-hidden">
        <motion.div
          key={i}
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }}
        >
          {TICKER_POOL[i]}
        </motion.div>
      </div>
    </div>
  );
}

/* ---------- Dossier intro + Tagline ---------- */
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
    <div className="mt-8 flex flex-col items-center gap-3">
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

/* ---------- Committee Lobby (glowing doors) ---------- */
function Lobby() {
  // 6 doors = committees; rotate slightly on hover → “door opens”
  return (
    <section className="mt-16">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold">Committee Lobby</h2>
        <p className="mt-2 text-white/70">Tap a door to open a dossier brief.</p>
      </div>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMMITTEES.map((c, idx) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="group relative h-48 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                 style={{ boxShadow: "inset 0 0 120px rgba(255,255,255,.12)" }} />
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 blur-2xl rounded-full" />
            <div className="absolute inset-0 grid place-items-center">
              <img src={c.logo} alt={c.name} className="h-14 w-14 object-contain drop-shadow" />
              <div className="mt-3 text-center">
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-white/70 line-clamp-2 mt-1">{c.agenda}</div>
              </div>
            </div>
            <motion.div
              className="absolute inset-0"
              whileHover={{ rotateY: -12, scale: 1.02 }}
              style={{ transformStyle: "preserve-3d" }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Page ---------- */
export default function Home() {
  const { scrollYProgress } = useScroll();
  const yHalo = useTransform(scrollYProgress, [0, 1], [0, -120]);

  useEffect(() => {
    document.documentElement.style.setProperty("--theme", THEME_HEX);
    document.body.style.background = THEME_HEX;
  }, []);

  return (
    <div className="min-h-screen text-white relative">
      <Starfield />
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
              <Sparkles size={16} /> <span className="relative">Register</span>
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10">
        <Intro />
        <Countdown />
        <Ticker />
        <Lobby />
      </main>

      <footer className="mt-16 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-white/70">
          © {new Date().getFullYear()} Noir MUN • Faridabad, India •
          <span className="ml-2">“Whispers Today, Echo Tomorrow.”</span>
        </div>
      </footer>

      <style>{`
        :root { --theme: ${THEME_HEX}; }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>
    </div>
  );
}
