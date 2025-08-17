// Proxy to Apps Script (DelCount)
export const config = { runtime: 'nodejs' };

function allowCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const TARGET = process.env.DELCOUNT_TARGET; // https://script.google.com/macros/s/.../exec
  if (!TARGET) return res.status(500).json({ ok: false, error: 'DELCOUNT_TARGET env missing' });

  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), 20000);

  try {
    const upstream = await fetch(`${TARGET}?t=${Date.now()}`, { cache: 'no-store', signal: ac.signal });
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
