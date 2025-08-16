// deno-lint-ignore-file no-explicit-any
import { GoogleAuth } from "npm:google-auth-library@9.14.1";
import { google } from "npm:googleapis@140.0.1";

export async function getSheetsClient() {
  const saJson = Deno.env.get("GCP_SHEETS_SA");
  if (!saJson) throw new Error("Missing GCP_SHEETS_SA secret");
  const creds = JSON.parse(saJson);

  const auth = new GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const DA_PRIVATE_SHEET_ID = Deno.env.get("DA_PRIVATE_SHEET_ID");
  const DELCOUNT_SHEET_ID = Deno.env.get("DELCOUNT_SHEET_ID");
  if (!DA_PRIVATE_SHEET_ID || !DELCOUNT_SHEET_ID) {
    throw new Error("Missing sheet IDs (DA_PRIVATE_SHEET_ID / DELCOUNT_SHEET_ID)");
  }

  return { sheets, DA_PRIVATE_SHEET_ID, DELCOUNT_SHEET_ID };
}

/** basic color → status mapping (tolerant to shades) */
export function mapColorToStatus(bg?: { red?: number; green?: number; blue?: number }) {
  const r = bg?.red ?? 1, g = bg?.green ?? 1;
  if (g > 0.7 && r < 0.3) return "paid";
  if (r > 0.7 && g < 0.3) return "cancelled";
  return "unknown";
}
