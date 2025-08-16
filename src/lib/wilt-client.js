// /src/lib/wilt-client.js
import { embedText } from './embed-browser';

export async function askWilt(messages) {
  const last = messages[messages.length - 1]?.content || '';
  let qvec = null;
  try { qvec = await embedText(last); } catch {}
  const r = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, qvec }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
