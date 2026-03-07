/**
 * Content Ops – Google Sheets sync (append rows, update status).
 * ISOLATION: No imports from app/research/steps/.
 * Uses Google Sheets API v4 (free tier). Fallback: local JSON if API fails.
 * Call from server (API route) with access token; client can use fallback.
 */

export interface TrackerRow {
  topic: string;
  language: string;
  audience: string;
  formats: string;
  scheduledDate: string;
  status?: string;
  posted?: boolean;
}

export interface SyncResult {
  success: boolean;
  /** True when Sheets API failed and caller should persist locally. */
  fallback?: boolean;
  /** When fallback: use this to save to local JSON. */
  localData?: TrackerRow[];
  error?: string;
}

const SHEETS_APPEND_URL = (sheetId: string, range: string) =>
  `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;

/** Header row for the tracker sheet. */
export const TRACKER_HEADERS = ["#", "Topic", "Language", "Audience", "Formats", "Scheduled Date", "Status", "Posted"] as const;

/** Turn TrackerRow[] into sheet rows (header + data). */
export function formatTrackerRows(data: TrackerRow[]): string[][] {
  const header = [...TRACKER_HEADERS];
  const rows = data.map((row, i) => [
    String(i + 1),
    row.topic,
    row.language,
    row.audience,
    row.formats,
    row.scheduledDate,
    row.status ?? "wait",
    row.posted ? "Yes" : "No",
  ]);
  return [header, ...rows];
}

/**
 * Sync tracker data to a Google Sheet (append rows).
 * Use from server (e.g. API route) with accessToken from env or service account.
 * If no token or API fails, returns fallback with localData so caller can save to local JSON.
 */
export async function syncToGoogleSheet(
  data: TrackerRow[],
  sheetId: string,
  options?: { accessToken?: string; range?: string }
): Promise<SyncResult> {
  const token = options?.accessToken ?? (typeof process !== "undefined" ? process.env.GOOGLE_ACCESS_TOKEN : undefined);
  const range = options?.range ?? "Sheet1";

  if (!data.length) {
    return { success: true };
  }

  const rows = formatTrackerRows(data);

  if (!token) {
    return {
      success: false,
      fallback: true,
      localData: data,
      error: "No Google access token; use fallback (local JSON).",
    };
  }

  try {
    const rangeA1 = range.includes("!") ? range : `${range}!A1`;
    const res = await fetch(SHEETS_APPEND_URL(sheetId, rangeA1), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: rows }),
    });

    if (!res.ok) {
      const err = await res.text();
      return {
        success: false,
        fallback: true,
        localData: data,
        error: `Sheets API ${res.status}: ${err}`,
      };
    }

    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return {
      success: false,
      fallback: true,
      localData: data,
      error: message,
    };
  }
}

/** Build a minimal JSON for local fallback (save to file or localStorage). */
export function toLocalFallbackJson(data: TrackerRow[]): string {
  return JSON.stringify({ syncedAt: new Date().toISOString(), rows: data }, null, 2);
}
