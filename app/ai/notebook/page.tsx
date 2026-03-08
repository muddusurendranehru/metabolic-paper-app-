"use client";

/**
 * AI Notebook – Neutral Content ONLY (clinical education, PubMed-style).
 * NEVER mix with /ai/testimonials (patient reviews).
 * Tone: Neutral, evidence-aware. Language: 70% English, 30% Telugu.
 * No patient claims, no remission/success stories.
 */

import { useState } from "react";
import { generateNeutralNotebookScript } from "@/lib/utils/ai/notebook-neutral";

export default function NotebookPage() {
  const [topic, setTopic] = useState("");
  const [evidenceHint, setEvidenceHint] = useState("");
  const [script, setScript] = useState("");

  const handleGenerate = () => {
    const out = generateNeutralNotebookScript({
      topic: topic.trim() || "metabolic health",
      evidenceHint: evidenceHint.trim() || undefined,
    });
    setScript(out);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-indigo-900">Neutral Content (Notebook)</h1>
      <p className="text-sm text-gray-600">
        Clinical education, PubMed-style only. Evidence-aware tone. No patient claims. Do not use for testimonials.
      </p>
      <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        <strong>Separation:</strong> This is neutral content only. Never mix with Patient Reviews (/ai/testimonials).
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Topic (e.g. TyG index, diet and lipids)</span>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. TyG index and diabetes prevention"
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Evidence hint (optional, 1–2 sentences)</span>
          <input
            type="text"
            value={evidenceHint}
            onChange={(e) => setEvidenceHint(e.target.value)}
            placeholder="e.g. Small studies suggest… interpret with caution"
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={handleGenerate}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Generate neutral script
        </button>
      </div>

      {script && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-800">Script (neutral content only)</h2>
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">{script}</pre>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(script)}
            className="mt-3 rounded bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
          >
            Copy
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500">
        For more formats (blog, Twitter, handout, PubMed-style blog), use Step 12. This page is for neutral script only.
      </p>
    </div>
  );
}
