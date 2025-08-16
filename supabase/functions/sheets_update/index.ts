// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { getSheetsClient } from "../_shared/sheets.ts";
import { requireRole } from "../_shared/auth.ts";

function statusToColor(status: string) {
  if (status === "paid") return { red: 0.1, green: 0.85, blue: 0.1 };
  if (status === "cancelled") return { red: 0.9, green: 0.15, blue: 0.15 };
  // neutral grey for unpaid/unknown
  return { red: 0.85, green: 0.85, blue: 0.85 };
}

serve(async (req) => {
  const user = await requireRole(req, ["admin", "staff"]);
  if (user instanceof Response) return user;

  try {
    const body = await req.json();
    const { rowNumber, values, rangeBase = "Sheet1", status } = body;
    if (!rowNumber) return new Response("rowNumber required", { status: 400 });

    const { sheets, DA_PRIVATE_SHEET_ID } = await getSheetsClient();

    // 1) Map headers → columns
    const meta = await sheets.spreadsheets.values.get({
      spreadsheetId: DA_PRIVATE_SHEET_ID,
      range: `${rangeBase}!1:1`,
    });
    const headers = (meta.data.values?.[0] ?? []) as string[];

    const updates = Object.entries(values || {}).map(([header, val]) => {
      const idx = headers.indexOf(header);
      if (idx < 0) return null;
      const colA1 =
        String.fromCharCode("A".charCodeAt(0) + (idx % 26)) +
        (idx >= 26 ? String.fromCharCode("A".charCodeAt(0) + Math.floor(idx / 26) - 1) : "");
      // NOTE: simple A..Z only; if you may exceed Z, switch to a robust col encoder.
      return { range: `${rangeBase}!${colA1}${rowNumber}`, values: [[val]] };
    }).filter(Boolean) as { range: string; values: any[][] }[];

    if (updates.length) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: DA_PRIVATE_SHEET_ID,
        requestBody: { data: updates, valueInputOption: "USER_ENTERED" },
      });
    }

    // 2) If status supplied, also set Paid cell text + row color
    if (status) {
      const paidIdx = headers.findIndex((h) => h?.toLowerCase().trim() === "paid");
      if (paidIdx >= 0) {
        const colA1 =
          String.fromCharCode("A".charCodeAt(0) + (paidIdx % 26)) +
          (paidIdx >= 26 ? String.fromCharCode("A".charCodeAt(0) + Math.floor(paidIdx / 26) - 1) : "");
        const paidText = status === "paid" ? "PAID" : status === "cancelled" ? "CANCELLED" : "";
        await sheets.spreadsheets.values.update({
          spreadsheetId: DA_PRIVATE_SHEET_ID,
          range: `${rangeBase}!${colA1}${rowNumber}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[paidText]] },
        });
      }

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: DA_PRIVATE_SHEET_ID,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: undefined, // entire row on active sheet
                  startRowIndex: rowNumber - 1,
                  endRowIndex: rowNumber,
                },
                cell: {
                  userEnteredFormat: { backgroundColor: statusToColor(status) },
                },
                fields: "userEnteredFormat.backgroundColor",
              },
            },
          ],
        },
      });
    }

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
