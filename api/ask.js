// api/ask.js
export const config = { runtime: "edge" };

// ---- Free stack env: set OPENROUTER_API_KEY in Vercel → Environment Variables
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

async function ddgSearch(q) {
  // DuckDuckGo Instant Answer (free, no key). Good for a first pass + related links.
  const u = "https://api.duckduckgo.com/?q=" + encodeURIComponent(q) + "&format=json&no_html=1&skip_disambig=1";
  const r = await fetch(u, { headers: { "User-Agent": "noir-wilt/1.0" } });
  const j = await r.json().catch(() => ({}));
  // Normalize: gather AbstractURL + RelatedTopics links
  const results = [];
  if (j.AbstractText && j.AbstractURL) {
    results.push({ title: j.Heading || "Result", url: j.AbstractURL, snippet: j.AbstractText });
  }
  if (Array.isArray(j.RelatedTopics)) {
    for (const t of j.RelatedTopics) {
      if (t && t.Text && t.FirstURL) {
        results.push({ title: t.Text.slice(0, 80), url: t.FirstURL, snippet: t.Text });
      } else if (t && Array.isArray(t.Topics)) {
        for (const tt of t.Topics) {
          if (tt && tt.Text && tt.FirstURL) {
            results.push({ title: tt.Text.slice(0, 80), url: tt.FirstURL, snippet: tt.Text });
          }
        }
      }
      if (results.length >= 8) break;
    }
  }
  return results.slice(0, 8);
}

async function readUrl(url) {
  // Jina Reader (free)
  const clean = url.replace(/^https?:\/\//, "");
  const r = await fetch("https://r.jina.ai/http://" + clean, { headers: { "User-Agent": "noir-wilt/1.0" } });
  const txt = await r.text().catch(() => "");
  return txt.slice(0, 15000); // cap tokens
}

function kbLookup(q) {
  const s = q.toLowerCase();
  const facts = [];
  if (/(date|when|schedule|oct)/.test(s)) facts.push(`Dates: ${NOIR_KB.dates}`);
  if (/(fee|price|cost|₹|inr)/.test(s)) facts.push(`Delegate fee: ${NOIR_KB.fee}`);
  if (/(venue|where|location|address)/.test(s)) facts.push(`Venue: ${NOIR_KB.venue}`);
  if (/(register|registration|linktree|apply)/.test(s)) facts.push(`Register: ${NOIR_KB.register}`);
  if (/(whatsapp|exec|contact|email)/.test(s)) facts.push(`WhatsApp Exec: ${NOIR_KB.whatsapp} • Email: ${NOIR_KB.email}`);
  return facts;
}

async function callOpenRouter(model, messages) {
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      // ask for JSON when we need it
    }),
  });
  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  return j.choices?.[0]?.message?.content || "";
}

const PLANNER_PROMPT = `
You are the planner for WILT+. Decide what tools to use to answer the user's question.

Rules:
- If the question is a simple Noir event fact (dates, fee, venue, register, contacts), set "use_kb": true.
- If it needs outside info or verification, set "use_search": true and propose 1-3 concise search queries.
- If there are URLs already provided by the user, set "use_read": true and include those URLs.
- Prefer both search and read when the topic is current, factual, or non-trivial.

Return strictly valid JSON:
{
  "use_kb": boolean,
  "use_search": boolean,
  "queries": string[],
  "use_read": boolean,
  "urls": string[]
}
`;

const WRITER_PROMPT = `
You are WILT+, Noir MUN's flagship assistant.

Given:
- (optional) Noir KB facts
- a set of search results (title, url, snippet)
- a set of page excerpts (url, text)

Write a helpful, concise answer for the user. Use short paragraphs or bullets. Ground your answer in the provided material. Include 2–5 citations at the end as a "Sources:" list (title — url). Do not invent links. If nothing useful was found, say so briefly and suggest a narrower query.
`;

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Use POST", { status: 405 });
  }
  const { messages } = await req.json().catch(() => ({ messages: [] }));
  const userText = messages?.slice(-1)?.[0]?.content || "";

  // Step 0: planner decides what to do
  const plannerJSON = await callOpenRouter(OPENROUTER_MODEL_PLANNER, [
    { role: "system", content: PLANNER_PROMPT },
    { role: "user", content: userText }
  ]);

  let plan;
  try { plan = JSON.parse(plannerJSON); }
  catch { plan = { use_kb: true, use_search: false, queries: [], use_read: false, urls: [] }; }

  // Step 1: KB if relevant
  const kbFacts = plan.use_kb ? kbLookup(userText) : [];

  // Step 2: Search if needed
  let searchResults = [];
  if (plan.use_search) {
    const qs = (plan.queries || []).slice(0, 3);
    for (const q of qs) {
      const res = await ddgSearch(q);
      // merge & de-dup by URL
      for (const item of res) {
        if (item.url && !searchResults.find(x => x.url === item.url)) searchResults.push(item);
      }
      if (searchResults.length >= 10) break;
    }
  }

  // Step 3: Read pages (from plan or top search hits)
  const urlsToRead = (plan.urls || []).concat(
    !plan.use_read && searchResults.length ? [searchResults[0].url] : []
  ).filter(Boolean).slice(0, 3);

  const pageExcerpts = [];
  for (const u of urlsToRead) {
    try {
      const txt = await readUrl(u);
      if (txt?.trim()) pageExcerpts.push({ url: u, text: txt.slice(0, 5000) });
    } catch {}
  }

  // Step 4: Writer composes the answer
  const context = JSON.stringify({
    kb: kbFacts,
    search: searchResults.slice(0, 8),
    pages: pageExcerpts
  });

  const answerText = await callOpenRouter(OPENROUTER_MODEL_WRITER, [
    { role: "system", content: WRITER_PROMPT },
    { role: "user", content: `User question: ${userText}\n\nContext JSON:\n${context}` }
  ]);

  // Simple citation parse: expect "Sources:\n• Title — URL" style. Also pass normalized sources as fallback.
  const fallbackSources = [];
  for (const r of searchResults.slice(0,5)) fallbackSources.push({ title: r.title, url: r.url });

  return new Response(JSON.stringify({
    answer: answerText,
    sources: fallbackSources
  }), { headers: { "Content-Type": "application/json" } });
}
