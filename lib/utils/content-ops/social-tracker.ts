/**
 * Content Ops – track posted status (logic only).
 * ISOLATION: No imports from app/research/steps/.
 */

import type { QueueItem } from "./parse-batch";

export interface PostedSummary {
  total: number;
  posted: number;
  notPosted: number;
}

export function getPostedSummary(items: QueueItem[]): PostedSummary {
  const total = items.length;
  const posted = items.filter((i) => i.posted).length;
  return { total, posted, notPosted: total - posted };
}

export function getUnpostedItems(items: QueueItem[]): QueueItem[] {
  return items.filter((i) => !i.posted);
}
