export const config = { runtime: 'edge' };

/**
 * Env you must set in Vercel (Server-side, NOT VITE_):
 * - DELCOUNT_JSON_URL = https://script.google.com/macros/s/YYYY/exec
 */
const TARGET = process.env.DELCOUNT_JSON_URL;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-noir-debug',
};

export default async function handler(req) {
  if (!TARGET) return resp(500, { ok: false, error: 'DELCOUNT_JSON_URL missing' });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'GET') return resp(405, { ok: false, error: 'Method not allowed' });

  try {
    const url = new URL(req.url);
    const upstream = TARGET + (TARGET.includes('?') ? '&' : '?') + url.searchParams.toString();
    const r = await fetch(upstream, { method: 'GET' });
    const txt = await r.text();
    const isJson = looksJson(txt);

    const headers = {
      ...CORS,
      'Cache-Control': 'public, max-age=20, stale-while-revalidate=60',
      'Content-Type': isJson ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    };
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
