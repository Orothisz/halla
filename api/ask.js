// /api/ask.js
export const config = { runtime: "edge" };

/* ===================== Persona & Noir KB ===================== */
const WILT_NAME = (process.env.WILT_NAME || "WILT+").trim();

const PERSONA = `
You are ${WILT_NAME}, Noir MUN’s assistant.
Speak in concise, confident lines with a lightly Roman cadence.
ALWAYS answer directly first; then, only if useful, offer: "Want the deep cut?"
Never reveal chain-of-thought or internal reasoning.
If venue unknown, say exactly: "Venue is TBA—drop soon."
If asked your name (any phrasing), reply exactly: "${WILT_NAME}".
Prefer Noir KB and local context over the open web.
Be fast, precise, and on-brand. Avoid filler.
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

const cap = (x)=>x.replace(/\b\w/g,m=>m.toUpperCase());
function kbLookup(q) {
  const s = (q || "").toLowerCase();
  const facts = [];
  if (/(date|when|schedule|oct|october)/.test(s)) facts.push(`Dates: ${NOIR_KB.dates}`);
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
  const r = await fetch(full, { cache: "no-store" }).catch(()=>null);
  if (!r || !r.ok) return { embeddings: [], texts: [], meta: [] };
  const j = await r.json().catch(()=>({}));
  SHARD_CACHE.set(full, j);
  return j;
}
function cosine(a, b) {
  let dot=0, na=0, nb=0;
  const len = Math.max(a?.length||0, b?.length||0);
  for (let i=0;i<len;i++){ const x=a[i]||0, y=b[i]||0; dot+=x*y; na+=x*x; nb+=y*y; }
  return dot / (Math.sqrt(na)*Math.sqrt(nb) + 1e-9);
}
async function localSearch({ base, qvec, topK=8 }) {
  if (!qvec || !Array.isArray(qvec)) return [];
  const man = await getManifest(base);
  if (!man) return [];
  const scores = [];
  for (const s of man.shards || []) {
    const shard = await getShard(base, s.url);
    for (let i=0;i<(shard.embeddings||[]).length;i++) {
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
  }).catch(()=>null);
  if (!r || !r.ok) return null;
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
  }).catch(()=>null);
  if (!r || !r.ok) return [];
  const j = await r.json().catch(()=> ({}));
  const out = [];
  for (const it of j.organic || []) {
    if (!it?.link) continue;
    out.push({ title: it.title || it.link, url: it.link, snippet: it.snippet || "" });
    if (out.length >= limit) break;
  }
  return out;
}

/* ===================== DeepSeek (primary LLM) ===================== */
async function callDeepSeek({ messages, temperature=0.35, maxTokens=750 }) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("Missing DEEPSEEK_API_KEY");
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat"; // or "deepseek-reasoner"

  // OpenAI-compatible Chat Completions
  const r = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type":"application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      // safety & brevity nudges
      presence_penalty: 0,
      frequency_penalty: 0,
    })
  }).catch(()=>null);

  if (!r || !r.ok) throw new Error(`DeepSeek ${r?.status||0}: ${r ? await r.text() : "no response"}`);
  const j = await r.json().catch(()=>({}));
  return (j.choices?.[0]?.message?.content || "").trim();
}

/* ===================== Memory: GitHub append JSONL ===================== */
const GH_TOKEN   = process.env.GITHUB_TOKEN || "";
const GH_REPO    = process.env.GITHUB_REPO || ""; // "owner/repo"
const GH_BRANCH  = process.env.GITHUB_BRANCH || "main";
const GH_DIR     = process.env.GITHUB_DIR || "wilt_plus_memory";

function b64e(str){ return btoa(unescape(encodeURIComponent(str))); }
function b64d(str){ return decodeURIComponent(escape(atob(str))); }

async function ghGetFile(path) {
  if (!GH_TOKEN || !GH_REPO) return null;
  const r = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(GH_BRANCH)}`, {
    headers: { Authorization: `Bearer ${GH_TOKEN}`, "Accept": "application/vnd.github+json" }
  }).catch(()=>null);
  if (!r) return null;
  if (r.status === 404) return { sha: null, content: "" };
  if (!r.ok) return null;
  const j = await r.json().catch(()=>null);
  if (!j) return null;
  const content = j.content ? b64d(j.content) : "";
  return { sha: j.sha || null, content };
}

async function ghPutFile(path, rawContent, message, sha=null) {
  if (!GH_TOKEN || !GH_REPO) return false;
  const body = {
    message: message || `wilt+ memory update ${new Date().toISOString()}`,
    content: b64e(rawContent),
    branch: GH_BRANCH,
  };
  if (sha) body.sha = sha;
  const r = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${encodeURIComponent(path)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  }).catch(()=>null);
  return !!(r && r.ok);
}

async function appendMemoryLine({ clientId="anon", line }) {
  if (!line) return;
  const path = `${GH_DIR}/${clientId}/memory.jsonl`;
  const cur = await ghGetFile(path);
  const prev = cur?.content || "";
  const next = prev + (prev && !prev.endsWith("\n") ? "\n" : "") + line + "\n";
  await ghPutFile(path, next, `wilt+ memory append (${clientId})`, cur?.sha || null);
}

async function readRecentMemory({ clientId="anon", maxLines=12 }) {
  const path = `${GH_DIR}/${clientId}/memory.jsonl`;
  const cur = await ghGetFile(path);
  if (!cur) return "";
  const lines = (cur.content || "").trim().split("\n").slice(-maxLines);
  // Keep it compact to avoid token spill
  return lines.join("\n").slice(-8000); // hard cap
}

/* ===================== Writer system prompt ===================== */
const WRITER_SYSTEM = `
${PERSONA}

You have four context sources:
1) "kb" (authoritative Noir facts)
2) "local" (Noir-hosted RAG snippets)
3) "memory" (short JSONL of recent user↔assistant turns)
4) "web" (external search)

Policy:
- Use kb > local > memory > web, in that order of trust.
- Cite web sources only if you used them (2–5 items; Title — URL).
- Keep answers crisp; bullets are welcome.
- Do not hallucinate dates, fees, or venues—prefer kb.
- Never show chain-of-thought. Provide final answers only.

If user intent is small (FAQ), answer in 1–3 lines.
If analytical, you may add a short "Want the deep cut?" offer.
`;

/* ===================== Main Handler ===================== */
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
  const qvec = body?.qvec || null;
  const clientId = String(body?.clientId || "anon");
  let conversationId = String(body?.conversationId || "");
  if (!conversationId) conversationId = `c_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;

  // Hard guarantee: name responses
  if (/\b(what('?| i)s your name|who are you|your name\??|name\?$)/i.test((userText||"").trim())) {
    const answer = WILT_NAME;
    // store memory quickly
    try {
      await appendMemoryLine({
        clientId,
        line: JSON.stringify({ ts: Date.now(), conversationId, user: userText, assistant: answer })
      });
    } catch {}
    return jsonOK({ answer, sources: [], conversationId });
  }

  // 0) Noir KB (instant)
  const kbFacts = kbLookup(userText);
  // If KB hits and no embedding vector, fast-path
  if (kbFacts.length && !qvec) {
    const answer = kbFacts.join(" • ");
    try {
      await appendMemoryLine({
        clientId,
        line: JSON.stringify({ ts: Date.now(), conversationId, user: userText, assistant: answer })
      });
    } catch {}
    return jsonOK({ answer, sources: [], conversationId });
  }

  // 1) Local RAG
  const base = derivePublicBase(req);
  let rag = [];
  try { rag = await localSearch({ base, qvec, topK: 8 }); } catch {}

  // 2) If weak local & KB empty, do web search (Tavily → Serper)
  let searchResults = [];
  let tavilyAnswer = "";
  if ((!rag || rag.length < 2) && kbFacts.length === 0) {
    try {
      const tv = await tavilySearch(userText, 8);
      if (tv) { tavilyAnswer = tv.answer || ""; searchResults = tv.results || []; }
      if (!searchResults.length && process.env.SERPER_API_KEY) {
        searchResults = await serperSearch(userText, 8);
      }
    } catch {}
  }

  // 3) Load recent memory and build context
  let memorySnippet = "";
  try { memorySnippet = await readRecentMemory({ clientId, maxLines: 12 }); } catch {}

  const locals = (rag || []).map(r => ({ text: r.text, title: r.meta?.title, url: r.meta?.url, score: r.score }));
  const context = JSON.stringify({
    kb: kbFacts,
    local: locals,
    memory: memorySnippet,           // JSONL blob
    tavily_answer: tavilyAnswer,
    web: (searchResults || []).slice(0, 6),
  });

  // 4) Compose messages for DeepSeek
  const dsMessages = [
    { role: "system", content: WRITER_SYSTEM },
    { role: "user", content: `User: ${userText}\n\nContext JSON:\n${context}` }
  ];

  // 5) Call DeepSeek primary; if it fails, degrade gracefully with sources
  let answerText = "";
  try {
    answerText = await callDeepSeek({ messages: dsMessages, temperature: 0.35, maxTokens: 750 });
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

  // 6) Sources list for UI
  const sources = (searchResults || []).slice(0, 5).map(r => ({ title: r.title, url: r.url }))
    .concat((locals || []).slice(0, 3).map(x => ({ title: x.title || 'Local', url: x.url || '' })));

  // 7) Append memory (learning)
  try {
    await appendMemoryLine({
      clientId,
      line: JSON.stringify({
        ts: Date.now(),
        conversationId,
        user: userText,
        assistant: answerText
      })
    });
  } catch {}

  return jsonOK({ answer: answerText, sources, conversationId });
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
