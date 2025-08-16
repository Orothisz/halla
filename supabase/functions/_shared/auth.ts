import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getSupabase(req: Request) {
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  return createClient(url, anon, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
}

/** Allow only certain roles from user_metadata.role */
export async function requireRole(req: Request, roles: string[]) {
  const supabase = getSupabase(req);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return new Response("Unauthorized", { status: 401 });
  const role = (data.user.user_metadata as any)?.role ?? "user";
  if (!roles.includes(role)) return new Response("Forbidden", { status: 403 });
  return data.user;
}
