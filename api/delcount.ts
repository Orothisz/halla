// /api/delcount.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const TARGET = process.env.DELCOUNT_TARGET; // e.g. https://script.google.com/macros/s/AKfycb.../exec

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!TARGET) {
    return res.status(500).json({ ok: false, error: 'DELCOUNT_TARGET env missing' });
  }
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  try {
    const upstream = await fetch(`${TARGET}?t=${Date.now()}`, { cache: 'no-store' });
    const data = await upstream.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(upstream.status).json(data);
  } catch (e: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(502).json({ ok: false, error: String(e) });
  }
}
