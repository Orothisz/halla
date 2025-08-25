// src/pages/Home.jsx
import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Calendar, ChevronRight, X, Send, MessageCircle, Menu, Quote, Shield, Landmark, Crown, Columns, Users
} from "lucide-react";
import {
  LOGO_URL, DATES_TEXT, TARGET_DATE_IST, THEME_HEX, COMMITTEES, WHATSAPP_ESCALATE
} from "../shared/constants";

// Lazy-loaded components for performance
const BriefModal = lazy(() => import("../components/home/BriefModal"));
const TalkToUs = lazy(() => import("../components/home/TalkToUs"));

/* ========================================================================
   UTILITY & CUSTOM HOOKS
   ======================================================================== */

/**
 * Custom hook for the countdown logic.
 * Encapsulates the timer logic, making the component cleaner.
 */
const useCountdown = (targetISO) => {
  const [diff, setDiff] = useState(() => new Date(targetISO).getTime() - Date.now());
  useEffect(() => {
    const timer = setInterval(() => setDiff(new Date(targetISO).getTime() - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [targetISO]);

  const past = diff <= 0;
  const abs = Math.abs(diff);
  return {
    past,
    d: Math.floor(abs / (1000 * 60 * 60 * 24)),
    h: Math.floor((abs / (1000 * 60 * 60)) % 24),
    m: Math.floor((abs / (1000 * 60)) % 60),
    s: Math.floor((abs / 1000) % 60),
  };
};

/**
 * Custom hook to manage mobile menu state and body scroll lock.
 */
const useMenuState = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);
  return [menuOpen, setMenuOpen];
};


/* ========================================================================
   SHARED & REUSABLE UI COMPONENTS
   (These would ideally be in /src/components/ui/)
   ======================================================================== */

const Gilded = React.memo(({ children }) => (
  <span
    className="bg-clip-text text-transparent"
    style={{
      backgroundImage: "linear-gradient(90deg, #FFF7C4 0%, #F8E08E 15%, #E6C769 35%, #F2DA97 50%, #CDAE57 65%, #F5E6B9 85%, #E9D27F 100%)",
    }}
  >
    {children}
  </span>
));

const LaurelDivider = React.memo(() => (
  <div className="my-8 flex items-center justify-center gap-3 text-white/40">
    <div className="h-px w-12 bg-white/20" />
    <span className="tracking-[0.35em] text-xs uppercase">Laurels</span>
    <div className="h-px w-12 bg-white/20" />
  </div>
));

const QuoteCard = React.memo(({ children }) => (
  <div className="mt-6 rounded-2xl border border-white/15 bg-white/[0.05] p-4 text-white/80 backdrop-blur-sm">
    <div className="flex items-start gap-3">
      <Quote className="mt-1 shrink-0" size={18} />
      <p className="leading-relaxed">{children}</p>
    </div>
  </div>
));

/* ========================================================================
   BACKGROUND & ATMOSPHERE COMPONENTS
   (These would ideally be in /src/components/layout/)
   ======================================================================== */

const Atmosphere = React.memo(() => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      v: Math.random() * 0.35 + 0.1,
    }));

    let frameId;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,.4)";
      particles.forEach((p) => {
        p.y += p.v;
        if (p.y > h) p.y = 0;
        ctx.fillRect(p.x, p.y, 1, 1);
      });
      frameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-20 w-full h-full" />;
});

const RomanLayer = React.memo(() => {
  const { scrollYProgress } = useScroll();
  const yBust = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const yColumn = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const yLaurel = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const IMG_LEFT = "https://i.postimg.cc/sDqGkrr6/Untitled-design-5.png";
  const IMG_RIGHT = "https://i.postimg.cc/J0ttFTdC/Untitled-design-6.png";
  const IMG_CENTER = "https://i.postimg.cc/66DGSKwH/Untitled-design-7.png";

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-[.18]" style={{ backgroundImage: "radial-gradient(1100px 700px at 80% -10%, rgba(255,255,255,.16), transparent), radial-gradient(900px 600px at 12% 20%, rgba(255,255,255,.11), transparent)" }} />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <motion.div style={{ y: yBust }} className="absolute -top-28 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl" />
        <motion.div style={{ y: yColumn }} className="absolute -bottom-28 -right-24 w-[32rem] h-[32rem] rounded-full blur-3xl" />
      </div>
      <motion.img src={IMG_LEFT} alt="" loading="lazy" decoding="async" className="pointer-events-none fixed left-[-26px] top-[16vh] w-[240px] md:w-[320px] opacity-[.55] md:opacity-[.75] mix-blend-screen select-none -z-10" style={{ y: yBust, filter: "grayscale(60%) contrast(110%) blur(0.2px)" }} />
      <motion.img src={IMG_RIGHT} alt="" loading="lazy" decoding="async" className="pointer-events-none fixed right-[-10px] top-[30vh] w-[230px] md:w-[310px] opacity-[.50] md:opacity-[.72] mix-blend-screen select-none -z-10" style={{ y: yColumn, filter: "grayscale(60%) contrast(112%) blur(0.2px)" }} />
      <motion.img src={IMG_CENTER} alt="" loading="lazy" decoding="async" className="pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-[4vh] w-[540px] max-w-[88vw] opacity-[.40] md:opacity-[.55] mix-blend-screen select-none -z-10" style={{ y: yLaurel, filter: "grayscale(55%) contrast(108%)" }} />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-[.07] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 .9'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23n)' /></svg>\")" }} />
    </>
  );
});


/* ========================================================================
   PAGE-SPECIFIC COMPONENTS
   (These would ideally be in /src/components/home/)
   ======================================================================== */

const Prologue = React.memo(() => (
  <motion.section 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    className="relative isolate overflow-hidden rounded-[28px] border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur"
  >
    <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-white/10 blur-3xl rounded-full" />
    <div className="pointer-events-none absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-white/10 blur-3xl rounded-full" />
    <div className="relative z-10 px-6 md:px-10 pt-12 pb-14 text-center">
      <motion.img 
        src={LOGO_URL} 
        alt="Noir" 
        className="h-20 w-20 mx-auto object-contain drop-shadow" 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
      />
      <h1 className="mt-6 text-[40px] md:text-[68px] leading-none font-black tracking-tight">
        NOIR&nbsp;MUN&nbsp;2025
      </h1>
      <div className="mt-3 inline-flex items-center gap-2 text-white/80">
        <Calendar size={16} /> {DATES_TEXT} • Faridabad, India
      </div>
      <div className="mt-5 text-xl md:text-2xl font-semibold">
        <Gilded>Whispers Today, Echo Tomorrow</Gilded>
      </div>
      <QuoteCard>
        In marble and laurel, discipline met rhetoric. Noir brings that precision to diplomacy — a modern pantheon where words shape order.
      </QuoteCard>
      <div className="mt-9 relative z-20 flex flex-col sm:flex-row items-center justify-center gap-3">
        <motion.a
          href="https://noirmun.com/register" target="_blank" rel="noreferrer"
          className="click-safe inline-flex items-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 px-6 py-3 text-white border border-white/20 w-full sm:w-auto justify-center"
          whileHover={{ y: -2, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          Secure Your Seat <ChevronRight size={18} />
        </motion.a>
        <Link to="/assistance" className="click-safe text-sm text-white/70 hover:text-white hover:underline">
          MUN Assistance
        </Link>
      </div>
      <div className="mt-4 text-white/70 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="click-safe underline hover:text-white">Log in</Link>
      </div>
    </div>
  </motion.section>
));

const Chapter = React.memo(({ kicker, title, children, icon }) => (
  <motion.section 
    className="mt-16 rounded-[28px] border border-white/12 p-6 md:p-10 bg-white/[0.04] backdrop-blur-sm ring-1 ring-white/5"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    <div className="text-white/60 text-xs tracking-[0.35em] uppercase">{kicker}</div>
    <div className="mt-2 flex items-center gap-3">
      {icon}
      <h2 className="text-2xl md:text-3xl font-extrabold">{title}</h2>
    </div>
    <div className="mt-4 text-white/80 leading-relaxed">{children}</div>
  </motion.section>
));

const CountdownBlock = React.memo(({ label, value }) => {
    const springValue = useSpring(value, { stiffness: 200, damping: 20 });
    useEffect(() => {
        springValue.set(value);
    }, [value, springValue]);

    return (
        <div className="flex flex-col items-center">
            <div className="w-20 h-24 md:w-24 md:h-28 rounded-2xl bg-white/8 border border-white/15 grid place-items-center text-4xl md:text-5xl font-black overflow-hidden">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={value}
                        initial={{ y: '100%' }}
                        animate={{ y: '0%' }}
                        exit={{ y: '-100%' }}
                        transition={{ ease: 'circOut', duration: 0.5 }}
                    >
                        {String(value).padStart(2, "0")}
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/70">{label}</div>
        </div>
    );
});

const PosterCard = ({ committee, onOpen }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <motion.button
      ref={ref}
      onClick={onOpen}
      className="group relative rounded-[26px] overflow-hidden border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.025] text-left focus:outline-none focus:ring-2 focus:ring-yellow-100/20"
      whileHover={{ y: -5, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <motion.div style={{ y }} className="aspect-[16/10] md:aspect-[16/9] w-full grid place-items-center px-6 text-center">
        <div className="mx-auto mt-2 shrink-0 rounded-full border border-yellow-100/20 bg-white/[0.06] w-16 h-16 md:w-20 md:h-20 grid place-items-center shadow-[0_0_0_1px_rgba(255,255,255,.04)_inset]">
          <img src={committee.logo} alt={`${committee.name} logo`} className="w-[72%] h-[72%] object-contain" onError={(e) => { e.currentTarget.style.opacity = 0.35; }} />
        </div>
        <div className="mt-4">
          <div className="font-semibold text-lg leading-tight">{committee.name}</div>
          <div className="text-xs text-white/70 line-clamp-3 mt-2">{committee.agenda}</div>
        </div>
      </motion.div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: "inset 0 0 140px rgba(255,255,255,.09)" }} />
        <div className="absolute inset-0 rounded-[26px] border border-yellow-200/0 group-hover:border-yellow-100/25 transition-colors" />
      </div>
    </motion.button>
  );
};

const PosterWall = React.memo(({ onOpen }) => (
  <section className="mt-8">
    <div className="text-center">
      <h3 className="text-3xl md:text-4xl font-extrabold"><Gilded>The Councils</Gilded></h3>
      <p className="mt-2 text-white/70">Step into chambers where rhetoric rivals legend.</p>
    </div>
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {COMMITTEES.map((c, idx) => (
        <PosterCard key={c.name} committee={c} onOpen={() => onOpen(idx)} />
      ))}
    </div>
  </section>
));


/* ========================================================================
   MAIN PAGE COMPONENT
   ======================================================================== */

export default function Home() {
  const { scrollYProgress } = useScroll();
  const yHalo = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const [briefIdx, setBriefIdx] = useState(null);
  const [menuOpen, setMenuOpen] = useMenuState();
  const { past, d, h, m, s } = useCountdown(TARGET_DATE_IST);

  useEffect(() => {
    document.documentElement.style.setProperty("--theme", THEME_HEX);
    document.body.style.background = THEME_HEX;
  }, []);

  return (
    <div className="min-h-screen text-white relative">
      <Atmosphere />
      <RomanLayer />
      <motion.div className="pointer-events-none fixed -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" style={{ y: yHalo }} />
      <motion.div className="pointer-events-none fixed -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" style={{ y: yHalo }} />

      <header className="sticky top-0 z-30 bg-gradient-to-b from-[#000026]/60 to-transparent backdrop-blur border-b border-white/10">
        {/* Header content from original file */}
      </header>
      
      <AnimatePresence>
        {menuOpen && (
          // Mobile Menu content from original file, with focus trapping
          <></>
        )}
      </AnimatePresence>
      
      <main className="mx-auto max-w-7xl px-4 py-10">
        <Prologue />

        <Chapter kicker="Chapter I" title="The Origin" icon={<Shield size={20} className="text-white/70" />}>
          Born from a love of design and debate, Noir is led by a council of builders and diplomats.
          <LaurelDivider />
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Landmark size={16} /> <em>Ordo • Disciplina • Dignitas</em>
          </div>
        </Chapter>

        <Chapter kicker="Chapter II" title="The Call" icon={<Calendar size={20} className="text-white/70" />}>
          The dates are set: <strong>{DATES_TEXT}</strong>. Your presence turns whispers into echoes.
          {!past ? (
            <div className="mt-5 flex gap-5 flex-wrap justify-center">
              <CountdownBlock label="Days" value={d} />
              <CountdownBlock label="Hours" value={h} />
              <CountdownBlock label="Mins" value={m} />
              <CountdownBlock label="Secs" value={s} />
            </div>
          ) : (
            <div className="mt-5 text-center text-white/80">See you at Noir MUN — thank you!</div>
          )}
        </Chapter>

        <Chapter kicker="Chapter III" title="The Pantheon of Councils" icon={<Columns size={20} className="text-white/70" />}>
          Each chamber upholds a different creed — strategy, justice, history, negotiation. Choose your arena, study the agenda, and step into the role.
          <PosterWall onOpen={(i) => setBriefIdx(i)} />
        </Chapter>

        <Chapter kicker="Chapter IV" title="The Oath" icon={<ChevronRight size={20} className="text-white/70" />}>
          Two days. One stage. Bring your discipline, your design, your diplomacy.
          {/* ImpactCTA component from original file */}
        </Chapter>
      </main>

      {/* Footer from original file */}
      
      <Suspense fallback={null}>
        <TalkToUs />
        <BriefModal idx={briefIdx} onClose={() => setBriefIdx(null)} />
      </Suspense>

      <style>{`
        :root { --theme: ${THEME_HEX}; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        /* Other styles from original file */
      `}</style>
    </div>
  );
}
