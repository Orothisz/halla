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

/* ---------- Subtle atmosphere (star specks + spotlight) ---------- */
function Atmosphere() {
  const star = useRef(null);
  const glow = useRef(null);

  useEffect(() => {
    // starfield
    const c = star.current;
    const ctx = c.getContext("2d");
    let w = (c.width = window.innerWidth);
    let h = (c.height = window.innerHeight);
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
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    draw();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    // spotlight follows cursor (very soft)
    const el = glow.current;
    const move = (e) => {
      const x = e.clientX, y = e.clientY;
      el.style.background = `radial-gradient(360px 360px at ${x}px ${y}px, rgba(255,255,255,.10), transparent 60%)`;
    };
    window.addEventListener("mousemove", move, { passive: true });
    move({ clientX: window.innerWidth / 2, clientY: 220 });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <>
      <canvas ref={star} className="fixed inset-0 -z-20 w-full h-full" />
      <div ref={glow} className="fixed inset-0 -z-10 pointer-events-none" />
    </>
  );
}

/* ---------- Countdown (monumental digits) ---------- */
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
const BigBlock = ({ label, value }) => (
  <div className="flex flex-col items-center">
    <div className="w-24 h-28 md:w-28 md:h-32 rounded-2xl bg-white/8 border border-white/15 grid place-items-center text-5xl md:text-6xl font-black tracking-tight">
      {String(value).padStart(2, "0")}
    </div>
    <div className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/70">{label}</div>
  </div>
);

/* ---------- Committee Brief Modal ---------- */
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

/* ---------- HERO: “Event of the Decade” poster ---------- */
function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur">
      {/* soft halos */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-white/10 blur-3xl rounded-full" />

      <div className="px-6 md:px-10 pt-12 pb-14 text-center">
        <motion.img
          src={LOGO_URL}
          alt="Noir"
          className="h-24 w-24 mx-auto object-contain drop-shadow"
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}
        />
        <motion.h1
          className="mt-6 text-[44px] md:text-[72px] leading-none font-black tracking-tight"
          initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05, duration: 0.7 }}
        >
          NOIR&nbsp;MUN&nbsp;2025
        </motion.h1>

        <motion.div
          className="mt-3 inline-flex items-center gap-2 text-white/80"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        >
          <Calendar size={16} /> {DATES_TEXT} • Faridabad
        </motion.div>

        {/* Tagline — bold, minimal */}
        <motion.div
          className="mt-5 text-xl md:text-2xl font-semibold"
          initial={{ opacity: 0, letterSpacing: "0.35em" }}
          animate={{ opacity: 1, letterSpacing: "0.02em" }}
          transition={{ delay: 0.35, duration: 0.9 }}
        >
          Whispers Today, Echo Tomorrow
        </motion.div>

        {/* CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noreferrer"
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
    </section>
  );
}

/* ---------- Monumental countdown ---------- */
function MonumentalCountdown() {
  const { past, d, h, m, s } = useCountdown(TARGET_DATE_IST);
  return (
    <section className="mt-12 border border-white/12 rounded-[28px] p-6 md:p-8 bg-white/[0.04]">
      {!past ? (
        <div className="flex flex-col items-center">
          <div className="text-white/65 text-xs tracking-[0.35em] uppercase">Countdown</div>
          <div className="mt-4 flex gap-5 flex-wrap justify-center">
            <BigBlock label="Days" value={d} />
            <BigBlock label="Hours" value={h} />
            <BigBlock label="Mins" value={m} />
            <BigBlock label="Secs" value={s} />
          </div>
        </div>
      ) : (
        <div className="text-center text-white/80">See you at Noir MUN — thank you!</div>
      )}
    </section>
  );
}

/* ---------- Committee “poster” wall (open brief on click) ---------- */
function PosterWall({ onOpen }) {
  return (
    <section className="mt-16">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold">The Councils</h2>
        <p className="mt-2 text-white/70">Tap a poster to open the dossier.</p>
      </div>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {COMMITTEES.map((c, idx) => (
          <motion.button
            key={c.name}
            onClick={() => onOpen(idx)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="group relative h-[18rem] rounded-[26px] overflow-hidden border border-white/12 text-left bg-gradient-to-b from-white/[0.06] to-white/[0.025]"
          >
            {/* gloss */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -left-10 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{ boxShadow: "inset 0 0 160px rgba(255,255,255,.10)" }} />
            </div>
            <div className="absolute inset-0 grid place-items-center px-6 text-center">
              <img src={c.logo} alt={c.name} className="h-16 w-16 object-contain drop-shadow" />
              <div className="mt-3">
                <div className="font-semibold text-lg leading-tight">{c.name}</div>
                <div className="text-xs text-white/70 line-clamp-3 mt-2">{c.agenda}</div>
              </div>
            </div>
            {/* micro “tilt” */}
            <motion.div
              className="absolute inset-0"
              whileHover={{ rotateX: 4, rotateY: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 120, damping: 12 }}
              style={{ transformStyle: "preserve-3d" }}
            />
          </motion.button>
        ))}
      </div>
    </section>
  );
}

/* ---------- Impact statement + CTA ---------- */
function ImpactCTA() {
  return (
    <section className="mt-16 rounded-[28px] border border-white/12 p-8 md:p-10 bg-white/[0.04] text-center">
      <div className="text-[28px] md:text-[36px] font-extrabold leading-tight">
        The council that will echo tomorrow.
      </div>
      <div className="mt-2 text-white/70">
        Two days. One stage. Bring your discipline, your design, your diplomacy.
      </div>
      <a
        href={REGISTER_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 px-6 py-3 text-white border border-white/20"
      >
        Register Now <ChevronRight size={18} />
      </a>
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
      <Atmosphere />
      {/* subtle drifting halos */}
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
              href={REGISTER_URL}
              target="_blank"
              rel="noreferrer"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-white/30 px-4 py-2"
            >
              <span className="absolute inset-0 -translate-x-full bg-white/10 group-hover:translate-x-0 transition-transform" />
              <span className="relative">Register</span> <ChevronRight size={16} className="relative" />
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10">
        <Hero />
        <MonumentalCountdown />
        <PosterWall onOpen={(i) => setBriefIdx(i)} />
        <ImpactCTA />
      </main>

      <footer className="mt-16 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-white/70">
          © {new Date().getFullYear()} Noir MUN • Faridabad • “Whispers Today, Echo Tomorrow.”
        </div>
      </footer>

      <BriefModal idx={briefIdx} onClose={() => setBriefIdx(null)} />

      <style>{`
        :root { --theme: ${THEME_HEX}; }
        .line-clamp-3 { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>
    </div>
  );
}
