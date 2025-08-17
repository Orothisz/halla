import type { VercelRequest, VercelResponse } from '@vercel/node';

const TARGET = process.env.DAPRIVATE_TARGET; // Apps Script URL

// Small helper to read raw JSON body safely
async function readBody(req: VercelRequest) {
  if (req.body && Object.keys(req.body).length) return req.body; // already parsed
  return new Promise<any>((resolve) => {
    let buf = '';
    req.on('data', (c) => (buf += c));
    req.on('end', () => {
      try { resolve(buf ? JSON.parse(buf) : {}); } catch { resolve({}); }
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!TARGET) {
    res.status(500).json({ ok: false, error: 'DAPRIVATE_TARGET env missing' });
    return;
  }

  // CORS (harmless even on same origin)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 20000); // 20s — Apps Script can be slow

  try {
    const url = `${TARGET}?t=${Date.now()}`;
    let upstream: Response;

    if (req.method === 'POST') {
      const body = await readBody(req); // <-- ensure we forward your JSON payload
      upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ac.signal,
        cache: 'no-store',
      });
    } else {
      upstream = await fetch(url, { signal: ac.signal, cache: 'no-store' });
    }

    const text = await upstream.text();
    // Try to parse JSON; if not JSON, still return the text for debugging
    try {
      const json = JSON.parse(text);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(upstream.status).json(json);
    } catch {
      return res.status(502).json({ ok: false, error: 'Upstream not JSON', raw: text.slice(0, 500) });
    }
  } catch (e: any) {
    const aborted = e?.name === 'AbortError';
    return res.status(502).json({ ok: false, error: aborted ? 'Upstream timeout' : String(e) });
  } finally {
    clearTimeout(t);
  }
}
