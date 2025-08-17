import type { VercelRequest, VercelResponse } from '@vercel/node';

const TARGET = process.env.DELCOUNT_TARGET;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!TARGET) {
    res.status(500).json({ ok: false, error: 'DELCOUNT_TARGET env missing' });
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 20000);

  try {
    const upstream = await fetch(`${TARGET}?t=${Date.now()}`, { signal: ac.signal, cache: 'no-store' });
    const text = await upstream.text();
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
