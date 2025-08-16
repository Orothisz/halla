// src/pages/BestMunDelhi.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LOGO_URL,
  REGISTER_URL,
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

export default function BestMunDelhi() {
  useSEO();
  const [menuOpen, setMenuOpen] = useState(false);

  const staff = [
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
  ];

  return (
    <div className="min-h-screen text-white relative overflow-clip bg-black">
      {/* Background */}
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(1200px_800px_at_80%_-20%,rgba(255,255,255,0.08),rgba(0,0,0,0)),radial-gradient(1000px_600px_at_10%_20%,rgba(255,255,255,0.06),rgba(0,0,0,0))]" />
      <div
        className="fixed inset-0 -z-10 opacity-[.06] pointer-events-none"
        style={{ backgroundImage: "url('/noise.png')" }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <img
                src={LOGO_URL}
                alt="Noir MUN logo"
                className="h-8 w-8 object-contain shrink-0"
              />
              <span className="font-semibold truncate">Noir MUN</span>
            </Link>

            <h1 className="ml-2 text-sm sm:text-base font-bold truncate">
              Best MUN in Delhi NCR &amp; Faridabad
            </h1>

            {/* Desktop CTAs */}
            <div className="ml-auto hidden sm:flex items-center gap-2">
              <Link
                to="/"
                className="rounded-lg px-3 py-2 text-sm hover:bg-white/10"
              >
                Home
              </Link>
              <Link
                to="/assistance"
                className="rounded-lg px-3 py-2 text-sm hover:bg-white/10"
              >
                Assistance
              </Link>
              <Link
                to="/committees"
                className="rounded-lg px-3 py-2 text-sm hover:bg-white/10"
              >
                Committees
              </Link>
              <a
                href={REGISTER_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
              >
                Register
              </a>
            </div>

            {/* Mobile burger */}
            <button
              aria-label="Toggle menu"
              className="ml-auto sm:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-white/10 active:scale-[.98]"
              onClick={() => setMenuOpen((s) => !s)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Mobile sheet */}
          {menuOpen && (
            <nav className="sm:hidden mt-3 grid gap-2 pb-2">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-base bg-white/[0.04] border border-white/10"
              >
                Home
              </Link>
              <Link
                to="/assistance"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-base bg-white/[0.04] border border-white/10"
              >
                Assistance
              </Link>
              <Link
                to="/committees"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-base bg-white/[0.04] border border-white/10"
              >
                Committees
              </Link>
              <a
                href={REGISTER_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl px-3 py-3 text-base bg-white/15 hover:bg-white/25 border border-white/20 text-center"
              >
                Register
              </a>
            </nav>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* Hero / Why Noir */}
        <section className="grid md:grid-cols-2 gap-6 sm:gap-10 items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Why Noir is Delhi NCR’s benchmark MUN
            </h2>
            <p className="mt-3 text-white/80 text-sm sm:text-base">
              Noir MUN 2025 blends intellectual depth with production value:
              carefully curated councils, dynamic crisis elements, and a
              delegate-first ethos. This is where debate feels cinematic.
            </p>
            <ul className="mt-4 list-disc list-inside text-white/80 space-y-1 text-sm sm:text-base">
              <li>Executive Board with national & international credentials</li>
              <li>Structured briefs and agenda clarity for all levels</li>
              <li>Integrated media, coverage, and press engagement</li>
              <li>Affordable fee without compromise on scale</li>
            </ul>

            {/* Mobile CTA block width */}
            <a
              href={REGISTER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex sm:inline-block w-full sm:w-auto justify-center mt-6 rounded-2xl bg-white/15 hover:bg-white/25 px-6 py-3 border border-white/20 text-base"
            >
              Secure Your Seat →
            </a>
          </div>

          <div className="rounded-2xl border border-white/15 p-5 sm:p-6 bg-white/[0.04]">
            <h3 className="text-lg sm:text-xl font-bold">Councils at Noir 2025</h3>
            <ul className="mt-3 space-y-2 text-white/80 text-sm sm:text-base">
              {COMMITTEES.map((c) => (
                <li key={c.name}>
                  <span className="font-semibold">{c.name}</span> — {c.agenda}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs sm:text-sm text-white/60">
              Detailed study guides & dossiers available post-allocation.
            </div>
          </div>
        </section>

        {/* Info Cards */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="rounded-2xl border border-white/15 p-5 sm:p-6 bg-white/[0.04]">
            <h3 className="text-base sm:text-lg font-bold">Dates & Venue</h3>
            <p className="mt-2 text-white/80 text-sm sm:text-base">
              {DATES_TEXT} • Faridabad (Venue TBA)
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 p-5 sm:p-6 bg-white/[0.04]">
            <h3 className="text-base sm:text-lg font-bold">Delegate Fee</h3>
            <p className="mt-2 text-white/80 text-sm sm:text-base">₹2300</p>
          </div>
          <div className="rounded-2xl border border-white/15 p-5 sm:p-6 bg-white/[0.04]">
            <h3 className="text-base sm:text-lg font-bold">Conference Essentials</h3>
            <ul className="mt-2 list-disc list-inside text-white/80 space-y-1 text-sm sm:text-base">
              <li>English proceedings</li>
              <li>Formal dress code</li>
              <li>Awards at OC/EB discretion</li>
            </ul>
          </div>
        </section>

        {/* Team */}
        <section>
          <h2 className="text-xl sm:text-2xl font-extrabold">
            Executive & Advisory Team
          </h2>
          <div className="mt-4 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {staff.map(([n, r]) => (
              <div
                key={n}
                className="rounded-xl border border-white/15 p-4 bg-white/[0.04]"
              >
                <div className="font-semibold text-sm sm:text-base">{n}</div>
                <div className="text-white/70 text-xs sm:text-sm">{r}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h2 className="text-xl sm:text-2xl font-extrabold">FAQs</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-white/80">
            <div>
              <h4 className="font-semibold text-sm sm:text-base">
                Beginner-friendly?
              </h4>
              <p className="mt-1 text-sm sm:text-base">
                Absolutely. Briefs and moderated formats make it easy for
                first-timers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base">
                Crisis elements?
              </h4>
              <p className="mt-1 text-sm sm:text-base">
                Select councils integrate crisis mechanics and directives for
                dynamic debate.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base">Updates?</h4>
              <p className="mt-1 text-sm sm:text-base">
                Register for direct updates or use our WhatsApp escalation on
                Home.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base">
                Why “best” in Delhi NCR?
              </h4>
              <p className="mt-1 text-sm sm:text-base">
                Quality EB, production scale, delegate-centric design, and
                transparent logistics.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="rounded-2xl border border-white/15 p-6 sm:p-8 bg-white/[0.04] text-center">
          <h3 className="text-lg sm:text-xl font-bold">
            Ready to join Delhi NCR’s leading MUN?
          </h3>
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-4 sm:mt-5 inline-flex w-full sm:w-auto justify-center rounded-2xl bg-white/15 hover:bg-white/25 px-6 sm:px-8 py-3 border border-white/20 text-base"
          >
            Register for Noir MUN 2025
          </a>
          <div className="mt-3 text-white/70 text-xs sm:text-sm">
            Need help? Visit{" "}
            <Link to="/assistance" className="underline">
              MUN Assistance
            </Link>
            .
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-black/50 backdrop-blur-md border-t border-white/10 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-sm">
          {/* Column 1 */}
          <div className="space-y-2">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src={LOGO_URL} alt="Noir" className="h-7 w-7 object-contain" />
              <span className="font-semibold">Noir MUN</span>
            </Link>
            <p className="text-white/70 text-xs">Faridabad, India</p>
          </div>

          {/* Column 2 */}
          <div className="space-y-2">
            <div className="font-semibold text-white/90">Navigation</div>
            <Link to="/" className="block text-white/70 hover:text-white">
              Home
            </Link>
            <a
              href={REGISTER_URL}
              target="_blank"
              rel="noreferrer"
              className="block text-white/70 hover:text-white"
            >
              Register
            </a>
            <Link to="/assistance" className="block text-white/70 hover:text-white">
              Assistance
            </Link>
            <Link to="/committees" className="block text-white/70 hover:text-white">
              Committees
            </Link>
          </div>

          {/* Column 3 */}
          <div className="space-y-2">
            <div className="font-semibold text-white/90">Committees</div>
            {COMMITTEES.slice(0, 4).map((c) => (
              <div key={c.name} className="text-white/70">
                {c.name}
              </div>
            ))}
            <Link to="/committees" className="text-white/70 hover:text-white">
              View all
            </Link>
          </div>

          {/* Column 4 */}
          <div className="space-y-2">
            <div className="font-semibold text-white/90">Socials</div>
            <a
              href="https://instagram.com/noirmun"
              target="_blank"
              rel="noreferrer"
              className="block text-white/70 hover:text-white"
            >
              Instagram
            </a>
            <a
              href="https://linktr.ee/noirmun"
              target="_blank"
              rel="noreferrer"
              className="block text-white/70 hover:text-white"
            >
              Linktree
            </a>
          </div>
        </div>
        <div className="text-center text-[11px] text-white/60 py-3 border-t border-white/10">
          © {new Date().getFullYear()} Noir MUN. All rights reserved.
        </div>
      </footer>

      {/* Global theme + mobile tap highlight fix */}
      <style>{`
        :root { --theme: ${THEME_HEX}; }
        a { color: #fff; -webkit-tap-highlight-color: transparent; }
        /* Smaller phones: tighten spacing but keep readability */
        @media (max-width: 360px) {
          h1 { font-size: 0.95rem; }
        }
      `}</style>
    </div>
  );
}
