import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LOGO_URL, REGISTER_URL, WHATSAPP_ESCALATE, ASSIST_TEXT, DATES_TEXT } from "../shared/constants";

async function fetchWiki(topic) {
  const q = topic.replace(/^wiki:|^web:/i, "").trim();
  const res = await fetch(
    "https://en.wikipedia.org/w/rest.php/v1/search/title?q=" +
      encodeURIComponent(q) +
      "&limit=3&lang=en",
    { headers: { Accept: "application/json" } }
  );
  const j = await res.json();
  if (!j || !j.pages || !j.pages.length) return "Wikipedia: no results.";
  const lines = j.pages.map(
    (p, i) =>
      `${i + 1}. ${p.title} — https://en.wikipedia.org/wiki/${encodeURIComponent(
        p.title.replace(/\s/g, "_")
      )}`
  );
  try {
    const t = j.pages[0].title;
    const sr = await fetch(
      "https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(t)
    );
    const s = await sr.json();
    if (s && s.extract) lines.unshift("Summary: " + s.extract);
  } catch {}
  return "Wikipedia:\n" + lines.join("\n");
}

async function fetchJina(url) {
  const clean = url.replace(/^read:/i, "").trim().replace(/^https?:\/\//, "");
  const r = await fetch("https://r.jina.ai/http://" + clean);
  const txt = await r.text();
  return "Reader:\n" + txt.slice(0, 800) + (txt.length > 800 ? "…" : "");
}

export default function Assistance() {
  const [tab, setTab] = useState("chat");
  const [thread, setThread] = useState([
    { from: "bot", text: "Hi — I’m WILT. Ask about Noir (dates, fee, venue, founders, committees) or use: web: <topic>, read: <url>." },
  ]);
  const [input, setInput] = useState("");

  const KB = useMemo(
    () => ({
      dates: DATES_TEXT,
      fee: "₹2300",
      venue: "TBA",
      founders:
        "Founder: Sameer Jhamb, Co-Founder: Maahir Gulati, President: Gautam Khera",
      register: REGISTER_URL,
      whatsapp: WHATSAPP_ESCALATE,
      rops: ASSIST_TEXT,
    }),
    []
  );

  const send = async () => {
    const v = input.trim();
    if (!v) return;
    setThread((t) => [...t, { from: "user", text: v }]);
    setInput("");

    const q = v.toLowerCase();
    const intent =
      /^web:|^wiki:/.test(q) ? "web" :
      /^read:/.test(q) ? "read" :
      /date|when/.test(q) ? "dates" :
      /fee|price|cost/.test(q) ? "fee" :
      /venue|where|location/.test(q) ? "venue" :
      /founder|organiser|organizer|oc|eb/.test(q) ? "founders" :
      /register|sign/.test(q) ? "register" :
      /una|rops|rules/.test(q) ? "rops" :
      /exec|human|someone|whatsapp/.test(q) ? "escalate" :
      "fallback";

    let out = "Ask WILT about Noir, or try: web: United Nations / read: https://…";
    try {
      switch (intent) {
        case "dates": out = "Dates: " + KB.dates; break;
        case "fee": out = "Delegate fee: " + KB.fee; break;
        case "venue": out = "Venue: " + KB.venue + " — want WhatsApp updates when we announce?"; break;
        case "founders": out = "Leadership — " + KB.founders; break;
        case "register": out = "Open Linktree → " + KB.register; break;
        case "rops": out = KB.rops; break;
        case "web": out = await fetchWiki(v); break;
        case "read": out = await fetchJina(v); break;
        case "escalate":
          window.open(KB.whatsapp, "_blank");
          out = "Opening WhatsApp…";
          break;
      }
    } catch (e) {
      out = "Error fetching that. Try again?";
    }
    setThread((t) => [...t, { from: "bot", text: out }]);
  };

  return (
    <div className="min-h-screen text-white relative">
      <header className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Noir" className="h-9 w-9 object-contain" />
          <strong>Noir MUN Assistance</strong>
        </div>
        <nav className="flex items-center gap-3">
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/20 px-3 py-2"
          >
            Register
          </a>
          <Link to="/" className="rounded-xl border border-white/20 px-3 py-2">
            Home
          </Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-4 grid md:grid-cols-[360px_1fr] gap-4">
        <aside className="border border-white/10 rounded-2xl p-4 bg-white/5">
          <h2 className="font-semibold">UNA-USA ROPs — Lightning Guide</h2>
          <pre className="mt-2 whitespace-pre-wrap text-white/80 text-sm">
            {ASSIST_TEXT}
          </pre>
          <h3 className="font-semibold mt-4">Quick Links</h3>
          <div className="text-sm text-white/80 mt-1">
            • Linktree: {REGISTER_URL}
            <br />
            • WhatsApp Exec: {WHATSAPP_ESCALATE}
            <br />
            • Email: allotments.noirmun@gmail.com
          </div>
        </aside>

        <section className="border border-white/10 rounded-2xl p-4 bg-white/5">
          {/* Tabs */}
          <div className="flex gap-2 mb-3">
            {["chat", "rop", "quiz", "rubric"].map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`rounded-xl border border-white/20 px-3 py-2 ${tab === k ? "bg-white/10" : ""}`}
              >
                {k === "chat" && "Chat (WILT)"}
                {k === "rop" && "ROP Simulator"}
                {k === "quiz" && "Committee Quiz"}
                {k === "rubric" && "Awards Rubric"}
              </button>
            ))}
          </div>

          {/* Chat */}
          {tab === "chat" && (
            <div className="border border-white/10 rounded-xl p-3">
              <div className="text-sm text-white/70 mb-2">
                WILT — Local KB + Wikipedia + Jina Reader
              </div>
              <div className="h-64 overflow-auto space-y-2 bg-white/5 rounded-lg p-2">
                {thread.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] px-3 py-2 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                      m.from === "bot" ? "bg-white/20" : "bg-white/30 ml-auto"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Dates", "Fee", "Venue", "Founders", "Register", "UNA-USA ROPs", "web: United Nations", "read: https://en.wikipedia.org/wiki/United_Nations", "Talk to executive"].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setInput(t);
                      setTimeout(() => send(), 50);
                    }}
                    className="text-xs rounded-full px-3 py-1 bg-white/15"
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder='Ask WILT… (try "dates", or "web: United Nations")'
                  className="flex-1 bg-white/10 px-3 py-2 rounded-lg outline-none"
                />
                <button onClick={send} className="rounded-lg border border-white/20 px-3">
                  Send
                </button>
              </div>
            </div>
          )}

          {/* ROP Simulator */}
          {tab === "rop" && (
            <div className="border border-white/10 rounded-xl p-3">
              <div className="text-sm font-semibold mb-2">ROP Simulator</div>
              <div className="text-sm text-white/80">
                Choose a motion/point to see phrasing and outcome:
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { k: "Set Agenda", p: "Motion to set the agenda to …", vote: "Simple majority" },
                  { k: "Moderated Caucus", p: "Motion for a moderated caucus of X minutes, Y speaking time on …", vote: "Simple majority" },
                  { k: "Unmoderated Caucus", p: "Motion for an unmoderated caucus of X minutes.", vote: "Simple majority" },
                  { k: "Introduce Draft", p: "Motion to introduce draft resolution/working paper …", vote: "Simple majority" },
                  { k: "Close Debate", p: "Motion to close debate and move to voting.", vote: "2/3 majority" },
                ].map((m) => (
                  <div key={m.k} className="rounded-xl border border-white/20 px-3 py-2 bg-white/10">
                    <div className="font-semibold">{m.k}</div>
                    <div className="text-sm text-white/80 mt-1">
                      Raise: “{m.p}”
                      <br />
                      Voting: {m.vote}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-white/60">
                Points: Personal Privilege • Parliamentary Inquiry • Order
              </div>
            </div>
          )}

          {/* Quiz */}
          {tab === "quiz" && (
            <div className="border border-white/10 rounded-xl p-3">
              <div className="text-sm font-semibold mb-2">Committee Recommender</div>
              <div className="text-sm text-white/80">
                Quick, fun quiz we can expand later. (We’ll wire your full scoring when you want.)
              </div>
            </div>
          )}

          {/* Rubric */}
          {tab === "rubric" && (
            <div className="border border-white/10 rounded-xl p-3">
              <div className="text-sm font-semibold mb-2">Awards Rubric</div>
              <div className="grid gap-2">
                {[
                  { label: "Substance (35%)", w: "70%" },
                  { label: "Diplomacy/Bloc (30%)", w: "60%" },
                  { label: "Docs/Drafting (22.5%)", w: "45%" },
                  { label: "Procedure/Decorum (12.5%)", w: "35%" },
                ].map((b) => (
                  <div key={b.label}>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: b.w, background: "linear-gradient(90deg, rgba(255,255,255,.6), rgba(255,255,255,.2))" }} />
                    </div>
                    <div className="text-xs text-white/70 mt-1">{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
