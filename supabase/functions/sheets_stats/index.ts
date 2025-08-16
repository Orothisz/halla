// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { getSheetsClient } from "../_shared/sheets.ts";
import { requireRole } from "../_shared/auth.ts";

/** expects DelCount layout like your screenshot (rows 2–7 and 10–13 meaningful) */
const DEFAULT_RANGE = "Del count!A1:H20"; // if you renamed tab, update here

serve(async (req) => {
  const user = await requireRole(req, ["admin", "staff", "viewer"]);
  if (user instanceof Response) return user;

  try {
    const { sheets, DELCOUNT_SHEET_ID } = await getSheetsClient();
    const url = new URL(req.url);
    const range = url.searchParams.get("range") || DEFAULT_RANGE;

    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: DELCOUNT_SHEET_ID,
      range,
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    const values = resp.data.values ?? [];
    // Find rows by label in col A
    const asMap = new Map<string, string[]>();
    for (const row of values) {
      const label = (row?.[0] ?? "").toString().trim().toUpperCase();
      if (label) asMap.set(label, row as string[]);
    }

    const total = Number(asMap.get("TOTAL DELEGATES")?.[2] ?? 0);
    const paid = Number(asMap.get("PAID")?.[2] ?? 0);
    const unpaid = Number(asMap.get("UNPAID")?.[2] ?? 0);

    // Committee table starts at row with "COMMITTEE" then TOTAL/PAID/UNPAID
    const headerRow = values.findIndex((r) =>
      (r?.[0] ?? "").toString().trim().toUpperCase() === "COMMITTEE"
    );
    let byCommittee: Record<string, { total: number; paid: number; unpaid: number }> = {};
    if (headerRow >= 0) {
      const committees = (values[headerRow] ?? []).slice(1); // B..G headers
      const totals = (values[headerRow + 1] ?? []).slice(1);
      const paids  = (values[headerRow + 2] ?? []).slice(1);
      const unpaids = (values[headerRow + 3] ?? []).slice(1);
      committees.forEach((name: any, i: number) => {
        const key = (name ?? "").toString().trim();
        if (!key) return;
        byCommittee[key] = {
          total: Number(totals[i] ?? 0),
          paid: Number(paids[i] ?? 0),
          unpaid: Number(unpaids[i] ?? 0),
        };
      });
    }

    return new Response(JSON.stringify({ total, paid, unpaid, byCommittee }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
