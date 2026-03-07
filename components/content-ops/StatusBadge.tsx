"use client";
import type { QueueStatus } from "@/lib/utils/content-ops";

export interface StatusBadgeProps {
  status?: QueueStatus;
  posted?: boolean;
}

export default function StatusBadge({ status, posted }: StatusBadgeProps) {
  if (posted) return <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Posted</span>;
  if (status === "done") return <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">Done</span>;
  if (status === "gen") return <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Gen</span>;
  return <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">Wait</span>;
}
