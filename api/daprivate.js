// Proxy to Apps Script (DAPrivate)
// NOTE: Vercel accepts only "nodejs" here (or omit entirely).
export const config = { runtime: 'nodejs' };

function allowCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body; // already parsed
  return new Promise((resolve) => {
    let buf = '';
    req.on('data', (c) => (buf += c));
    req.on('end', () => {
      try { resolve(buf ? JSON.parse(buf) : {}); } catch { resolve({}); }
    });
  });
}

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const TARGET = process.env.DAPRIVATE_TARGET; // https://script.google.com/macros/s/.../exec
  if (!TARGET) return res.status(500).json({ ok: false, error: 'DAPRIVATE_TARGET env missing' });

  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), 20000);

  try {
    const url = `${TARGET}?t=${Date.now()}`;
    let upstream;

    if (req.method === 'POST') {
      const body = await readBody(req);
      upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
        signal: ac.signal,
      });
    } else {
      upstream = await fetch(url, { cache: 'no-store', signal: ac.signal });
    }

    const text = await upstream.text();
    try {
      const json = JSON.parse(text);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(upstream.status).json(json);
    } catch {
      return res.status(502).json({ ok: false, error: 'Upstream not JSON', raw: text.slice(0, 500) });
    }
  } catch (e) {
    const aborted = e && e.name === 'AbortError';
    return res.status(502).json({ ok: false, error: aborted ? 'Upstream timeout' : String(e) });
  } finally {
    clearTimeout(timeout);
  }
}
