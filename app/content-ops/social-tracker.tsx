"use client";
/**
 * Content Ops – Posted? Yes/No tracker.
 * ISOLATION: No imports from app/research/steps/.
 */

import type { QueueItem } from "@/lib/utils/content-ops";

export interface SocialTrackerProps {
  items: QueueItem[];
  onMarkPosted?: (index: number, posted: boolean) => void;
}

export default function SocialTracker({ items, onMarkPosted }: SocialTrackerProps) {
  const posted = items.filter((i) => i.posted).length;
  const total = items.length;

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Posted tracker</h2>
        <p className="text-slate-500 text-sm">No items in queue. Add topics to track posted status.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-2">Posted tracker</h2>
      <p className="text-slate-500 text-sm mb-4">
        {posted} / {total} marked as posted
      </p>
      <ul className="space-y-2 max-h-[200px] overflow-y-auto">
        {items.map((item, i) => (
          <li key={i} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded bg-slate-50">
            <span className="text-sm text-slate-800 truncate flex-1 min-w-0">{item.topic}</span>
            {onMarkPosted ? (
              <button
                type="button"
                onClick={() => onMarkPosted(i, !item.posted)}
                className={"text-xs font-medium px-2 py-1 rounded " + (item.posted ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600 hover:bg-green-100")}
              >
                {item.posted ? "Yes" : "No"}
              </button>
            ) : (
              <span className="text-xs text-slate-500">{item.posted ? "Yes" : "No"}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
