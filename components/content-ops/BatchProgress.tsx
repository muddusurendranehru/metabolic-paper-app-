"use client";
/**
 * Content Ops – batch progress (e.g. 5/30 done).
 * ISOLATION: No imports from app/research/steps/.
 */

import type { QueueItem } from "@/lib/utils/content-ops";

export interface BatchProgressProps {
  items: QueueItem[];
}

export default function BatchProgress({ items }: BatchProgressProps) {
  const total = items.length;
  const done = items.filter((i) => i.status === "done").length;
  const posted = items.filter((i) => i.posted).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  if (total === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">No items in batch.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between text-sm text-slate-700 mb-2">
        <span>Progress</span>
        <span>{done} / {total} done · {posted} posted</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
