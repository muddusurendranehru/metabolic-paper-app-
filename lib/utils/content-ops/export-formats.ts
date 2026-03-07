/**
 * Content Ops – CSV, JSON, Markdown export formatters.
 * ISOLATION: No imports from app/research/steps/.
 */

import type { TrackerRow } from "./google-sheet-sync";
import { formatTrackerRows } from "./google-sheet-sync";
import type { QueueItem } from "./parse-batch";

export function queueToTrackerRows(items: QueueItem[]): TrackerRow[] {
  return items.map((q) => ({
    topic: q.topic,
    language: q.language,
    audience: q.audience,
    formats: q.formats,
    scheduledDate: q.scheduledDate,
    status: q.status,
    posted: q.posted,
  }));
}

/** Format queue as CSV string. */
export function toCsv(items: QueueItem[]): string {
  const rows = formatTrackerRows(queueToTrackerRows(items));
  return rows.map((row) => row.map((c) => (c.includes(",") ? `"${c}"` : c)).join(",")).join("\n");
}

/** Format queue as JSON string. */
export function toJson(items: QueueItem[]): string {
  return JSON.stringify({ exportedAt: new Date().toISOString(), rows: queueToTrackerRows(items) }, null, 2);
}

/** Format queue as Markdown table. */
export function toMarkdown(items: QueueItem[]): string {
  const rows = formatTrackerRows(queueToTrackerRows(items));
  if (rows.length === 0) return "";
  const [header, ...body] = rows;
  const sep = header.map(() => "---");
  const lines = [header.join(" | "), sep.join(" | "), ...body.map((r) => r.join(" | "))];
  return lines.join("\n");
}
