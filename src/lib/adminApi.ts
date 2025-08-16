export const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;

function authHeaders(session?: any) {
  return { Authorization: `Bearer ${session?.access_token ?? ""}` };
}

export async function listDelegates(session, range?: string) {
  const url = new URL(`${FUNCTIONS_BASE}/sheets_list`);
  if (range) url.searchParams.set("range", range);
  const r = await fetch(url, { headers: authHeaders(session) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function stats(session, range?: string) {
  const url = new URL(`${FUNCTIONS_BASE}/sheets_stats`);
  if (range) url.searchParams.set("range", range);
  const r = await fetch(url, { headers: authHeaders(session) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateDelegate(session, payload) {
  const r = await fetch(`${FUNCTIONS_BASE}/sheets_update`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(session) },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function appendDelegate(session, payload) {
  const r = await fetch(`${FUNCTIONS_BASE}/sheets_append`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(session) },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
