// api/ask.js
export const config = { runtime: "edge" };

/* ================= Models ================= */
const OR_PLANNER = "google/gemma-2-9b-it:free";   // OpenRouter model (less throttled)
const OR_WRITER  = "google/gemma-2-9b-it:free";
const GROQ_PLANNER = "llama-3.1-8b-instant";      // Groq fallback
const GROQ_WRITER  = "llama-3.1-8b-instant";

/* ================= Noir KB ================= */
const NOIR_KB = {
  dates: (typeof process !== "undefined" && process.env.DATES_TEXT) || "11–12 October, 2025",
  fee: "₹2300",
  venue: "TBA",
  register: (typeof process !== "undefined" && process.env.REGISTER_URL) || "https://linktr.ee/noirmun",
  whatsapp: (typeof process !== "undefined" && process.env.WHATSAPP_ESCALATE) || "",
  email: "allotments.noirmun@gmail.com",
};

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

/* ================= LLM Calls ================= */
async function callOpenRouter({ model, messages, temperature = 0.2, referer, title }) {
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      // Required for free-tier stability:
      "HTTP-Referer": referer || "https://noir-mun.com",
      "X-Title": title || "Noir MUN — WILT+",
    },
    body: JSON.stringify({ model, messages, temperature }),
  });
  if (!r.ok) throw new Error(`OpenRouter ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content || "";
}

async function callGroq({ model, messages, temperature = 0.2 }) {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({ model, messages, temperature }),
  });
  if (!r.ok) throw new Error(`Groq ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content || "";
}

// Unified wrapper: try OpenRouter if key exists; otherwise or on error, try Groq.
async function callLLM({ prefer, messages, temperature, referer, title }) {
  const orKey = process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const plan = prefer === "planner";

  // choose model names
  const orModel = plan ? OR_PLANNER : OR_WRITER;
  const gqModel = plan ? GROQ_PLANNER : GROQ_WRITER;

  // Try OpenRouter if available
  if (orKey) {
    try {
      return await callOpenRouter({ model: orModel, messages, temperature, referer, title });
    } catch (_err) {
      // fall through to Groq
    }
  }
  // Try Groq if available
  if (groqKey) {
    return await callGroq({ model: gqModel, messages, temperature });
  }
  throw new Error("No LLM provider configured (missing OPENROUTER_API_KEY and GROQ_API_KEY).");
}

/* ================= Search & Reader ================= */
async function serperSearch(query, limit = 8) {
  const r = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num: Math.min(limit, 10) }),
  });
  if (!r.ok) throw new Error("Serper error: " + r.status);
  const j = await r.json().catch(() => ({}));
  const out = [];
  for (const it of j.organic || []) {
    if (!it?.link) continue;
    out.push({ title: it.title || it.link, url: it.link, snippet: it.snippet || "" });
    if (out.length >= limit) break;
  }
  return out;
}

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

/* ================= Prompts ================= */
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

/* ================= Helpers ================= */
function safeParsePlan(text, userText) {
  try {
    const plan = JSON.parse(text);
    if (plan && typeof plan === "object") return plan;
  } catch {}
  const kb = kbLookup(userText);
  return {
    use_kb: kb.length > 0,
    use_search: kb.length === 0,
    queries: [userText],
    use_read: true,
    urls: [],
  };
}

/* ================= Main Handler ================= */
export default async function handler(req) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  if (req.method !== "POST") return new Response("Use POST", { status: 405 });

  let body; try { body = await req.json(); } catch { body = {}; }
  const messages = body?.messages || [];
  const userText = messages?.slice(-1)?.[0]?.content || "";
  const referer = req.headers.get("origin") || req.headers.get("referer") || "https://noir-mun.com";

  /* 0) Plan */
  let plan;
  try {
    const plannerOut = await callLLM({
      prefer: "planner",
      messages: [{ role: "system", content: PLANNER_PROMPT }, { role: "user", content: userText }],
      temperature: 0.2,
      referer,
      title: "Noir MUN — WILT+ (planner)",
    });
    plan = safeParsePlan(plannerOut, userText);
  } catch {
    plan = safeParsePlan("", userText);
  }

  /* 1) KB */
  const kbFacts = plan.use_kb ? kbLookup(userText) : [];

  /* 2) Search */
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

  /* 3) Read pages (top 3) */
  const urlsToRead = Array.from(new Set([...(plan.urls || []), ...searchResults.slice(0, 5).map(r => r.url)])).slice(0, 3);
  const pageExcerpts = [];
  for (const u of urlsToRead) {
    const txt = await readUrl(u);
    if (txt && txt.length > 400) pageExcerpts.push({ url: u, text: txt.slice(0, 5000) });
  }

  /* 4) Compose */
  let answerText = "";
  try {
    const context = JSON.stringify({ kb: kbFacts, search: searchResults.slice(0, 8), pages: pageExcerpts });
    answerText = await callLLM({
      prefer: "writer",
      messages: [
        { role: "system", content: WRITER_PROMPT },
        { role: "user", content: `User question: ${userText}\n\nContext JSON:\n${context}` },
      ],
      temperature: 0.4,
      referer,
      title: "Noir MUN — WILT+ (writer)",
    });
  } catch {
    if (kbFacts.length) {
      answerText = kbFacts.join(" • ");
    } else if (searchResults.length) {
      const s = searchResults.slice(0, 3).map(r => `${r.title} — ${r.url}`).join("\n");
      answerText = `I couldn't reach the model just now, but here are relevant sources:\n${s}`;
    } else {
      answerText = "Sorry — I couldn’t confidently find a good answer to that.";
    }
  }

  /* 5) Sources for UI badge */
  const sources = searchResults.slice(0, 5).map(r => ({ title: r.title, url: r.url }));

  return new Response(JSON.stringify({ answer: answerText, sources }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}
