// api/ask.js
export const config = { runtime: "edge" };

const OPENROUTER_MODEL_PLANNER = "meta-llama/llama-3.1-8b-instruct:free";
const OPENROUTER_MODEL_WRITER  = "meta-llama/llama-3.1-8b-instruct:free";

const NOIR_KB = {
  dates: (typeof process !== "undefined" && process.env.DATES_TEXT) || "11–12 October, 2025",
  fee: "₹2300",
  venue: "TBA",
  register: (typeof process !== "undefined" && process.env.REGISTER_URL) || "https://linktr.ee/noirmun",
  whatsapp: (typeof process !== "undefined" && process.env.WHATSAPP_ESCALATE) || "",
  email: "allotments.noirmun@gmail.com",
};

/* ---------------- Basics ---------------- */
function kbLookup(q) {
  const s = (q || "").toLowerCase();
  const facts = [];
  if (/(date|when|schedule|oct)/.test(s)) facts.push(`Dates: ${NOIR_KB.dates}`);
  if (/(fee|price|cost|₹|inr)/.test(s)) facts.push(`Delegate fee: ${NOIR_KB.fee}`);
  if (/(venue|where|location|address)/.test(s)) facts.push(`Venue: ${NOIR_KB.venue}`);
  if (/(register|registration|linktree|apply)/.test(s)) facts.push(`Register: ${NOIR_KB.register}`);
  if (/(whatsapp|exec|contact|email)/.test(s)) facts.push(`WhatsApp Exec: ${NOIR_KB.whatsapp} • Email: ${NOIR_KB.email}`);
  return facts;
}

async function callOpenRouter(model, messages, temperature = 0.2) {
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({ model, messages, temperature }),
  });
  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  return j.choices?.[0]?.message?.content || "";
}

/* ---------------- Search: Serper.dev (free) ---------------- */
async function serperSearch(query, limit = 8) {
  const r = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: Math.min(limit, 10) }),
  });
  if (!r.ok) throw new Error("Serper error: " + r.status);
  const j = await r.json().catch(() => ({}));
  const items = [];
  const src = j.organic || [];
  for (const it of src) {
    if (!it?.link) continue;
    items.push({
      title: it.title || it.link,
      url: it.link,
      snippet: it.snippet || "",
    });
    if (items.length >= limit) break;
  }
  return items;
}

/* ---------------- Reader: Jina (free) ---------------- */
async function readUrl(url) {
  try {
    const clean = url.replace(/^https?:\/\//, "");
    const r = await fetch("https://r.jina.ai/http://" + clean, {
      headers: { "User-Agent": "noir-wilt/1.0" },
    });
    const txt = await r.text();
    return txt ? txt.slice(0, 15000) : "";
  } catch {
    return "";
  }
}

/* ---------------- Prompts ---------------- */
const PLANNER_PROMPT = `
You are the planner for WILT+. Decide what tools to use.

Rules:
- If it's a simple Noir fact (dates, fee, venue, register, contacts): "use_kb": true.
- If it needs outside info or is current/non-trivial: "use_search": true with 1–3 focused queries.
- If URLs are present or search is needed: "use_read": true.
Return STRICT JSON only:
{"use_kb":bool,"use_search":bool,"queries":string[],"use_read":bool,"urls":string[]}
`;

const WRITER_PROMPT = `
You are WILT+, Noir MUN's flagship assistant.

Inputs:
- kb: Noir facts
- search: [{title,url,snippet}]
- pages: [{url,text}]
Write a concise grounded answer. Use bullets where helpful. End with "Sources:" listing 2–5 items as "Title — URL". Do not invent links. If evidence is thin, say so and suggest a better query.
`;

/* ---------------- JSON repair ---------------- */
function safeParsePlan(text, userText) {
  try { const plan = JSON.parse(text); if (plan && typeof plan === "object") return plan; } catch {}
  // fallback: if KB doesn't cover, force search
  const kb = kbLookup(userText);
  return {
    use_kb: kb.length > 0,
    use_search: kb.length === 0,
    queries: [userText],
    use_read: true,
    urls: [],
  };
}

/* ---------------- Main handler ---------------- */
export default async function handler(req) {
  if (req.method !== "POST") return new Response("Use POST", { status: 405 });
  const { messages } = await req.json().catch(() => ({ messages: [] }));
  const userText = messages?.slice(-1)?.[0]?.content || "";

  // 0) Plan
  const plannerOut = await callOpenRouter(OPENROUTER_MODEL_PLANNER, [
    { role: "system", content: PLANNER_PROMPT },
    { role: "user", content: userText },
  ]);
  const plan = safeParsePlan(plannerOut, userText);

  // 1) KB
  const kbFacts = plan.use_kb ? kbLookup(userText) : [];

  // 2) Search (with fallback)
  let searchResults = [];
  if (plan.use_search) {
    const queries = (plan.queries || []).slice(0, 3);
    for (const q of queries) {
      try {
        const res = await serperSearch(q, 8);
        for (const item of res) {
          if (item.url && !searchResults.find(x => x.url === item.url)) searchResults.push(item);
        }
      } catch {}
      if (searchResults.length >= 12) break;
    }
  }
  if (!searchResults.length && kbFacts.length === 0) {
    try { searchResults = await serperSearch(userText, 8); } catch {}
  }

  // 3) Read pages (top 3; skip empties)
  const urlsToRead = Array.from(new Set([...(plan.urls || []), ...searchResults.slice(0, 5).map(r => r.url)])).slice(0, 3);
  const pageExcerpts = [];
  for (const u of urlsToRead) {
    const txt = await readUrl(u);
    if (txt && txt.length > 400) pageExcerpts.push({ url: u, text: txt.slice(0, 5000) });
  }

  // 4) Compose
  const context = JSON.stringify({ kb: kbFacts, search: searchResults.slice(0, 8), pages: pageExcerpts });
  const answerText = await callOpenRouter(OPENROUTER_MODEL_WRITER, [
    { role: "system", content: WRITER_PROMPT },
    { role: "user", content: `User question: ${userText}\n\nContext JSON:\n${context}` },
  ]);

  // 5) Sources (fallback list for the UI badge)
  const sources = searchResults.slice(0, 5).map(r => ({ title: r.title, url: r.url }));

  return new Response(JSON.stringify({
    answer: answerText || "Sorry — I couldn’t confidently find a good answer to that.",
    sources
  }), { headers: { "Content-Type": "application/json" } });
}
