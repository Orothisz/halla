export const config = { runtime: "edge" };

/* ========== Personality & KB ========== */
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

/* ========== Gemini primary, fallbacks kept ========== */
async function callGemini({ prompt, system, temperature = 0.4 }) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("Missing GOOGLE_API_KEY");
  const model = "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const full = system ? `${system}\n\nUser:\n${prompt}` : prompt;
  const body = { contents: [{ role: "user", parts: [{ text: full }] }], generationConfig: { temperature, maxOutputTokens: 700, topP: 0.9 } };
  const r = await fetch(url, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${await r.text()}`);
  const j = await r.json();
  const parts = j?.candidates?.[0]?.content?.parts || [];
  return parts.map(p=>p.text||"").join("").trim();
}

const OR_PLANNER   = "google/gemma-2-9b-it:free";
const OR_WRITER    = "google/gemma-2-9b-it:free";
const GROQ_PLANNER = "llama-3.1-8b-instant";
const GROQ_WRITER  = "llama-3.1-8b-instant";

async function callOpenRouter({ model, messages, temperature = 0.2, referer, title }) {
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
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
    headers: { "Content-Type":"application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
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
    try { return await callOpenRouter({ model: orModel, messages, temperature, referer, title }); } catch {}
  }
  if (process.env.GROQ_API_KEY) {
    return await callGroq({ model: gqModel, messages, temperature });
  }
  throw new Error("No LLM fallback provider configured");
}

/* ========== Tavily search (fallback) ========== */
async function tavilySearch(query, maxResults = 8) {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw new Error("Missing TAVILY_API_KEY");
  const r = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: key, query, include_answer: true, max_results: Math.min(maxResults, 10), search_depth: "basic" }),
  });
  if (!r.ok) throw new Error("Tavily error: " + r.status);
  const j = await r.json();
  const results = (j?.results || []).map(x => ({ title: x.title || x.url, url: x.url, snippet: x.content || "" }));
  return { answer: j?.answer || "", results };
}

/* ========== Reader (Jina) ========== */
async function readUrl(url) {
  try {
    const clean = url.replace(/^https?:\/\//, "");
    const r = await fetch("https://r.jina.ai/http://" + clean, { headers: { "User-Agent": "noir-wilt/1.0" } });
    const txt = await r.text();
    return txt ? txt.slice(0, 15000) : "";
  } catch { return ""; }
}

/* ========== Local RAG index loader (static from /public) ========== */
let MANIFEST_CACHE = null;
let SHARD_CACHE = new Map();

async function getManifest(originBase) {
  if (MANIFEST_CACHE) return MANIFEST_CACHE;
  const url = `${originBase}/wilt_index/manifest.json`;
  const r = await fetch(url, { cache: 'no-store' }).catch(()=>null);
  if (!r || !r.ok) return null;
  MANIFEST_CACHE = await r.json();
  return MANIFEST_CACHE;
}

async function getShard(originBase, shardUrl) {
  const full = `${originBase}${shardUrl}`;
  if (SHARD_CACHE.has(full)) return SHARD_CACHE.get(full);
  const r = await fetch(full, { cache: 'no-store' });
  const j = await r.json();
  SHARD_CACHE.set(full, j);
  return j;
}

function cosine(a, b) {
  let dot=0, na=0, nb=0;
  for (let i=0;i<a.length;i++){ dot+=a[i]*b[i]; na+=a[i]*a[i]; nb+=b[i]*b[i]; }
  return dot / (Math.sqrt(na)*Math.sqrt(nb) + 1e-9);
}

async function localSearch({ originBase, qvec, topK = 8 }) {
  if (!qvec || !Array.isArray(qvec)) return [];
  const man = await getManifest(originBase);
  if (!man) return [];
  const scores = [];

  // simple pass over shards (small/medium index). If it grows huge, add shard headers w/ centroids.
  for (const s of man.shards) {
    const shard = await getShard(originBase, s.url);
    for (let i=0;i<shard.embeddings.length;i++) {
      const sc = cosine(qvec, shard.embeddings[i]);
      scores.push({ score: sc, text: shard.texts[i], meta: shard.meta[i] });
    }
  }
  scores.sort((a,b)=>b.score-a.score);
  return scores.slice(0, topK);
}

/* ========== Prompts ========== */
const WRITER_SYSTEM = `
${PERSONA}
When using local context, prefer it over the open web.
If you used web results, end with:
Sources:
- Title — URL
(2–5 items)
`;

/* ========== Main handler ========== */
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

  // 0) Instant KB
  const kbFacts = kbLookup(userText);
  if (kbFacts.length && !qvec) {
    return jsonOK({ answer: kbFacts.join(" • "), sources: [] });
  }

  // Base URL for static manifest (supports local dev + prod)
  const originBase = derivePublicBase(req);

  // 1) Local RAG
  let rag = [];
  try { rag = await localSearch({ originBase, qvec, topK: 8 }); } catch {}

  // 2) If nothing local & not KB-heavy, try Tavily
  let searchResults = [];
  let tavilyAnswer = "";
  if ((!rag || rag.length < 2) && kbFacts.length === 0) {
    try {
      const { answer, results } = await tavilySearch(userText, 8);
      tavilyAnswer = answer || "";
      searchResults = results;
    } catch {}
  }

  // Prepare context
  const topLocals = (rag || []).map(r => ({ text: r.text, title: r.meta?.title, url: r.meta?.url, score: r.score }));
  const context = JSON.stringify({
    kb: kbFacts,
    local: topLocals,
    tavily_answer: tavilyAnswer,
    web: searchResults.slice(0, 6),
  });

  // 3) Compose with Gemini → fallbacks
  let answerText = "";
  try {
    answerText = await callGemini({
      system: WRITER_SYSTEM,
      prompt: `User: ${userText}\n\nContext JSON:\n${context}`,
      temperature: 0.4,
    });
  } catch {
    try {
      answerText = await callLLMFallback({
        prefer: "writer",
        messages: [
          { role: "system", content: WRITER_SYSTEM },
          { role: "user", content: `User: ${userText}\n\nContext JSON:\n${context}` },
        ],
        temperature: 0.4,
      });
    } catch {
      if (kbFacts.length) {
        answerText = kbFacts.join(" • ");
      } else if (topLocals.length || searchResults.length) {
        const srcs = (topLocals.slice(0,2).map(x=>`${x.title||'Local'} — ${x.url||''}`))
          .concat(searchResults.slice(0,3).map(r=>`${r.title} — ${r.url}`))
          .filter(Boolean).join("\n");
        answerText = `${tavilyAnswer ? tavilyAnswer + "\n\n" : ""}Here are relevant sources:\n${srcs}`;
      } else {
        answerText = "Sorry — I couldn’t confidently find a good answer to that.";
      }
    }
  }

  const sources = (searchResults || []).slice(0, 5).map(r => ({ title: r.title, url: r.url }))
    .concat((topLocals || []).slice(0, 3).map(x => ({ title: x.title || 'Local', url: x.url || '' })));

  return jsonOK({ answer: answerText, sources });
}

/* ========== utils ========== */
function derivePublicBase(req) {
  const origin = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = (req.headers.get('x-forwarded-proto') || 'https');
  return `${proto}://${origin}`;
}
function jsonOK(payload) {
  return new Response(JSON.stringify(payload), { headers: { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" }});
}
