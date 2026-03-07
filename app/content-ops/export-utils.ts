/**
 * Content Ops – CSV/JSON export helpers (client-safe).
 * ISOLATION: No imports from app/research/steps/.
 */

import type { QueueItem } from "@/lib/utils/content-ops";
import { toCsv, toJson } from "@/lib/utils/content-ops";

/** Export queue as CSV string. */
export function exportQueueAsCsv(items: QueueItem[]): string {
  return toCsv(items);
}

/** Export queue as JSON string. */
export function exportQueueAsJson(items: QueueItem[]): string {
  return toJson(items);
}

/** Trigger browser download of CSV. */
export function downloadCsv(items: QueueItem[], filename = "content-ops-queue.csv"): void {
  const csv = exportQueueAsCsv(items);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Trigger browser download of JSON. */
export function downloadJson(items: QueueItem[], filename = "content-ops-queue.json"): void {
  const json = exportQueueAsJson(items);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
