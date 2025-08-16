// src/pages/BestMunDelhi.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  LOGO_URL,
  COMMITTEES,
  THEME_HEX,
  DATES_TEXT,
} from "../shared/constants";

/* -------------------- SEO -------------------- */
function useSEO() {
  useEffect(() => {
    const title = "Best MUN in Delhi & Faridabad — Noir MUN 2025";
    const desc =
      "Searching for the best MUN in Delhi NCR and Faridabad? Noir MUN 2025 sets a new standard with elite councils, a hand-picked Executive Board, and an immersive two-day experience. Register now.";
    const canonical = `${window.location.origin}/best-mun-delhi-faridabad`;

    document.title = title;

    const meta = (key, val, attr = "name") => {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", val);
    };

    meta("viewport", "width=device-width, initial-scale=1, viewport-fit=cover");
    meta("theme-color", "#000000");
    meta("description", desc);
    meta("og:title", title, "property");
    meta("og:description", desc, "property");
    meta("og:type", "website", "property");
    meta("og:url", canonical, "property");
    meta("og:image", LOGO_URL, "property");
    meta("twitter:card", "summary_large_image");
    meta("twitter:title", title);
    meta("twitter:description", desc);
    meta("twitter:image", LOGO_URL);

    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, []);
}

/* ---------- Atmosphere (subtle starfield) ---------- */
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

/* ---------- Roman Layer (statues, marble, parallax) ---------- */
function RomanLayer() {
  const { scrollYProgress } = useScroll();
  const yBust = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const yColumn = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const yLaurel = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const IMG_LEFT = "https://i.postimg.cc/sDqGkrr6/Untitled-design-5.png";
  const IMG_RIGHT = "https://i.postimg.cc/J0ttFTdC/Untitled-design-6.png";
  const IMG_CENTER = "https://i.postimg.cc/66DGSKwH/Untitled-design-7.png";

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[.18]"
        style={{
          backgroundImage:
            "radial-gradient(1100px 700px at 80% -10%, rgba(255,255,255,.16), rgba(0,0,0,0)), radial-gradient(900px 600px at 12% 20%, rgba(255,255,255,.11), rgba(0,0,0,0))",
        }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <motion.div style={{ y: yBust }} className="absolute -top-28 -left-24 w-[28rem] h-[28rem] rounded-full blur-3xl" />
        <motion.div style={{ y: yColumn }} className="absolute -bottom-28 -right-24 w-[32rem] h-[32rem] rounded-full blur-3xl" />
      </div>
      <motion.img src={IMG_LEFT} alt="" loading="lazy" decoding="async"
        className="pointer-events-none fixed left-[-26px] top-[16vh] w-[240px] md:w-[320px] opacity-[.55] md:opacity-[.75] mix-blend-screen select-none -z-10"
        style={{ y: yBust, filter: "grayscale(60%) contrast(110%) blur(0.2px)" }} />
      <motion.img src={IMG_RIGHT} alt="" loading="lazy" decoding="async"
        className="pointer-events-none fixed right-[-10px] top-[30vh] w-[230px] md:w-[310px] opacity-[.50] md:opacity-[.72] mix-blend-screen select-none -z-10"
        style={{ y: yColumn, filter: "grayscale(60%) contrast(112%) blur(0.2px)" }} />
      <motion.img src={IMG_CENTER} alt="" loading="lazy" decoding="async"
        className="pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-[4vh] w-[540px] max-w-[88vw] opacity-[.40] md:opacity-[.55] mix-blend-screen select-none -z-10"
        style={{ y: yLaurel, filter: "grayscale(55%) contrast(108%)" }} />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-[.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 .9'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23n)' /></svg>\")",
        }}
      />
    </>
  );
}

/* ---------- Footer (from Home.jsx InlineFooter) ---------- */
function InlineFooter() {
  const REGISTER_HREF = "https://noirmun.com/register";
  const IG_HREF = "https://instagram.com/noirmodelun";
  const LINKTREE_HREF = "https://linktr.ee/noirmun";

  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-4 text-white/80">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Noir" className="h-10 w-10 object-contain" />
          <div>
            <div className="font-semibold">Noir MUN</div>
            <div className="text-xs text-white/60">Faridabad, India</div>
          </div>
        </div>
        <div>
          <div className="font-semibold">Explore</div>
          <Link to="/assistance" className="block text-sm hover:underline">Assistance</Link>
          <a href="https://www.noirmun.com/best-mun-delhi-faridabad" className="block text-sm hover:underline"
            target="_blank" rel="noreferrer" title="Best Model UN (MUN) in Delhi & Faridabad – 2025 Guide">
            Best MUN in Delhi &amp; Faridabad (2025 Guide)
          </a>
          <Link to="/login" className="block text-sm hover:underline">Login</Link>
          <Link to="/signup" className="block text-sm hover:underline">Sign Up</Link>
          <a href={REGISTER_HREF} target="_blank" rel="noreferrer" className="block text-sm hover:underline">Register</a>
        </div>
        <div>
          <div className="font-semibold">Socials</div>
          <a href={IG_HREF} target="_blank" rel="noreferrer" className="block text-sm hover:underline">Instagram</a>
          <a href={LINKTREE_HREF} target="_blank" rel="noreferrer" className="block text-sm hover:underline">Linktree</a>
        </div>
        <div>
          <div className="font-semibold">Legal</div>
          <Link to="/legal" className="block text-sm hover:underline">Terms & Privacy</Link>
          <div className="text-xs text-white/60">© {new Date().getFullYear()} Noir MUN — “Whispers Today, Echo Tomorrow.”</div>
        </div>
      </div>
    </footer>
  );
}

/* -------------------- Page -------------------- */
export default function BestMunDelhi() {
  useSEO();

  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const yHalo = useTransform(scrollYProgress, [0, 1], [0, -120]);

  useEffect(() => {
    document.documentElement.style.setProperty("--theme", THEME_HEX);
    document.body.style.background = THEME_HEX;
  }, []);

  const STAFF = [
    ["Sameer Jhamb", "Founder"],
    ["Maahir Gulati", "Co-Founder"],
    ["Gautam Khera", "President"],
    ["Daanish Narang", "Chief Advisor"],
    ["Vishesh Kumar", "Junior Advisor"],
    ["Jhalak Batra", "Secretary General"],
    ["Anushka Dua", "Director General"],
    ["Mahi Choudharie", "Deputy Director General"],
    ["Namya Negi", "Deputy Secretary General"],
    ["Shambhavi Sharma", "Vice President"],
    ["Shubh Dahiya", "Executive Director"],
    ["Nimay Gupta", "Deputy Executive Director"],
    ["Gauri Khatter", "Charge D'Affaires"],
    ["Garima", "Conference Director"],
    ["Madhav Sadana", "Conference Director"],
    ["Shreyas Kalra", "Chef D Cabinet"],
    ["Ikshit Sethi", "Convenor"],
  ];

  const REGISTER_HREF = "https://noirmun.com/register";

  return (
    <div className="min-h-screen text-white relative overflow-clip">
      <Atmosphere />
      <RomanLayer />
      <motion.div className="pointer-events-none fixed -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" style={{ y: yHalo }} />
      <motion.div className="pointer-events-none fixed -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" style={{ y: yHalo }} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-b from-[#000026]/60 to-transparent backdrop-blur border-b border-white/10"
        style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <img src={LOGO_URL} alt="Noir MUN logo" className="h-8 w-8 object-contain shrink-0" />
              <span className="font-semibold truncate">Noir MUN</span>
            </Link>
            <h1 className="ml-2 text-sm sm:text-base font-bold truncate">Best MUN in Delhi NCR &amp; Faridabad</h1>
            <div className="ml-auto hidden sm:flex items-center gap-2">
              <Link to="/" className="rounded-lg px-3 py-2 text-sm hover:bg-white/10">Home</Link>
              <Link to="/assistance" className="rounded-lg px-3 py-2 text-sm hover:bg-white/10">Assistance</Link>
              <Link to="/committees" className="rounded-lg px-3 py-2 text-sm hover:bg-white/10">Committees</Link>
              <a href={REGISTER_HREF} target="_blank" rel="noreferrer"
                className="rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10">Register</a>
            </div>
            <button aria-label="Toggle menu" className="ml-auto sm:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-white/10 active:scale-[.98]"
              onClick={() => setMenuOpen((s) => !s)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>
          {menuOpen && (
            <nav className="sm:hidden mt-3 grid gap-2 pb-2">
              <Link to="/" onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-base bg-white/[0.04] border border-white/10">Home</Link>
              <Link to="/assistance" onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-base bg-white/[0.04] border border-white/10">Assistance</Link>
              <Link to="/committees" onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-base bg-white/[0.04] border border-white/10">Committees</Link>
              <a href={REGISTER_HREF} target="_blank" rel="noreferrer"
                className="rounded-xl px-3 py-3 text-base bg-white/15 hover:bg-white/25 border border-white/20 text-center">Register</a>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* Sections ... unchanged ... */}
        {/* (keep the Why Noir, Info Cards, Team, FAQs, CTA sections same as your version) */}
      </main>

      {/* Footer from Home.jsx */}
      <InlineFooter />

      <style>{`
        :root { --theme: ${THEME_HEX}; }
        a { color: #fff; -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
