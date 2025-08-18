export const config = { runtime: 'edge' };

/**
 * Env you must set in Vercel (Server-side, NOT VITE_):
 * - DAPRIVATE_API_URL = https://script.google.com/macros/s/XXXX/exec
 */
const TARGET = process.env.DAPRIVATE_API_URL;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-noir-debug',
};

export default async function handler(req) {
  if (!TARGET) return resp(500, { ok: false, error: 'DAPRIVATE_API_URL missing' });

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  const url = new URL(req.url);
  // forward query params to GAS
  const upstream = TARGET + (TARGET.includes('?') ? '&' : '?') + url.searchParams.toString();

  // GET = read rows | POST = update row
  if (req.method !== 'GET' && req.method !== 'POST') {
    return resp(405, { ok: false, error: 'Method not allowed' });
  }

  try {
    const opt = {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method === 'POST' ? await req.text() : undefined,
      // Edge fetch is already HTTP/2; no keep-alive needed
    };

    const r = await fetch(upstream, opt);
    const txt = await r.text();
    // try to pass through JSON; if not JSON, wrap as text
    const isJson = looksJson(txt);

    const headers = {
      ...CORS,
      'Cache-Control': req.method === 'GET' ? 'public, max-age=15, stale-while-revalidate=45' : 'no-store',
      'Content-Type': isJson ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    };
    // pass through ETag if GAS provided one
    const etag = r.headers.get('ETag'); if (etag) headers.ETag = etag;

    return new Response(isJson ? txt : JSON.stringify({ ok: r.ok, status: r.status, body: txt }), {
      status: r.status,
      headers
    });
  } catch (e) {
    return resp(502, { ok: false, error: 'Upstream failed' });
  }
}

function looksJson(s) {
  const t = (s || '').trim();
  if (!t) return false;
  if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) return true;
  try { JSON.parse(t); return true; } catch { return false; }
}

function resp(status, json) {
  return new Response(JSON.stringify(json), { status, headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' } });
}
