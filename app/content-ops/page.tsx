/**
 * Content Ops – Batch Content Manager.
 * ISOLATION: This route NEVER imports from app/research/steps/.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import BatchUploader from "@/components/content-ops/BatchUploader";
import ContentQueue from "@/components/content-ops/ContentQueue";
import type { QueueItem, QueueStatus } from "@/lib/utils/content-ops";

export default function ContentOpsPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const handleAddToQueue = (items: QueueItem[]) => {
    setQueue((prev) => [...prev, ...items]);
  };

  const handleClear = () => setQueue([]);

  const handleStatusChange = (index: number, status: QueueStatus) => {
    setQueue((prev) =>
      prev.map((item, i) => (i === index ? { ...item, status } : item))
    );
  };

  const handleMarkPosted = (index: number, posted: boolean) => {
    setQueue((prev) =>
      prev.map((item, i) => (i === index ? { ...item, posted } : item))
    );
  };

  const handleGenerate = (index: number, item: QueueItem) => {
    handleStatusChange(index, "gen");
    const params = new URLSearchParams({ topic: item.topic, language: item.language });
    window.open(`/step12?${params.toString()}`, "_blank");
    // Caller can later set to 'done' when generation completes (e.g. from Step 12 callback)
    setTimeout(() => handleStatusChange(index, "done"), 500);
  };

  const handlePreview = (_index: number, item: QueueItem) => {
    window.alert(`Preview: ${item.topic}\nLanguage: ${item.language}\nFormats: ${item.formats}`);
  };

  const handleEdit = (index: number, item: QueueItem) => {
    const topic = window.prompt("Edit topic", item.topic);
    if (topic != null && topic.trim()) {
      setQueue((prev) =>
        prev.map((q, i) => (i === index ? { ...q, topic: topic.trim() } : q))
      );
    }
  };

  const handleExport = (_index: number, item: QueueItem) => {
    const blob = new Blob(
      [["Topic", "Language", "Audience", "Formats", "Scheduled Date", "Status"].join(",") + "\n" +
       [item.topic, item.language, item.audience, item.formats, item.scheduledDate, item.status ?? "wait"].join(",") + "\n"],
      { type: "text/csv;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-ops-${item.topic.slice(0, 30).replace(/[^\w-]/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Content Ops</h1>
            <p className="text-slate-600 text-sm">Batch content: upload CSV or paste topic list → queue → Generate / Preview / Edit / Export / Mark Posted.</p>
          </div>
          <Link
            href="/step12"
            className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
          >
            Step 12: Content Generator →
          </Link>
        </div>

        <BatchUploader onAddToQueue={handleAddToQueue} />
        <ContentQueue
          items={queue}
          onClear={handleClear}
          onStatusChange={handleStatusChange}
          onMarkPosted={handleMarkPosted}
          onGenerate={handleGenerate}
          onPreview={handlePreview}
          onEdit={handleEdit}
          onExport={handleExport}
        />
      </div>
    </div>
  );
}
