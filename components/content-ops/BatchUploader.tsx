"use client";
/**
 * Content Ops – CSV upload + paste topic list → Parse → Preview → Add to queue.
 * ISOLATION: No imports from app/research/steps/.
 */

import { useState, useRef } from "react";
import {
  parseBatchUpload,
  CSV_TEMPLATE,
  type QueueItem,
} from "@/lib/utils/content-ops";
import { LANGUAGE_LABELS } from "@/lib/utils/content-ops";

export interface BatchUploaderProps {
  onAddToQueue: (items: QueueItem[]) => void;
}

export default function BatchUploader({ onAddToQueue }: BatchUploaderProps) {
  const [pasteText, setPasteText] = useState("");
  const [mode, setMode] = useState<"csv" | "paste">("paste");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [previewItems, setPreviewItems] = useState<QueueItem[] | null>(null);
  const [parsing, setParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMsg = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleParsed = (items: QueueItem[]) => {
    if (items.length === 0) {
      showMsg("err", "No valid rows. CSV needs: Topic, Language, Audience, Formats, ScheduledDate. Or paste one topic per line.");
      return;
    }
    setPreviewItems(items);
  };

  const handleCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    try {
      const items = await parseBatchUpload(file);
      handleParsed(items);
    } catch {
      showMsg("err", "Could not read file. Use UTF-8 CSV.");
    } finally {
      setParsing(false);
      e.target.value = "";
    }
  };

  const handlePasteParse = async () => {
    if (!pasteText.trim()) {
      showMsg("err", "Enter CSV or one topic per line.");
      return;
    }
    setParsing(true);
    try {
      const items = await parseBatchUpload(pasteText.trim());
      handleParsed(items);
    } catch {
      showMsg("err", "Could not parse. Use CSV with header or one topic per line.");
    } finally {
      setParsing(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!previewItems?.length) return;
    onAddToQueue(previewItems);
    setPreviewItems(null);
    setPasteText("");
    showMsg("ok", `Added ${previewItems.length} topic(s) to queue.`);
  };

  const handleCancelPreview = () => {
    setPreviewItems(null);
  };

  const downloadTemplate = () => {
    const blob = new Blob(["\uFEFF" + CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "content-ops-topics-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow border border-slate-200 p-6 space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Add to generation queue</h2>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("csv")}
          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium ${
            mode === "csv"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-slate-700 border-slate-300 hover:border-indigo-300"
          }`}
        >
          Upload CSV
        </button>
        <button
          type="button"
          onClick={() => setMode("paste")}
          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium ${
            mode === "paste"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-slate-700 border-slate-300 hover:border-indigo-300"
          }`}
        >
          Paste topic list
        </button>
      </div>

      {previewItems === null ? (
        <>
          {mode === "csv" && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                CSV columns: <strong>Topic</strong>, <strong>Language</strong>, <strong>Audience</strong>, <strong>Formats</strong>, <strong>ScheduledDate</strong>
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCsvFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={parsing}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-800 font-medium hover:bg-slate-200 disabled:opacity-50"
                >
                  {parsing ? "Parsing…" : "Choose CSV file"}
                </button>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Download template
                </button>
              </div>
            </div>
          )}

          {mode === "paste" && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">Paste CSV (with header) or one topic per line. Defaults for plain list: en, general, blog.</p>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={`Topic,Language,Audience,Formats,ScheduledDate\n"TyG vs ₹500 Insulin Test",te,patients,"youtube,instagram",2026-03-01\n\nOr one per line:\nDay 1: TyG vs Insulin Test\nDay 2: 5 HbA1c Danger Bands`}
                className="w-full p-3 border border-slate-300 rounded-lg text-sm min-h-[120px] font-sans"
                rows={5}
              />
              <button
                type="button"
                onClick={() => void handlePasteParse()}
                disabled={!pasteText.trim() || parsing}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {parsing ? "Parsing…" : "Parse → Preview"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Preview ({previewItems.length} rows) – add to content queue?</h3>
          <div className="max-h-[280px] overflow-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 sticky top-0">
                <tr>
                  <th className="text-left py-2 px-2 font-semibold text-slate-700">#</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-700">Topic</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-700">Language</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-700">Audience</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-700">Formats</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-700">ScheduledDate</th>
                </tr>
              </thead>
              <tbody>
                {previewItems.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="py-1.5 px-2 text-slate-600">{i + 1}</td>
                    <td className="py-1.5 px-2 text-slate-900 max-w-[200px] truncate" title={row.topic}>{row.topic}</td>
                    <td className="py-1.5 px-2 text-slate-700">{LANGUAGE_LABELS[row.language] ?? row.language}</td>
                    <td className="py-1.5 px-2 text-slate-700">{row.audience}</td>
                    <td className="py-1.5 px-2 text-slate-700">{row.formats}</td>
                    <td className="py-1.5 px-2 text-slate-600">{row.scheduledDate || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleConfirmAdd}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
            >
              Confirm add to queue
            </button>
            <button
              type="button"
              onClick={handleCancelPreview}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && (
        <p
          className={`text-sm py-2 px-3 rounded-lg ${
            message.type === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
