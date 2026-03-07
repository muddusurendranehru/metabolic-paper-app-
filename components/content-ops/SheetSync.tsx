"use client";
/**
 * Content Ops – sync to Google Sheet (button + status).
 * ISOLATION: No imports from app/research/steps/.
 */

import { useState } from "react";
import type { QueueItem } from "@/lib/utils/content-ops";

export interface SheetSyncProps {
  items: QueueItem[];
  sheetId?: string;
  onSync?: (items: QueueItem[], sheetId: string) => Promise<{ success: boolean; error?: string }>;
}

export default function SheetSync({ items, sheetId, onSync }: SheetSyncProps) {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const id = sheetId ?? (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID : undefined);

  const handleSync = async () => {
    if (!id) {
      setMessage({ type: "err", text: "No sheet ID. Set NEXT_PUBLIC_GOOGLE_SHEET_ID or pass sheetId." });
      return;
    }
    if (items.length === 0) {
      setMessage({ type: "err", text: "No items to sync." });
      return;
    }
    if (!onSync) {
      setMessage({ type: "err", text: "Sync not configured. Use an API route that calls syncToGoogleSheet." });
      return;
    }
    setSyncing(true);
    setMessage(null);
    try {
      const res = await onSync(items, id);
      if (res.success) setMessage({ type: "ok", text: "Synced to Google Sheet." });
      else setMessage({ type: "err", text: res.error ?? "Sync failed." });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Sync failed." });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-2">Google Sheet</h3>
      <button
        type="button"
        onClick={() => void handleSync()}
        disabled={syncing || items.length === 0}
        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 disabled:opacity-50"
      >
        {syncing ? "Syncing…" : "Sync to Sheet"}
      </button>
      {message && (
        <p className={"mt-2 text-sm " + (message.type === "ok" ? "text-green-600" : "text-red-600")}>
          {message.text}
        </p>
      )}
    </div>
  );
}
