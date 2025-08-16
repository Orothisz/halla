// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { getSheetsClient } from "../_shared/sheets.ts";
import { requireRole } from "../_shared/auth.ts";

serve(async (req) => {
  const user = await requireRole(req, ["admin", "staff"]);
  if (user instanceof Response) return user;

  try {
    const { values, rangeBase = "Sheet1" } = await req.json();
    if (!values) return new Response("values required", { status: 400 });

    const { sheets, DA_PRIVATE_SHEET_ID } = await getSheetsClient();
    const meta = await sheets.spreadsheets.values.get({
      spreadsheetId: DA_PRIVATE_SHEET_ID,
      range: `${rangeBase}!1:1`,
    });
    const headers = (meta.data.values?.[0] ?? []) as string[];
    const row = headers.map((h) => (values?.[h] ?? ""));

    await sheets.spreadsheets.values.append({
      spreadsheetId: DA_PRIVATE_SHEET_ID,
      range: `${rangeBase}!A:A`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
