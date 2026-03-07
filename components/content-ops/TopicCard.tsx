"use client";
import type { QueueItem } from "@/lib/utils/content-ops";
import { LANGUAGE_LABELS } from "@/lib/utils/content-ops";
import StatusBadge from "./StatusBadge";

export interface TopicCardProps {
  item: QueueItem;
  index: number;
}

export default function TopicCard({ item, index }: TopicCardProps) {
  const langLabel = LANGUAGE_LABELS[item.language] ?? item.language;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className="text-xs text-slate-500">#{index + 1}</span>
          <h3 className="font-medium text-slate-900 truncate mt-0.5">{item.topic}</h3>
          <p className="text-xs text-slate-600 mt-1">{langLabel} · {item.formats}</p>
        </div>
        <StatusBadge status={item.status} posted={item.posted} />
      </div>
    </div>
  );
}
