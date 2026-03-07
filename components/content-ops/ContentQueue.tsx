"use client";
/**
 * Content Ops – queue table: # | Topic | Language | Formats | Status + row actions.
 * ISOLATION: No imports from app/research/steps/.
 */

import type { QueueItem, QueueStatus } from "@/lib/utils/content-ops";
import { LANGUAGE_LABELS } from "@/lib/utils/content-ops";

export interface ContentQueueProps {
  items: QueueItem[];
  onRemove?: (index: number) => void;
  onClear?: () => void;
  onStatusChange?: (index: number, status: QueueStatus) => void;
  onMarkPosted?: (index: number, posted: boolean) => void;
  onGenerate?: (index: number, item: QueueItem) => void;
  onPreview?: (index: number, item: QueueItem) => void;
  onEdit?: (index: number, item: QueueItem) => void;
  onExport?: (index: number, item: QueueItem) => void;
}

function statusLabel(status: QueueStatus | undefined, posted: boolean | undefined): string {
  if (posted) return "✅ Posted";
  switch (status) {
    case "done":
      return "✅ Done";
    case "gen":
      return "⏳ Gen";
    default:
      return "⏳ Wait";
  }
}

export default function ContentQueue({
  items,
  onClear,
  onStatusChange,
  onMarkPosted,
  onGenerate,
  onPreview,
  onEdit,
  onExport,
}: ContentQueueProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">📋 Queue</h2>
        <p className="text-slate-500 text-sm">Queue is empty. Upload a CSV or paste a topic list above to add items.</p>
      </div>
    );
  }

  const langLabel = (code: string) => LANGUAGE_LABELS[code] ?? code;

  return (
    <div className="bg-white rounded-xl shadow border border-slate-200 p-6 overflow-x-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-lg font-semibold text-slate-900">📋 Queue ({items.length})</h2>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-slate-600 hover:text-red-600 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 px-2 font-semibold text-slate-700 w-8">#</th>
            <th className="text-left py-2 px-2 font-semibold text-slate-700 min-w-[180px]">Topic</th>
            <th className="text-left py-2 px-2 font-semibold text-slate-700">Language</th>
            <th className="text-left py-2 px-2 font-semibold text-slate-700">Formats</th>
            <th className="text-left py-2 px-2 font-semibold text-slate-700">Status</th>
            <th className="text-left py-2 px-2 font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={`${i}-${item.topic.slice(0, 40)}`} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2 px-2 text-slate-600">{i + 1}</td>
              <td className="py-2 px-2 text-slate-900 max-w-[220px] truncate" title={item.topic}>
                {item.topic}
              </td>
              <td className="py-2 px-2 text-slate-700">{langLabel(item.language)}</td>
              <td className="py-2 px-2 text-slate-700">{item.formats}</td>
              <td className="py-2 px-2">
                <span className="text-slate-700">{statusLabel(item.status, item.posted)}</span>
              </td>
              <td className="py-2 px-2">
                <div className="flex flex-wrap gap-1">
                  {onGenerate && (
                    <button
                      type="button"
                      onClick={() => onGenerate(i, item)}
                      className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                    >
                      Generate
                    </button>
                  )}
                  {onPreview && (
                    <button
                      type="button"
                      onClick={() => onPreview(i, item)}
                      className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      Preview
                    </button>
                  )}
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(i, item)}
                      className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      Edit
                    </button>
                  )}
                  {onExport && (
                    <button
                      type="button"
                      onClick={() => onExport(i, item)}
                      className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      Export
                    </button>
                  )}
                  {onMarkPosted && (
                    <button
                      type="button"
                      onClick={() => onMarkPosted(i, !item.posted)}
                      className={`px-2 py-1 rounded text-xs font-medium ${item.posted ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700 hover:bg-green-100 hover:text-green-800"}`}
                    >
                      {item.posted ? "✅ Posted" : "Mark Posted ✅"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
