import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Calendar, Clock, MessageCircle, X, ChevronRight, Shield, ExternalLink, Sparkles, ArrowRight, Send, Stars, Bot } from "lucide-react";

/**
 * Noir Model United Nations — Ultra Complex One-Pager (2025, v2.3.1)
 * Patch: fix malformed template in ChatWidget bubble className; remove Core Team; update tagline.
 */

// ---------- Config ----------
const EVENT_NAME = "Noir Model United Nations";
const DATES_TEXT = "11–12 October, 2025";
const TARGET_DATE_IST = "2025-10-11T09:00:00+05:30"; // IST
const THEME_HEX = "#000026";
const REGISTER_URL = "https://linktr.ee/noirmun";
const LOGO_URL = "https://i.postimg.cc/MZhZ9Nsm/Black-and-White-Graffiti-Clothing-Logo-Instagram-Post-45.png";
const WHATSAPP_ESCALATE = "https://wa.me/918595511056";

// Optional UN b-roll background video sources
const UN_VIDEO_SOURCES = [
  // { src: "https://your-cdn.example/un-broll-1.mp4", type: "video/mp4" },
];

// Provided committee logos
const LOGO_UN = "https://i.postimg.cc/htVHK31g/Black-and-White-Graffiti-Clothing-Logo-Instagram-Post-45-5.png"; // UNGA & UNCSW
const LOGO_AIPPM = "https://i.postimg.cc/4xZTHgdn/AIPPM-removebg-preview-pmv7kqpcqpe18txaiaahkwoafmvqa378hd5tcs7x8g.png";
const LOGO_IPL = "https://i.postimg.cc/JnYFTwM3/Black-and-White-Graffiti-Clothing-Logo-Instagram-Post-45-7.png";
const LOGO_IP = "https://i.postimg.cc/PJ8S2P6h/Black-and-White-Graffiti-Clothing-Logo-Instagram-Post-45-8.png"; // International Press

// ---------- Content ----------
const COMMITTEES = [
  {
    name: "United Nations General Assembly (UNGA)",
    agenda:
      "Reassessing the Doctrine of Sovereign Immunity: Ensuring Criminal Accountability of Heads of State for Grave International Crimes",
    logo: LOGO_UN,
    brief: {
      overview:
        "Plenary GA with full diplomatic protocol. Debate pivots on reconciling functional immunity with accountability for atrocity crimes.",
      objectives: [
        "Map boundaries between state immunities and duty to prosecute grave crimes.",
        "Draft a GA framework for national prosecutions & mutual legal assistance.",
        "Propose cooperation contours with ICC without revising the Rome Statute.",
      ],
      format:
        "Standard GA procedure; majority decisions for recommendations; special session on model clauses.",
      resources: [
        "ICJ jurisprudence (Arrest Warrant)",
        "UNGA precedents on accountability",
      ],
    },
  },
  {
    name: "United Nations Commission on the Status of Women (UNCSW)",
    agenda:
      "Rehabilitation and Reintegration of Women Recruited and Abused by Extremist and Armed Non-State Actors",
    logo: LOGO_UN,
    brief: {
      overview: "Policy-heavy committee focused on DDR with survivor-centric lens.",
      objectives: [
        "Design survivor-safe reintegration pathways (ID, health, livelihoods).",
        "Guardrails against stigmatization; confidentiality and witness protection.",
        "Safeguards for children born of conflict (documentation, services).",
      ],
      format:
        "Agreed conclusions + annexed programmatic toolkit for country offices.",
      resources: ["UNFPA/UN Women guidance", "DDR standards", "Case studies"],
    },
  },
  {
    name: "All India Political Parties Meet (AIPPM)",
    agenda:
      "Reviewing the Waqf Act: Land, Faith, and the Limits of Minority Rights in a Secular State",
    logo: LOGO_AIPPM,
    brief: {
      overview:
        "High-octane domestic forum; intersects constitutional law, federalism, minority rights.",
      objectives: [
        "Evaluate competing property/faith claims.",
        "Calibrate oversight and transparency standards without chilling free exercise.",
        "Propose time-bound review mechanisms and audit frameworks.",
      ],
      format:
        "Parliamentary style with moderated cross-talk; working paper → draft bill clauses.",
      resources: ["Select committee reports", "Law Commission references"],
    },
  },
  {
    name: "YouTube All Stars",
    agenda: "Classified",
    logo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/512px-YouTube_full-color_icon_%282017%29.svg.png",
    brief: {
      overview:
        "Crisis-lite entertainment diplomacy. Expect brand safety, creator economy shocks, and live audience sentiment injections.",
      objectives: [
        "Crisis cards with metrics shocks",
        "Creator policy pact",
        "Rapid response tooling",
      ],
      format: "Timed PR cycles + negotiation sprints.",
      resources: ["Platform policy excerpts", "Ad safety frameworks"],
    },
  },
  {
    name: "Indian Premier League (IPL)",
    agenda: "Mega Auction — Format: Double Delegation",
    logo: LOGO_IPL,
    brief: {
      overview:
        "Economics-meets-sport. Negotiate caps, trades, and long-term franchise strategy under uncertainty.",
      objectives: [
        "Auction strategy & analytics",
        "Fan equity guardrails",
        "Broadcast-rights interplay",
      ],
      format: "Double delegation; salary-cap maths; draft-board dynamics.",
      resources: ["Historic auction data (mock)", "CBA-style clauses"],
    },
  },
  {
    name: "International Press (IP)",
    agenda: "Coverage through Photography, Journalism, and Caricature",
    logo: LOGO_IP,
    brief: {
      overview:
        "Live newsroom with photo desks and satirical art corner; ethics & verification at speed.",
      objectives: [
        "Balanced reportage",
        "Photo briefs & caption discipline",
        "Fact-check pipeline",
      ],
      format: "Rolling editions; press conferences; embargo windows.",
      resources: ["Newsroom style guides", "Photojournalism ethics"],
    },
  },
];

// ---------- Utilities ----------
const useCountdown = (targetISO) => {
  const [diff, setDiff] = useState(
    () => new Date(targetISO).getTime() - Date.now()
  );
  useEffect(() => {
    const t = setInterval(
      () => setDiff(new Date(targetISO).getTime() - Date.now()),
      1000
    );
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

// ---------- Preloader ----------
const Preloader = ({ done }) => (
  <AnimatePresence>
    {!done && (
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[--theme] text-white"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative w-80 h-44">
          <div className="absolute bottom-8 left-0 right-0 h-1 overflow-hidden">
            <div className="w-full h-full bg-white/20 rounded-full animate-[slide_1s_linear_infinite]"></div>
          </div>
          <motion.svg
            width="200"
            height="180"
            viewBox="0 0 200 180"
            className="absolute left-1/2 -translate-x-1/2 bottom-10 drop-shadow-2xl"
            animate={{ x: [-50, 50, -50], rotate: [-2, 2, -2] }}
            transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
          >
            <circle cx="90" cy="60" r="22" fill="#fff" />
            <circle cx="83" cy="58" r="3" fill="#000" />
            <circle cx="97" cy="58" r="3" fill="#000" />
            <rect x="78" y="80" width="24" height="28" rx="8" fill="#fff" />
            <motion.line
              x1="78"
              y1="90"
              x2="58"
              y2="100"
              stroke="#fff"
              strokeWidth="6"
              strokeLinecap="round"
              animate={{ rotate: [-20, 20, -20] }}
              style={{ originX: 78, originY: 90 }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
            <motion.line
              x1="102"
              y1="90"
              x2="122"
              y2="100"
              stroke="#fff"
              strokeWidth="6"
              strokeLinecap="round"
              animate={{ rotate: [20, -20, 20] }}
              style={{ originX: 102, originY: 90 }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
            <motion.line
              x1="86"
              y1="108"
              x2="70"
              y2="134"
              stroke="#fff"
              strokeWidth="6"
              strokeLinecap="round"
              animate={{ rotate: [25, -25, 25] }}
              style={{ originX: 86, originY: 108 }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            <motion.line
              x1="94"
              y1="108"
              x2="110"
              y2="134"
              stroke="#fff"
              strokeWidth="6"
              strokeLinecap="round"
              animate={{ rotate: [-25, 25, -25] }}
              style={{ originX: 94, originY: 108 }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </motion.svg>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs tracking-widest uppercase text-white/80">
            Loading Noir MUN…
          </div>
        </div>
        <style>{`@keyframes slide { from { transform: translateX(-100%);} to { transform: translateX(100%);} }`}</style>
      </motion.div>
    )}
  </AnimatePresence>
);

// ---------- Countdown ----------
const FlipTile = ({ label, value }) => (
  <div className="flex flex-col items-center">
    <div className="relative w-20 h-24 perspective">
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
          <div className="text-white/80 text-xs uppercase tracking-[0.3em]">
            Countdown to Opening
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <FlipTile label="Days" value={d} />
            <FlipTile label="Hours" value={h} />
            <FlipTile label="Mins" value={m} />
            <FlipTile label="Secs" value={s} />
          </div>
        </>
      ) : (
        <div className="text-center text-white">
          <div className="text-sm uppercase tracking-[0.25em] text-white/70">
            The big day has passed
          </div>
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
          const dx = p[i].x - p[j].x,
            dy = p[i].y - p[j].y;
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
const Hero = ({ onOpenAssist }) => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 6]);
  const videoAvailable = UN_VIDEO_SOURCES.length > 0;
  const themeStyle = { "--theme": THEME_HEX };
  return (
    <section className="relative min-h-[96vh] pt-24 overflow-hidden">
      {videoAvailable ? (
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          autoPlay
          muted
          loop
          playsInline
        >
          {UN_VIDEO_SOURCES.map((s, i) => (
            <source key={i} src={s.src} type={s.type} />
          ))}
        </video>
      ) : (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-gradient-to-br from-black via-[--theme] to-black"
            style={themeStyle}
          />
          <Particles />
        </div>
      )}
      <motion.div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"
        style={{ y: y1 }}
      />
      <motion.div
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl"
        style={{ rotate }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <img src={LOGO_URL} alt="Noir" className="h-24 w-24 object-contain drop-shadow-lg" />
          <h1 className="mt-6 text-4xl md:text-6xl font-black tracking-tight text-white">
            {EVENT_NAME}
          </h1>
          <div className="mt-3 flex items-center gap-3 text-white/80">
            <Calendar size={18} /> <span>{DATES_TEXT}</span>
          </div>
          <div className="mt-8">
            <Countdown />
          </div>
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
              onClick={onOpenAssist}
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
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
          Committee Line-Up
        </h2>
        <p className="mt-2 text-white/70">
          Dynamic, diverse, and dangerously good debates.
        </p>
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
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          className="max-w-3xl w-full max-h-[85vh] overflow-auto rounded-2xl border border-white/15 bg-[#0a0a1a] text-white p-6"
        >
          <div className="flex items-center gap-3">
            <img src={c.logo} className="h-12 w-12" alt="committee" />
            <h3 className="text-xl font-bold">{c.name}</h3>
            <button onClick={onClose} className="ml-auto p-1 hover:opacity-80">
              <X size={18} />
            </button>
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
                {c.brief.objectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-white font-semibold">Format</div>
              <p className="mt-2 text-white/80">{c.brief.format}</p>
              <div className="mt-4 text-white font-semibold">Suggested Resources</div>
              <ul className="mt-2 list-disc list-inside text-white/80 space-y-1">
                {c.brief.resources.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ---------- MUN Assistance (new-tab generator) ----------
const ASSIST_TEXT = `UNA-USA ROPs (Very Short):
• Roll Call → Setting the agenda → General Speakers’ List (GSL) → Moderated/Unmoderated Caucuses → Drafts → Amendments → Voting.
• Points: Personal Privilege, Parliamentary Inquiry, Order.
• Motions: Set Agenda, Moderate/Unmoderate, Adjourn/ Suspend, Introduce Draft, Close Debate.
Tips: Be concise on GSL, drive specifics in moderated, use unmods to build blocs and text.

How Noir Committees Work:
• Study guides before conference, guided by EB.
• Strict decorum; time discipline; plagiarism zero-tolerance.
• Awards weigh consistency, bloc-building, drafting, and crisis handling (where applicable).`;

const openMUNAssistance = () => {
  const w = window.open("", "_blank");
  if (!w) return;
  const html = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Noir MUN — Assistance & WILT</title>
<style>
  :root{ --bg:#000026; --glass:rgba(255,255,255,.1); --line:rgba(255,255,255,.18); --txt:#fff }
  *{ box-sizing:border-box; }
  body{ margin:0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; color:var(--txt); background:radial-gradient(1200px 800px at 20% -10%, rgba(255,255,255,.08), transparent), linear-gradient(180deg, #040418, var(--bg)); overflow:hidden; }
  .halo{ position:fixed; inset:-20%; background:conic-gradient(from 0deg, rgba(255,255,255,.05), transparent 30%, rgba(255,255,255,.05) 60%, transparent 100%); filter:blur(60px); animation:spin 24s linear infinite; }
  @keyframes spin{ to{ transform:rotate(360deg) } }
  canvas#stars{ position:fixed; inset:0; z-index:0 }
  .wrap{ position:relative; z-index:1; height:100vh; display:grid; grid-template-rows:auto 1fr; }
  header{ display:flex; align-items:center; justify-content:space-between; padding:16px 24px; border-bottom:1px solid var(--line); backdrop-filter:blur(10px); background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02)); }
  header .brand{ display:flex; align-items:center; gap:10px }
  header img{ height:36px; width:36px; object-fit:contain }
  header .cta a{ color:#fff; text-decoration:none; border:1px solid var(--line); padding:8px 12px; border-radius:14px; }
  main{ display:grid; grid-template-columns: 360px 1fr; gap:16px; height:calc(100vh - 70px); }
  .panel{ padding:18px; overflow:auto; border-right:1px solid var(--line); background:rgba(255,255,255,.03) }
  .panel h2{ margin:6px 0 10px; font-size:18px }
  .kb{ white-space:pre-wrap; line-height:1.6; color:rgba(255,255,255,.85); font-size:14px }
  .stage{ position:relative; }
  .tabs{ position:absolute; top:16px; left:24px; right:24px; display:flex; gap:8px }
  .tabs button{ border:1px solid var(--line); background:rgba(255,255,255,.1); color:#fff; padding:8px 10px; border-radius:12px; cursor:pointer }
  .neon-card{ position:absolute; inset:56px 24px 24px; border:1px solid var(--line); border-radius:24px; background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02)); box-shadow:0 20px 60px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.04); overflow:hidden; display:grid; grid-template-columns: 1fr 1fr; gap:0 }
  .panelL, .panelR{ padding:16px; overflow:auto }
  .heading{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px }
  .heading h3{ margin:0; font-size:18px }
  .chat .thread{ height:52vh; overflow:auto; padding-right:6px }
  .bubble{ max-width:77%; margin:8px 0; padding:10px 12px; border-radius:16px; font-size:14px; line-height:1.5; backdrop-filter:blur(8px) }
  .bot{ background:rgba(255,255,255,.15) }
  .user{ background:rgba(255,255,255,.28); align-self:flex-end }
  .composer{ display:flex; gap:8px; margin-top:8px }
  .composer input{ flex:1; padding:10px 12px; border-radius:12px; border:1px solid var(--line); background:rgba(255,255,255,.08); color:#fff }
  .composer button{ padding:10px 14px; border-radius:12px; border:1px solid var(--line); background:rgba(255,255,255,.15); color:#fff }
  .chips{ display:flex; flex-wrap:wrap; gap:6px; margin-top:4px }
  .chips button{ font-size:12px; border:1px solid var(--line); background:rgba(255,255,255,.1); padding:4px 8px; border-radius:999px; color:#fff; cursor:pointer }
  .sim-grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px }
  .card{ border:1px solid var(--line); background:rgba(255,255,255,.06); padding:10px; border-radius:14px }
  .bars{ display:grid; gap:10px; margin-top:4px }
  .bar{ height:8px; background:rgba(255,255,255,.12); border-radius:999px; overflow:hidden }
  .fill{ height:100%; width:0; background:linear-gradient(90deg, rgba(255,255,255,.6), rgba(255,255,255,.2)); animation:grow 1.4s forwards }
  @keyframes grow{ to{ width:var(--w) } }
</style>
</head>
<body>
<div class="halo"></div>
<canvas id="stars"></canvas>
<div class="wrap">
  <header>
    <div class="brand"><img src="${LOGO_URL}"/><strong>Noir MUN Assistance</strong></div>
    <div class="cta"><a href="${REGISTER_URL}" target="_blank">Register</a></div>
  </header>
  <main>
    <aside class="panel">
      <h2>UNA-USA ROPs — Lightning Guide</h2>
      <div class="kb">${ASSIST_TEXT.split('`').join('')}</div>
      <h2 style="margin-top:16px">Quick Links</h2>
      <div class="kb">• Linktree: ${REGISTER_URL}\n• WhatsApp Exec: ${WHATSAPP_ESCALATE}\n• Email: allotments.noirmun@gmail.com</div>
    </aside>
    <section class="stage">
      <div class="tabs">
        <button data-tab="chat">Chat (WILT)</button>
        <button data-tab="rops">ROP Simulator</button>
        <button data-tab="quiz">Committee Quiz</button>
        <button data-tab="rubric">Awards Rubric</button>
      </div>
      <div class="neon-card" id="card">
        <div class="panelL" id="left"></div>
        <div class="panelR" id="right"></div>
      </div>
    </section>
  </main>
</div>
<script>
// starfield
(function(){
  const c=document.getElementById('stars');
  const ctx=c.getContext('2d');
  let w=c.width=innerWidth,h=c.height=innerHeight;
  const s=[...Array(160)].map(()=>({x:Math.random()*w,y:Math.random()*h,v:(Math.random()*0.6)+0.2}));
  function d(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle='rgba(255,255,255,.5)';
    s.forEach(p=>{p.y+=p.v; if(p.y>h) p.y=0; ctx.fillRect(p.x,p.y,1,1);});
    requestAnimationFrame(d);
  }
  addEventListener('resize',()=>{w=c.width=innerWidth;h=c.height=innerHeight;});
  d();
})();

// ===== WILT brain (client-side KB + public APIs) =====
const KB = {
  event: '${EVENT_NAME}', dates: '${DATES_TEXT}', fee:'₹2300', venue:'TBA',
  founders:'Founder: Sameer Jhamb, Co-Founder: Maahir Gulati, President: Gautam Khera',
  register:'${REGISTER_URL}', whatsapp:'${WHATSAPP_ESCALATE}', email:'allotments.noirmun@gmail.com',
  committees: ${JSON.stringify(COMMITTEES.map(c=>({name:c.name, agenda:c.agenda})))},
  rops: ${JSON.stringify(ASSIST_TEXT)}
};

function push(thread, from, text){
  const b=document.createElement('div');
  b.className='bubble '+(from==='bot'?'bot':'user');
  b.textContent=text; thread.appendChild(b);
  thread.scrollTop=thread.scrollHeight;
}

function intent(q){
  q=q.toLowerCase();
  if(/date|when/.test(q)) return 'dates';
  if(/fee|price|cost/.test(q)) return 'fee';
  if(/venue|where|location/.test(q)) return 'venue';
  if(/founder|organiser|organizer|oc|eb/.test(q)) return 'founders';
  if(/committee|agenda|topics?/.test(q)) return 'committees';
  if(/register|sign/.test(q)) return 'register';
  if(/una|rops|rules/.test(q)) return 'rops';
  if(/^web:/.test(q)||/^wiki:/.test(q)) return 'web';
  if(/^read:/.test(q)) return 'read';
  if(/exec|human|someone|whatsapp/.test(q)) return 'escalate';
  return 'fallback';
}

async function wiki(q){
  q=q.replace(/^wiki:|^web:/i,'').trim();
  const res = await fetch('https://en.wikipedia.org/w/rest.php/v1/search/title?q='+encodeURIComponent(q)+'&limit=3&lang=en', { headers:{ 'Accept':'application/json'} });
  const j = await res.json();
  if(!j || !j.pages || !j.pages.length) return 'Wikipedia: no results.';
  const lines = j.pages.map(function(p,i){ return (i+1)+'. '+p.title+' — https://en.wikipedia.org/wiki/'+encodeURIComponent(p.title.replace(/\\s/g,'_')); });
  try{
    const t = j.pages[0].title; const sr = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(t)); const s = await sr.json();
    if(s && s.extract) lines.unshift('Summary: '+s.extract);
  }catch(e){}
  return 'Wikipedia:\\n'+lines.join('\\n');
}

async function jina(url){
  url = url.replace(/^read:/i,'').trim();
  const safe = url.replace(/^https?:\\/\\//,'');
  const r = await fetch('https://r.jina.ai/http://'+safe);
  const txt = await r.text();
  return 'Reader:\\n'+txt.slice(0,800)+(txt.length>800?'…':'');
}

function route(q){ const i=intent(q); return i; }
async function answer(q){
  const r = route(q);
  switch(r){
    case 'dates': return 'Dates: '+KB.dates;
    case 'fee': return 'Delegate fee: '+KB.fee;
    case 'venue': return 'Venue: '+KB.venue+' — want WhatsApp updates when we announce?';
    case 'founders': return 'Leadership — '+KB.founders;
    case 'committees': return 'Committees:\\n• '+KB.committees.map(function(x){return x.name+': '+x.agenda;}).join('\\n• ');
    case 'register': return 'Open Linktree → '+KB.register;
    case 'rops': return KB.rops;
    case 'web': return await wiki(q);
    case 'read': return await jina(q);
    case 'escalate': window.open(KB.whatsapp,'_blank'); return 'Opening WhatsApp…';
    default: return 'Ask me about Noir, or use commands: “web: <topic>”, “read: <url>”.';
  }
}

function mountChat(){
  const left=document.getElementById('left'); const right=document.getElementById('right');
  left.innerHTML = '<div class="heading"><h3>WILT — Noir Assistant</h3><small>Local KB + Wikipedia + Jina Reader</small></div>'+
  '<div class="chat">'+
    '<div id="thread" class="thread"></div>'+
    '<div class="chips" id="chips"></div>'+
    '<div class="composer"><input id="in" placeholder="Ask WILT anything… (web: , read: )"/><button id="send">Send</button></div>'+
  '</div>';
  right.innerHTML = '<div class="card"><strong>Tips</strong><div class="kb">Try: <br>• dates / fee / founders<br>• web: United Nations<br>• read: https://en.wikipedia.org/wiki/United_Nations</div></div>';
  const thread=document.getElementById('thread');
  const inp=document.getElementById('in');
  const btn=document.getElementById('send');
  const chips=document.getElementById('chips');
  ['Dates','Fee','Venue','Founders','Committees','Register','UNA-USA ROPs','Talk to executive'].forEach(function(t){ const b=document.createElement('button'); b.textContent=t; b.onclick=function(){inp.value=t; send();}; chips.appendChild(b); });
  function send(){ const v=inp.value.trim(); if(!v) return; push(thread,'user',v); inp.value=''; answer(v).then(function(t){ push(thread,'bot',t); }); }
  btn.addEventListener('click', send);
  inp.addEventListener('keydown', function(e){ if(e.key==='Enter') send(); });
  push(thread,'bot','Hi — I’m WILT. I know Noir basics and I can search Wikipedia or read any link via Jina Reader.');

  // self-tests (existing + added)
  (async function(){
    const tests=[
      {q:'Dates?', expect:'Dates:'},
      {q:'Fee?', expect:'₹2300'},
      {q:'Founders?', expect:'Sameer'},
      {q:'web: United Nations', expect:'Wikipedia:'},
      {q:'read: https://en.wikipedia.org/wiki/United_Nations', expect:'Reader:'},
      {q:'Venue?', expect:'Venue:'},
      // added:
      {q:'Committees', expect:'Committees:'},
      {q:'register', expect:'Open Linktree'}
    ];
    for(const t of tests){ const res=await answer(t.q); console.log('[WILT test]', t.q, '=>', res.includes(t.expect)?'PASS':'FAIL', res); }
  })();
}

function mountROPSim(){
  const left=document.getElementById('left'); const right=document.getElementById('right');
  left.innerHTML = '<div class="heading"><h3>ROP Simulator</h3><small>Practice motions & points</small></div>'+
  '<div class="sim-grid">'+
    '<div class="card"><strong>Motions</strong><div id="motions"></div></div>'+
    '<div class="card"><strong>Points</strong><div id="points"></div></div>'+
  '</div>';
  right.innerHTML = '<div class="card"><strong>Floor Script</strong><div id="script" class="kb">Select a motion/point to see phrasing and outcomes.</div></div>';
  const motions=[
    {k:'Set Agenda', p:'Motion to set the agenda to …', vote:'Simple majority'},
    {k:'Moderated Caucus', p:'Motion for a moderated caucus of X minutes, Y speaking time on …', vote:'Simple majority'},
    {k:'Unmoderated Caucus', p:'Motion for an unmoderated caucus of X minutes.', vote:'Simple majority'},
    {k:'Introduce Draft', p:'Motion to introduce draft resolution/working paper …', vote:'Simple majority'},
    {k:'Close Debate', p:'Motion to close debate and move to voting.', vote:'2/3 majority'}
  ];
  const points=[
    {k:'Point of Personal Privilege', p:'For audibility/comfort; may interrupt.'},
    {k:'Point of Parliamentary Inquiry', p:'Ask the chair about procedure; no debate.'},
    {k:'Point of Order', p:'Procedural violation; may interrupt.'}
  ];
  const mDiv=document.getElementById('motions'); const pDiv=document.getElementById('points'); const sDiv=document.getElementById('script');
  motions.forEach(function(m){ const b=document.createElement('button'); b.textContent=m.k; b.className='chips button'; b.style.cssText='margin:6px; border:1px solid var(--line); background:rgba(255,255,255,.1); color:#fff; padding:6px 10px; border-radius:999px;'; b.onclick=function(){ sDiv.textContent='Raise: “'+m.p+'”\\nVoting: '+m.vote; }; mDiv.appendChild(b); });
  points.forEach(function(m){ const b=document.createElement('button'); b.textContent=m.k; b.className='chips button'; b.style.cssText='margin:6px; border:1px solid var(--line); background:rgba(255,255,255,.1); color:#fff; padding:6px 10px; border-radius:999px;'; b.onclick=function(){ sDiv.textContent='State: “'+m.p+'”'; }; pDiv.appendChild(b); });
}

function mountQuiz(){
  const left=document.getElementById('left'); const right=document.getElementById('right');
  left.innerHTML = '<div class="heading"><h3>Committee Recommender</h3><small>Find your vibe</small></div>'+
  '<div class="card">'+
  '<label>1) Preference: Global policy vs Domestic politics</label>'+
  '<select id="q1"><option value="g">Global</option><option value="d">Domestic</option></select>'+
  '<label>2) Crisis vs Formality</label>'+
  '<select id="q2"><option value="formal">More formal</option><option value="crisis">More crisis/fast</option></select>'+
  '<label>3) Writing vs Speaking</label>'+
  '<select id="q3"><option value="write">Writing heavy</option><option value="speak">Speaking heavy</option></select>'+
  '<button id="solve" style="margin-top:8px">Recommend</button>'+
  '</div>';
  right.innerHTML = '<div class="card"><strong>Result</strong><div id="out" class="kb">Answer the three questions and hit Recommend.</div></div>';
  document.getElementById('solve').onclick=function(){
    const q1=document.getElementById('q1').value; const q2=document.getElementById('q2').value; const q3=document.getElementById('q3').value;
    const scores = { UNGA:0, UNCSW:0, AIPPM:0, IPL:0, IP:0, YT:0 };
    if(q1==='g'){ scores.UNGA+=2; scores.UNCSW+=2; } else { scores.AIPPM+=2; scores.IPL+=1; }
    if(q2==='formal'){ scores.UNGA+=1; scores.UNCSW+=1; scores.AIPPM+=1; } else { scores.YT+=2; scores.IPL+=2; }
    if(q3==='write'){ scores.UNCSW+=2; scores.IP+=2; } else { scores.UNGA+=1; scores.AIPPM+=1; scores.IPL+=1; }
    const arr=Object.entries(scores).sort(function(a,b){return b[1]-a[1];});
    const top = arr.slice(0,3).map(function(kv){return kv[0]+' ('+kv[1]+')';}).join('\\n');
    document.getElementById('out').textContent='Top matches:\\n'+top;
  };
}

function mountRubric(){
  const left=document.getElementById('left'); const right=document.getElementById('right');
  left.innerHTML = '<div class="heading"><h3>Awards Rubric</h3><small>Animated weights</small></div>'+
  '<div class="card"><div>Criteria (illustrative)</div>'+
    '<div class="bars">'+
      '<div class="bar" style="--w:70%"><div class="fill"></div></div><div>Substance (35%)</div>'+
      '<div class="bar" style="--w:60%"><div class="fill"></div></div><div>Diplomacy/Bloc (30%)</div>'+
      '<div class="bar" style="--w:45%"><div class="fill"></div></div><div>Docs/Drafting (22.5%)</div>'+
      '<div class="bar" style="--w:35%"><div class="fill"></div></div><div>Procedure/Decorum (12.5%)</div>'+
    '</div>'+
  '</div>';
  right.innerHTML = '<div class="card"><strong>How to use</strong><div class="kb">Aim for balance. Keep content tight, build coalitions, and convert ideas into paper.</div></div>';
}

function bindTabs(){
  const map={ chat:mountChat, rops:mountROPSim, quiz:mountQuiz, rubric:mountRubric };
  const first='chat';
  Object.entries(map).forEach(function(entry){ const k=entry[0], fn=entry[1]; const b=[...document.querySelectorAll('[data-tab="'+k+'"]')][0]; if(b){ b.onclick=fn; } });
  map[first]();
}

bindTabs();
</script>
</body>
</html>`;
  w.document.write(html);
  w.document.close();
};

// ---------- Chatbot (Noir Assistant, on-page) ----------
const CORE_KB = {
  meta: {
    event: EVENT_NAME,
    dates: DATES_TEXT,
    fee: "₹2300",
    venue: "TBA",
    founders:
      "Founder: Sameer Jhamb, Co-Founder: Maahir Gulati, President: Gautam Khera",
    contact: { email: "allotments.noirmun@gmail.com", whatsapp: WHATSAPP_ESCALATE },
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
  if (/founder|who (made|runs)|organiser|organizer|oc|eb/.test(q))
    return { type: "founders" };
  if (/committee|agenda|focus|topics?/.test(q)) return { type: "committees" };
  if (/privacy|terms|policy/.test(q)) return { type: "privacy" };
  if (/human|executive|real person|someone|talk/.test(q))
    return { type: "escalate" };
  return { type: "fallback" };
};

const replyFor = (intent) => {
  switch (intent.type) {
    case "dates":
      return `Dates: ${CORE_KB.meta.dates}.`;
    case "fee":
      return `Delegate fee: ${CORE_KB.meta.fee}.`;
    case "venue":
      return `Venue: ${CORE_KB.meta.venue}. Want WhatsApp updates when we announce?`;
    case "register":
      return `Tap ‘Register’ — it opens ${CORE_KB.meta.register}`;
    case "founders":
      return `Leadership — ${CORE_KB.meta.founders}.`;
    case "committees":
      return `Committees & agendas:\n• ${CORE_KB.committees
        .map((x) => `${x.name}: ${x.agenda}`)
        .join("\n• ")}`;
    case "privacy":
      return `Short privacy/TOS apply. Data used for operations & updates only.`;
    case "escalate":
      return `I can connect you to an executive now. Should I open WhatsApp?`;
    default:
      return `I’m your Noir assistant 🤖 Ask about dates, fees, venue, founders, committees — or say ‘executive’.`;
  }
};

const ChatWidget = ({ onEscalate }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [name, setName] = useState(() => localStorage.getItem("noir_name"));
  const [capture, setCapture] = useState(
    !localStorage.getItem("noir_name") ? "askName" : "idle"
  );
  const [, setEmail] = useState(() => localStorage.getItem("noir_email"));
  const [thread, setThread] = useState([
    {
      from: "bot",
      text:
        "Hey! I’m Noir — your event assistant. Ask about dates, fee, venue, committees, founders… or say ‘executive’.",
    },
  ]);

  useEffect(() => {
    if (name && capture === "askName") setCapture("askEmail");
  }, [name, capture]);
  const add = (m, delay = 0) => setTimeout(() => setThread((t) => [...t, m]), delay);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setThread((t) => [...t, { from: "user", text: userMsg }]);

    if (capture === "askName") {
      const n = userMsg.replace(/[^a-zA-Z\s]/g, "").trim();
      if (n.length > 1) {
        setName(n);
        localStorage.setItem("noir_name", n);
        add(
          {
            from: "bot",
            text: `Nice to meet you, ${n}! What’s your email? (for allotment updates only)`,
          },
          250
        );
        setCapture("askEmail");
        setInput("");
        return;
      }
    }
    if (capture === "askEmail") {
      const ok = /\S+@\S+\.\S+/.test(userMsg);
      if (ok) {
        setEmail(userMsg);
        localStorage.setItem("noir_email", userMsg);
        add(
          { from: "bot", text: `Thanks! You’re on the early-info list. How can I help today?` },
          250
        );
        setCapture("done");
        setInput("");
        return;
      } else {
        add({ from: "bot", text: `That email didn’t look right. Try again?` }, 250);
        setInput("");
        return;
      }
    }

    const intent = detectIntent(userMsg);
    const reply = replyFor(intent);
    add({ from: "bot", text: reply }, 250);

    if (/open whatsapp|yes|sure|ok/i.test(userMsg) || intent.type === "escalate") {
      add({ from: "bot", text: "Opening WhatsApp…" }, 500);
      onEscalate();
    }

    setInput("");
  };

  const quick = (q) => {
    setInput(q);
    setTimeout(send, 50);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-96 max-w-[92vw] rounded-2xl shadow-2xl overflow-hidden border border-white/15 backdrop-blur bg-white/10 text-white"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-white/10">
              <div className="flex items-center gap-2 font-semibold">
                <Bot size={18} /> Noir Assistant
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:opacity-80">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-96 overflow-auto p-3 space-y-3">
              {thread.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.from === "bot" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`${m.from === "bot" ? "bg-white/20" : "bg-white/30"} text-sm px-3 py-2 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="px-3 pb-2 flex flex-wrap gap-2">
              <button
                onClick={() => quick("Dates?")}
                className="text-xs rounded-full px-3 py-1 bg-white/15"
              >
                Dates
              </button>
              <button
                onClick={() => quick("Fee?")}
                className="text-xs rounded-full px-3 py-1 bg-white/15"
              >
                Fee
              </button>
              <button
                onClick={() => quick("Venue?")}
                className="text-xs rounded-full px-3 py-1 bg-white/15"
              >
                Venue
              </button>
              <button
                onClick={() => quick("Founders?")}
                className="text-xs rounded-full px-3 py-1 bg-white/15"
              >
                Founders
              </button>
              <button
                onClick={() => quick("Committees & agendas")}
                className="text-xs rounded-full px-3 py-1 bg-white/15"
              >
                Committees
              </button>
              <button
                onClick={() => quick("Talk to executive")}
                className="text-xs rounded-full px-3 py-1 bg-white/15"
              >
                Executive
              </button>
            </div>
            <div className="p-3 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder={name ? `Message ${name}…` : "Your name to begin…"}
                className="flex-1 bg-white/15 px-3 py-2 rounded-xl outline-none placeholder-white/60"
              />
              <button onClick={send} className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30">
                <Send size={16} />
              </button>
            </div>
            <div className="px-3 pb-3 text-[11px] text-white/70 flex items-center gap-2">
              <Stars size={12} /> Smart replies powered by an on-page knowledge base. Complex queries
              escalate to an executive.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ y: -2 }}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl text-white shadow-xl bg-[--theme] border border-white/20 hover:shadow-2xl"
          style={{ "--theme": THEME_HEX }}
        >
          <MessageCircle size={18} /> Talk to us
        </motion.button>
      )}
    </div>
  );
};

// ---------- Terms (short placeholder) ----------
const TERMS_FULL = `NOIR MODEL UNITED NATIONS — TERMS & PRIVACY (Short Version)\n\nBy using this site or registering for Noir MUN, you agree to basic event terms: appropriate conduct, non-refundable fees, and reasonable use of your data for operations and updates. Decisions by the Organising Committee and EB are final. For details or clarifications, write to allotments.noirmun@gmail.com.`;

const Footer = () => {
  const [open, setOpen] = useState(false);
  return (
    <footer className="relative border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-3 gap-8 text-white/80">
        <div>
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} className="h-10 w-10" alt="logo" />
            <div className="font-semibold">Noir MUN</div>
          </div>
          <p className="mt-3 text-sm">
            Faridabad, India • Precision, presence, and policy — in motion.
          </p>
        </div>
        {/* Core Team block removed per request */}
        <div>
          <div className="font-semibold">Legal</div>
          <button
            onClick={() => setOpen(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 hover:bg-white/10"
          >
            Privacy & Terms <ExternalLink size={16} />
          </button>
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

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="max-w-3xl w-full max-h-[80vh] overflow-auto rounded-2xl border border-white/15 bg-[#0a0a1a] text-white p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  NOIR MODEL UNITED NATIONS — TERMS & PRIVACY
                </h3>
                <button onClick={() => setOpen(false)} className="p-1 hover:opacity-80">
                  <X size={18} />
                </button>
              </div>
              <pre className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-white/80">
                {TERMS_FULL}
              </pre>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};

// ---------- Page ----------
export default function NoirMUN_v2() {
  const [loaded, setLoaded] = useState(false);
  const [briefIdx, setBriefIdx] = useState(null);
  useEffect(() => {
    const onReady = () => setTimeout(() => setLoaded(true), 1200);
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
      style={{
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, 'Helvetica Neue', Arial",
      }}
    >
      <Preloader done={loaded} />
      <Header />
      <main>
        <Hero onOpenAssist={() => openMUNAssistance()} />
        <Committees onOpenBrief={(i) => setBriefIdx(i)} />
      </main>
      <Footer />
      <CommitteeBriefModal idx={briefIdx} onClose={() => setBriefIdx(null)} />
      <ChatWidget onEscalate={() => window.open(WHATSAPP_ESCALATE, "_blank")} />

      <style>{`
        :root { --theme: ${THEME_HEX}; }
        html, body, #root { height: 100%; }
        .perspective { perspective: 900px; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.2); border-radius: 999px; }
        ::selection{ background: rgba(255,255,255,.25); }
      `}</style>
    </div>
  );
}
