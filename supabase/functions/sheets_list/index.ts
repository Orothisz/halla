// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { getSheetsClient, mapColorToStatus } from "../_shared/sheets.ts";
import { requireRole } from "../_shared/auth.ts";

/** Range defaults to first 26 cols; you can widen to AA:ZZ if needed */
const DEFAULT_RANGE = "Sheet1!A1:Z2000"; // rename to your exact tab if different (e.g., 'Allotted!A1:Z2000')

serve(async (req) => {
  const user = await requireRole(req, ["admin", "staff", "viewer"]);
  if (user instanceof Response) return user;

  try {
    const { sheets, DA_PRIVATE_SHEET_ID } = await getSheetsClient();
    const url = new URL(req.url);
    const range = url.searchParams.get("range") || DEFAULT_RANGE;

    const resp = await sheets.spreadsheets.get({
      spreadsheetId: DA_PRIVATE_SHEET_ID,
      ranges: [range],
      includeGridData: true,
      fields:
        "sheets(data(rowData(values(formattedValue,effectiveValue,effectiveFormat.backgroundColor))))",
    });

    const grid = resp.data.sheets?.[0]?.data?.[0]?.rowData ?? [];
    if (grid.length === 0) {
      return new Response(JSON.stringify({ headers: [], rows: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // headers
    const headerVals = (grid[0].values ?? []).map((v: any) =>
      v?.formattedValue ?? v?.effectiveValue?.stringValue ?? ""
    );

    // rows
    const rows = grid.slice(1).map((r: any, idx: number) => {
      const cells = r.values ?? [];
      const obj: Record<string, any> = { _rowNumber: idx + 2 };
      headerVals.forEach((h, i) => {
        obj[h || `Col${i + 1}`] =
          cells[i]?.formattedValue ??
          cells[i]?.effectiveValue?.stringValue ??
          cells[i]?.effectiveValue?.numberValue ??
          cells[i]?.effectiveValue?.boolValue ??
          "";
      });

      // Determine status:
      // 1) from Paid column text if present
      const paidColIndex = headerVals.findIndex(
        (h) => h?.toLowerCase().trim() === "paid",
      );
      const paidText = paidColIndex >= 0
        ? (cells[paidColIndex]?.formattedValue ?? "").toString().toUpperCase()
        : "";

      let status: "paid" | "unpaid" | "cancelled" | "unknown" = "unknown";
      if (paidText === "PAID") status = "paid";
      else if (paidText === "CANCELLED") status = "cancelled";
      else if (paidText === "") status = "unpaid";

      // 2) fallback to row color if ambiguous
      if (status === "unknown") {
        const rowCellBg = cells[0]?.effectiveFormat?.backgroundColor;
        status = mapColorToStatus(rowCellBg) as any;
        if (status === "unknown" && paidText === "") status = "unpaid";
      }

      obj._status = status;
      return obj;
    });

    return new Response(JSON.stringify({ headers: headerVals, rows }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
