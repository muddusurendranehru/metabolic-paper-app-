// eslint-disable-next-line no-restricted-imports
// Do NOT import from: app/research, components/tabs, lib/utils except step12
"use client";
/**
 * Step 12 – Neutral Medical Content Generator.
 * Imports ONLY from: @/lib/utils/step12 (and React, Next).
 * NEVER from: app/research/steps/*, other lib/utils, components/tabs, components/research.
 * Uses ONLY local React state. No patientData.
 * Delete components/step12/ → zero impact on steps 1–11.
 */

import { useState } from "react";
import Link from "next/link";
import {
  DEFAULT_NEUTRAL_INPUT,
  formatStep12Label,
  generateNeutralContent,
  type NeutralContentInput,
  type NeutralContentOutput,
} from "@/lib/utils/step12";

export default function Step12Tool() {
  const [input, setInput] = useState<NeutralContentInput>({ ...DEFAULT_NEUTRAL_INPUT });
  const [output, setOutput] = useState<NeutralContentOutput | null>(null);

  const update = (key: keyof NeutralContentInput, value: string) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    setOutput(generateNeutralContent(input));
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">{formatStep12Label()}</h1>
        <p className="text-gray-600 text-sm">
          Isolated from steps 1–11. Topic-agnostic; enter any medical topic and key finding. Imports only from <code className="bg-gray-100 px-1 rounded">lib/utils/step12/</code>. Delete-proof.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-indigo-900 mb-4">Input</h2>
        <div className="space-y-3 text-sm">
          <div>
            <label className="block text-gray-600 mb-1">Topic title</label>
            <input
              value={input.topicTitle}
              onChange={(e) => update("topicTitle", e.target.value)}
              placeholder="e.g. Biomarker X and outcome Y"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Key finding</label>
            <textarea
              value={input.keyFinding}
              onChange={(e) => update("keyFinding", e.target.value)}
              placeholder="1–2 sentences"
              className="w-full p-2 border rounded min-h-[60px]"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 mb-1">Audience</label>
              <input
                value={input.audience}
                onChange={(e) => update("audience", e.target.value)}
                placeholder="e.g. clinicians"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">n (optional)</label>
              <input
                value={input.n ?? ""}
                onChange={(e) => update("n", e.target.value)}
                placeholder="e.g. 75"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Setting (optional)</label>
            <input
              value={input.setting ?? ""}
              onChange={(e) => update("setting", e.target.value)}
              placeholder="e.g. primary care"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
        >
          Generate neutral content
        </button>
      </div>

      {output && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-900 mb-3">Output</h2>
          <p className="text-gray-700 text-sm mb-3">{output.summary}</p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-3">
            {output.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <p className="text-gray-600 text-sm italic">{output.cta}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <Link href="/" className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300">
          ← Home
        </Link>
        <Link href="/step11" className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-800 font-medium hover:bg-indigo-200">
          Step 11
        </Link>
      </div>
    </div>
  );
}
