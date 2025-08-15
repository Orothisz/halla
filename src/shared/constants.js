import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { X, ChevronRight, Send, MessageCircle } from "lucide-react";

import {
  LOGO_URL,
  THEME_HEX,
  REGISTER_URL,
  POSTERS,
  BRIEFS,
} from "../shared/constants";

/* --- Atmosphere background --- */
function Atmosphere() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#00001a] via-[#00001a] to-[#000026]" />
  );
}

/* --- Hero --- */
function Hero() {
  return (
    <section className="text-center py-20 space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-6xl font-extrabold tracking-tight"
      >
        Noir MUN 2025
      </motion.h1>
      <p className="text-white/70 text-lg max-w-2xl mx-auto">
        The event of the decade — where whispers today echo tomorrow.
      </p>
      <div className="flex justify-center gap-4 mt-6">
        <a
          href={REGISTER_URL}
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30"
        >
          Register Now
        </a>
        <Link
          to="/assistance"
          className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20"
        >
          Get Assistance
        </Link>
      </div>
    </section>
  );
}

/* --- Countdown --- */
function MonumentalCountdown() {
  const targetDate = new Date("2025-10-11T09:00:00+05:30").getTime();
  const [timeLeft, setTimeLeft] = useState(targetDate - Date.now());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(targetDate - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const days = Math.max(Math.floor(timeLeft / (1000 * 60 * 60 * 24)), 0);
  const hours = Math.max(Math.floor((timeLeft / (1000 * 60 * 60)) % 24), 0);
  const minutes = Math.max(Math.floor((timeLeft / (1000 * 60)) % 60), 0);
  const seconds = Math.max(Math.floor((timeLeft / 1000) % 60), 0);

  return (
    <div className="text-center py-12">
      <h2 className="text-2xl mb-6">Countdown to Noir MUN</h2>
      <div className="flex justify-center gap-4 text-center">
        {[
          ["Days", days],
          ["Hours", hours],
          ["Minutes", minutes],
          ["Seconds", seconds],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col items-center">
            <span className="text-4xl font-bold">{value}</span>
            <span className="text-sm text-white/70">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- Poster Grid --- */
function PosterWall({ onOpen }) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-10">
      {POSTERS.map((p, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.03 }}
          className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer"
          onClick={() => onOpen(i)}
        >
          <img src={p} alt={`Poster ${i}`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition">
            <span className="text-white text-sm">View Brief</span>
          </div>
        </motion.div>
      ))}
    </section>
  );
}

/* --- Modal for Committee Briefs --- */
function BriefModal({ idx, onClose }) {
  if (idx === null) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#111] p-6 rounded-xl max-w-lg w-full text-white relative"
        >
          <button onClick={onClose} className="absolute top-3 right-3"><X /></button>
          <h3 className="text-xl font-bold mb-4">Committee Brief</h3>
          <p className="text-sm text-white/80">{BRIEFS[idx]}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* --- CTA --- */
function ImpactCTA() {
  return (
    <section className="text-center py-16">
      <h2 className="text-3xl font-bold mb-4">Make History with Us</h2>
      <p className="text-white/70 mb-6">
        Noir MUN is not just a conference — it’s a movement.
      </p>
      <a
        href={REGISTER_URL}
        target="_blank"
        rel="noreferrer"
        className="px-8 py-4 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30"
      >
        Secure Your Spot
      </a>
    </section>
  );
}

/* --- Talk to us (Wilt Mini) --- */
function TalkToUs() {
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState([{ from: "bot", text: "Hey, I’m WILT Mini. Ask me anything about Noir MUN!" }]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setThread([...thread, { from: "user", text: input }, { from: "bot", text: "Thanks for asking! (Demo response)" }]);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-80 bg-[#111] text-white rounded-xl shadow-xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-3 bg-[--theme]">
              <div className="font-semibold">Talk to us (WILT Mini)</div>
              <button onClick={() => setOpen(false)}><X size={18} /></button>
            </div>

            <div className="max-h-96 overflow-auto p-3 space-y-3">
              {thread.map((m, i) => (
                <div key={i} className={`flex ${m.from === "bot" ? "justify-start" : "justify-end"}`}>
                  <div className={`${m.from === "bot" ? "bg-white/20" : "bg-white/30"} text-sm px-3 py-2 rounded-2xl`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything…"
                className="flex-1 bg-white/15 px-3 py-2 rounded-xl outline-none"
              />
              <button onClick={send} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl text-white shadow-xl bg-[--theme] border border-white/20"
        >
          <MessageCircle size={18} /> Talk to us
        </motion.button>
      )}
    </div>
  );
}

/* --- Inline Footer --- */
function InlineFooter() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-3 text-white/80">
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
          <a href={REGISTER_URL} target="_blank" rel="noreferrer" className="block text-sm hover:underline">Register</a>
        </div>
        <div>
          <div className="font-semibold">Legal</div>
          <Link to="/legal" className="block text-sm hover:underline">Terms & Privacy</Link>
          <div className="text-xs text-white/60">© {new Date().getFullYear()} Noir MUN</div>
        </div>
      </div>
    </footer>
  );
}

/* --- Main Page --- */
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
            <span className="font-semibold">Noir MUN</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link to="/assistance" className="rounded-xl border border-white/20 px-3 py-2">Assistance</Link>
            <Link to="/legal" className="rounded-xl border border-white/20 px-3 py-2">Legal</Link>
            <a href={REGISTER_URL} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2">
              Register <ChevronRight size={16} />
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

      <InlineFooter />
      <TalkToUs />

      <BriefModal idx={briefIdx} onClose={() => setBriefIdx(null)} />

      <style>{`:root { --theme: ${THEME_HEX}; }`}</style>
    </div>
  );
}
