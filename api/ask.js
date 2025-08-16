// /api/ask.js
export const config = { runtime: "edge" };

/* ===================== Personality & Noir KB ===================== */
const PERSONA = `
You are WILT+, Noir MUN’s assistant.
Style: concise, confident, lightly Roman; answer first.
If venue is unknown, say “Venue is TBA—drop soon.”
Offer “Want the deep cut?” only if useful.
`;

const NOIR_KB = {
  dates: process.env.DATES_TEXT || "11–12 October, 2025",
  fee: "₹2300",
  venue: "TBA",
  register: process.env.REGISTER_URL || "https://linktr.ee/noirmun",
  whatsapp: process.env.WHATSAPP_ESCALATE || "",
  email: "allotments.noirmun@gmail.com",
  staff: {
    "sameer jhamb": "Founder",
    "maahir gulati": "Co-Founder",
    "gautam khera": "President",
    "daanesh narang": "Chief Advisor",
  },
};

function kbLookup(q) {
  const s = (q || "").toLowerCase();
  const facts = [];
  if (/(date|when|schedule|oct)/.test(s)) facts.push(`Dates: ${NOIR_KB.dates}`);
  if (/(fee|price|cost|₹|inr)/.test(s)) facts.push(`Delegate fee: ${NOIR_KB.fee}`);
  if (/(venue|where|location|address)/.test(s)) facts.push(`Venue: ${NOIR_KB.venue}`);
  if (/(register|registration|linktree|apply)/.test(s)) facts.push(`Register: ${NOIR_KB.register}`);
  if (/(whatsapp|exec|contact|email)/.test(s)) facts.push(`WhatsApp Exec: ${NOIR_KB.whatsapp} • Email: ${NOIR_KB.email}`);
  const hit = Object.keys(NOIR_KB.staff).find(k => s.includes(k));
  if (hit) facts.push(`${cap(hit)}: ${NOIR_KB.staff[hit]}`);
  if (/who.*(founder|founders)/.test(s)) {
    const fs = Object.entries(NOIR_KB.staff).filter(([,r])=>/founder/i.test(r)).map(([n])=>cap(n)).join(', ');
    facts.push(`Founders: ${fs}`);
  }
  return facts;
}
const cap = (x)=>x.replace(/\b\w/g,m=>m.toUpperCase());

/* ===================== Local RAG (static shards) ===================== */
let MANIFEST_CACHE = null;
const SHARD_CACHE = new Map();

async function getManifest(base) {
  if (MANIFEST_CACHE) return MANIFEST_CACHE;
  const url = `${base}/wilt_index/manifest.json`;
  const r = await fetch(url, { cache: "no-store" }).catch(()=>null);
  if (!r || !r.ok) return null;
  MANIFEST_CACHE = await r.json();
  return MANIFEST_CACHE;
}
async function getShard(base, shardUrl) {
  const full = `${base}${shardUrl}`;
  if (SHARD_CACHE.has(full)) return SHARD_CACHE.get(full);
  const r = await fetch(full, { cache: "no-store" });
  const j = await r.json();
  SHARD_CACHE.set(full, j);
  return j;
}
function cosine(a, b) {
  let dot=0, na=0, nb=0;
  for (let i=0;i<a.length;i++){ const x=a[i]||0, y=b[i]||0; dot+=x*y; na+=x*x; nb+=y*y; }
  return dot / (Math.sqrt(na)*Math.sqrt(nb) + 1e-9);
}
async function localSearch({ base, qvec, topK=8 }) {
  if (!qvec || !Array.isArray(qvec)) return [];
  const man = await getManifest(base);
  if (!man) return [];
  const scores = [];
  for (const s of man.shards || []) {
    const shard = await getShard(base, s.url);
    for (let i=0;i<shard.embeddings.length;i++) {
      const sc = cosine(qvec, shard.embeddings[i]);
      scores.push({ score: sc, text: shard.texts[i], meta: shard.meta[i] });
    }
  }
  scores.sort((a,b)=>b.score-a.score);
  return scores.slice(0, topK);
}

/* ===================== Web Search (Tavily → Serper) ===================== */
async function tavilySearch(query, maxResults=8) {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return null;
  const r = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      query,
      include_answer: true,
      max_results: Math.min(maxResults, 10),
      search_depth: "basic",
    }),
  });
  if (!r.ok) return null;
  const j = await r.json().catch(()=>null);
  if (!j) return null;
  return {
    answer: j.answer || "",
    results: (j.results || []).map(x => ({ title: x.title || x.url, url: x.url, snippet: x.content || "" })),
  };
}
async function serperSearch(query, limit=8) {
  const key = process.env.SERPER_API_KEY;
  if (!key) return [];
  const r = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": key, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num: Math.min(limit, 10) }),
  });
  if (!r.ok) return [];
  const j = await r.json().catch(()=> ({}));
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
    const r = await fetch("https://r.jina.ai/http://" + clean, { headers: { "User-Agent": "noir-wilt/1.0" } });
    const txt = await r.text();
    return txt ? txt.slice(0, 15000) : "";
  } catch { return ""; }
}

/* ===================== LLMs: Gemini primary, OR → Groq fallback ===================== */
async function callGemini({ prompt, system, temperature=0.4 }) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("Missing GOOGLE_API_KEY");
  const model = "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: system ? `${system}\n\nUser:\n${prompt}` : prompt }] }],
    generationConfig: { temperature, maxOutputTokens: 700, topP: 0.9 },
  };
  const r = await fetch(url, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${await r.text()}`);
  const j = await r.json();
  const parts = j?.candidates?.[0]?.content?.parts || [];
  return parts.map(p => p.text || "").join("").trim();
}

// OpenRouter → Groq fallbacks
const OR_PLANNER   = "google/gemma-2-9b-it:free";
const OR_WRITER    = "google/gemma-2-9b-it:free";
const GROQ_PLANNER = "llama-3.1-8b-instant";
const GROQ_WRITER  = "llama-3.1-8b-instant";

async function callOpenRouter({ model, messages, temperature=0.2, referer, title }) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("Missing OPENROUTER_API_KEY");
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
      "HTTP-Referer": referer || "https://noir-mun.com",
      "X-Title": title || "Noir MUN — WILT+",
    },
    body: JSON.stringify({ model, messages, temperature }),
  });
  if (!r.ok) throw new Error(`OpenRouter ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content || "";
}
async function callGroq({ model, messages, temperature=0.2 }) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("Missing GROQ_API_KEY");
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type":"application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({ model, messages, temperature }),
  });
  if (!r.ok) throw new Error(`Groq ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content || "";
}
async function callLLMFallback({ prefer, messages, temperature, referer, title }) {
  const plan = prefer === "planner";
  const orModel = plan ? OR_PLANNER : OR_WRITER;
  const gqModel = plan ? GROQ_PLANNER : GROQ_WRITER;

  if (process.env.OPENROUTER_API_KEY) {
    try {
      return await callOpenRouter({ model: orModel, messages, temperature, referer, title });
    } catch {}
  }
  if (process.env.GROQ_API_KEY) {
    return await callGroq({ model: gqModel, messages, temperature });
  }
  throw new Error("No LLM fallback provider configured");
}

/* ===================== Writer prompt ===================== */
const WRITER_SYSTEM = `
${PERSONA}
When using local context, prefer it over the open web.
If you used web results, end with:
Sources:
- Title — URL
(2–5 items)
`;

/* ===================== Main Handler ===================== */
export default async function handler(req) {
  // CORS
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
  const qvec = body?.qvec || null;

  // 0) Noir facts (instant)
  const kbFacts = kbLookup(userText);
  if (kbFacts.length && !qvec) {
    return jsonOK({ answer: kbFacts.join(" • "), sources: [] });
  }

  // 1) Local RAG (from static shards)
  const base = derivePublicBase(req);
  let rag = [];
  try { rag = await localSearch({ base, qvec, topK: 8 }); } catch {}

  // 2) If weak local & KB empty, do web search (Tavily → Serper)
  let searchResults = [];
  let tavilyAnswer = "";
  if ((!rag || rag.length < 2) && kbFacts.length === 0) {
    const tv = await tavilySearch(userText, 8);
    if (tv) { tavilyAnswer = tv.answer || ""; searchResults = tv.results || []; }
    if (!searchResults.length && process.env.SERPER_API_KEY) {
      try { searchResults = await serperSearch(userText, 8); } catch {}
    }
  }

  // 3) Prepare context for the writer
  const locals = (rag || []).map(r => ({ text: r.text, title: r.meta?.title, url: r.meta?.url, score: r.score }));
  const context = JSON.stringify({
    kb: kbFacts,
    local: locals,
    tavily_answer: tavilyAnswer,
    web: searchResults.slice(0, 6),
  });

  // 4) Compose: Gemini primary → OR/Groq fallback
  let answerText = "";
  try {
    if (process.env.GOOGLE_API_KEY) {
      answerText = await callGemini({
        system: WRITER_SYSTEM,
        prompt: `User: ${userText}\n\nContext JSON:\n${context}`,
        temperature: 0.4,
      });
    } else {
      throw new Error("No Gemini key");
    }
  } catch {
    try {
      answerText = await callLLMFallback({
        prefer: "writer",
        messages: [
          { role: "system", content: WRITER_SYSTEM },
          { role: "user", content: `User: ${userText}\n\nContext JSON:\n${context}` },
        ],
        temperature: 0.4,
        referer: req.headers.get("origin") || req.headers.get("referer") || "https://noir-mun.com",
        title: "Noir MUN — WILT+ (writer)",
      });
    } catch {
      if (kbFacts.length) {
        answerText = kbFacts.join(" • ");
      } else if (locals.length || searchResults.length) {
        const srcs = (locals.slice(0,2).map(x=>`${x.title||'Local'} — ${x.url||''}`))
          .concat(searchResults.slice(0,3).map(r=>`${r.title} — ${r.url}`))
          .filter(Boolean).join("\n");
        answerText = `${tavilyAnswer ? tavilyAnswer + "\n\n" : ""}Here are relevant sources:\n${srcs}`;
      } else {
        answerText = "Sorry — I couldn’t confidently find a good answer to that.";
      }
    }
  }

  const sources = (searchResults || []).slice(0, 5).map(r => ({ title: r.title, url: r.url }))
    .concat((locals || []).slice(0, 3).map(x => ({ title: x.title || 'Local', url: x.url || '' })));

  return jsonOK({ answer: answerText, sources });
}

/* ===================== utils ===================== */
function derivePublicBase(req) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}
function jsonOK(payload) {
  return new Response(JSON.stringify(payload), {
    headers: { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" },
  });
}
