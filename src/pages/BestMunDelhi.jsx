import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { LOGO_URL, REGISTER_URL, COMMITTEES, THEME_HEX, DATES_TEXT } from "../shared/constants";

function useSEO() {
  useEffect(() => {
    const title = "Best MUN in Delhi & Faridabad — Noir MUN 2025";
    const desc = "Looking for the best MUN in Delhi NCR and Faridabad? Noir MUN 2025 brings elite councils, EB quality, and a two‑day experience. Register now.";
    const canonical = `${window.location.origin}/best-mun-delhi-faridabad`;

    document.title = title;

    const meta = (key, val, attr = "name") => {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", val);
    };

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
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = canonical;

    // JSON‑LD (Organization + Event + FAQ + Breadcrumb + Site Search)
    const jsonld = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Noir Model United Nations",
        "url": window.location.origin,
        "logo": LOGO_URL
      },
      {
        "@context": "https://schema.org",
        "@type": "EducationEvent",
        "name": "Noir MUN 2025",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "startDate": "2025-10-11",
        "endDate": "2025-10-12",
        "location": {
          "@type": "Place",
          "name": "Faridabad (Venue TBA)",
          "address": { "@type": "PostalAddress", "addressLocality": "Faridabad", "addressRegion": "Haryana", "addressCountry": "IN" }
        },
        "organizer": { "@type": "Organization", "name": "Noir Model United Nations" },
        "image": [LOGO_URL],
        "description": desc,
        "offers": { "@type": "Offer", "price": "2300", "priceCurrency": "INR", "availability": "https://schema.org/InStock", "url": REGISTER_URL }
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "Which is the best MUN in Delhi NCR / Faridabad?",
            "acceptedAnswer": { "@type": "Answer", "text": "Noir MUN 2025 is a top Delhi NCR conference due to its experienced EB, diverse councils, and two‑day format focused on delegate experience." } },
          { "@type": "Question", "name": "What are the dates and fee?",
            "acceptedAnswer": { "@type": "Answer", "text": `${DATES_TEXT}. Delegate fee: ₹2300.` } },
          { "@type": "Question", "name": "How do I register?",
            "acceptedAnswer": { "@type": "Answer", "text": `Use the Register button on this page or visit ${REGISTER_URL}.` } },
          { "@type": "Question", "name": "Which councils are offered?",
            "acceptedAnswer": { "@type": "Answer", "text": "UNGA, UNCSW, AIPPM, International Press, IPL (Double Delegation), and YouTube All Stars." } }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": window.location.origin + "/" },
          { "@type": "ListItem", "position": 2, "name": "Best MUN in Delhi & Faridabad", "item": canonical }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": window.location.origin,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${window.location.origin}/assistance?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ];

    const ensureLD = (id, obj) => {
      let s = document.getElementById(id);
      if (!s) { s = document.createElement("script"); s.type = "application/ld+json"; s.id = id; document.head.appendChild(s); }
      s.textContent = JSON.stringify(obj);
    };
    jsonld.forEach((obj, i) => ensureLD("ld-"+i, obj));
  }, []);
}

export default function BestMunDelhi() {
  useSEO();

  const staff = [
    ["Sameer Jhamb", "Founder"], ["Maahir Gulati", "Co‑Founder"], ["Gautam Khera", "President"],
    ["Daanish Narang", "Chief Advisor"], ["Vishesh Kumar", "Junior Advisor"],
    ["Jhalak Batra", "Secretary General"], ["Anushka Dua", "Director General"],
    ["Mahi Choudharie", "Deputy Director General"], ["Namya Negi", "Deputy Secretary General"],
    ["Shambhavi Sharma", "Vice President"], ["Shubh Dahiya", "Executive Director"],
    ["Nimay Gupta", "Deputy Executive Director"], ["Gauri Khatter", "Charge D'Affaires"],
    ["Garima", "Conference Director"], ["Madhav Sadana", "Conference Director"], ["Shreyas Kalra", "Chef D Cabinet"]
  ];

  return (
    <div className="min-h-screen text-white">
      <header className="px-4 py-4 border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <img src={LOGO_URL} alt="Noir MUN logo" className="h-8 w-8 object-contain" />
          <h1 className="text-xl font-bold">Best MUN in Delhi & Faridabad — Noir MUN 2025</h1>
          <a href={REGISTER_URL} target="_blank" rel="noreferrer"
             className="ml-auto rounded-xl border border-white/20 px-3 py-2 hover:bg-white/10">
            Register
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10">
        <section className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-extrabold">Why Noir ranks among Delhi NCR’s best MUNs</h2>
            <p className="mt-3 text-white/80">
              Noir MUN 2025 blends rigorous adjudication with production‑quality staging: elite councils,
              tight crisis management, and a delegate‑first experience.
            </p>
            <ul className="mt-4 list-disc list-inside text-white/80 space-y-1">
              <li>Experienced EB with award‑calibrated rubrics</li>
              <li>Deep committee briefs and clear agendas</li>
              <li>Media coverage and IP opportunities</li>
              <li>Affordable fee with high production value</li>
            </ul>
            <a href={REGISTER_URL} target="_blank" rel="noreferrer"
               className="inline-block mt-5 rounded-2xl bg-white/15 hover:bg-white/25 px-5 py-3 border border-white/20">
              Secure your seat
            </a>
          </div>

          <div className="rounded-2xl border border-white/15 p-6 bg-white/[0.04]">
            <h3 className="text-xl font-bold">Councils at Noir MUN 2025</h3>
            <ul className="mt-3 space-y-2 text-white/80">
              {COMMITTEES.map((c) => (
                <li key={c.name}><span className="font-semibold">{c.name}</span> — {c.agenda}</li>
              ))}
            </ul>
            <div className="mt-4 text-sm text-white/60">Full formats and dossiers available on the site.</div>
          </div>
        </section>

        <section className="mt-12 grid md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-white/15 p-6 bg-white/[0.04]">
            <h3 className="text-lg font-bold">Dates & Venue</h3>
            <p className="mt-2 text-white/80">{DATES_TEXT} • Faridabad (Venue TBA)</p>
          </div>
          <div className="rounded-2xl border border-white/15 p-6 bg-white/[0.04]">
            <h3 className="text-lg font-bold">Delegate Fee</h3>
            <p className="mt-2 text-white/80">₹2300</p>
          </div>
          <div className="rounded-2xl border border-white/15 p-6 bg-white/[0.04]">
            <h3 className="text-lg font-bold">Essentials</h3>
            <ul className="mt-2 list-disc list-inside text-white/80 space-y-1">
              <li>English proceedings</li><li>Formal dress code</li><li>Awards at OC/EB discretion</li>
            </ul>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-extrabold">Executive & Advisory Team</h2>
          <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map(([n, r]) => (
              <div key={n} className="rounded-xl border border-white/15 p-4 bg-white/[0.04]">
                <div className="font-semibold">{n}</div>
                <div className="text-white/70 text-sm">{r}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-extrabold">FAQs (Delhi & Faridabad delegates)</h2>
          <div className="mt-4 grid md:grid-cols-2 gap-6 text-white/80">
            <div><h4 className="font-semibold">Is Noir MUN beginner‑friendly?</h4><p className="mt-1">Yes — our briefs and moderated caucus formats help first‑timers ramp quickly.</p></div>
            <div><h4 className="font-semibold">Do you have crisis elements?</h4><p className="mt-1">Select councils use crisis notes and directive mechanics depending on agenda flow.</p></div>
            <div><h4 className="font-semibold">How do I get updates?</h4><p className="mt-1">Follow the Register flow or use the WhatsApp escalation button on Home.</p></div>
            <div><h4 className="font-semibold">What makes Noir “best” in Delhi NCR?</h4><p className="mt-1">Experienced EB, strong production, delegate‑first policies, and transparent logistics.</p></div>
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-white/15 p-6 bg-white/[0.04] text-center">
          <h3 className="text-xl font-bold">Ready to join the best MUN in Delhi NCR?</h3>
          <a href={REGISTER_URL} target="_blank" rel="noreferrer"
             className="mt-4 inline-block rounded-2xl bg-white/15 hover:bg-white/25 px-6 py-3 border border-white/20">
            Register for Noir MUN 2025
          </a>
          <div className="mt-2 text-white/70 text-sm">Or explore <Link to="/assistance" className="underline">MUN Assistance</Link>.</div>
        </section>
      </main>

      <style>{` :root { --theme: ${THEME_HEX}; } a { color:#fff } `}</style>
    </div>
  );
}
