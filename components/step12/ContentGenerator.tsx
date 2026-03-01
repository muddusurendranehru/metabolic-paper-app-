// eslint-disable-next-line no-restricted-imports
// Do NOT import from: app/research, components/tabs, lib/utils except step12
"use client";
/**
 * Step 12 – content generator. Imports ONLY from @/lib/utils/step12 and components/step12 (generators).
 * No app/research/steps, no other lib/utils, no patientData.
 * Uses Step12Input: topic, sourceType, pastedText, targetFormats, audience, tone.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import DocumentUploader from "./DocumentUploader";
import FormatSelector from "./FormatSelector";
import SourceTypeSelector from "./SourceTypeSelector";
import AudienceToneSelectors from "./AudienceToneSelectors";
import { generateBlog } from "./generators/blog";
import { generateSocial, generateTwitter, generateLinkedin, generateWhatsapp } from "./generators/social";
import { generateHandout } from "./generators/handout";
import { generateYoutube } from "./generators/youtube";
import { generateFaq } from "./generators/faq";
import {
  formatStep12Label,
  DEFAULT_STEP12_INPUT,
  extractPlainText,
  STEP12_DEFAULT_WEBSITE_URL,
  STEP12_DEFAULT_CLINIC,
  type Step12Input,
  type Step12TargetFormat,
} from "@/lib/utils/step12";
import { generateHyperNaturalPrompt } from "./generators/video-prompts";
import { generateMobileInfographicPrompt } from "./generators/mobile-infographic";
import CollaborationTrackerCard from "./CollaborationTrackerCard";

const TEXT_GENERATORS: Partial<
  Record<Step12TargetFormat, (text: string, title?: string) => string>
> = {
  blog: generateBlog,
  twitter: generateTwitter,
  linkedin: generateLinkedin,
  handout: generateHandout,
  youtube: generateYoutube,
  faq: generateFaq,
  whatsapp: generateWhatsapp,
};

const FORMAT_LABELS: Partial<Record<Step12TargetFormat, string>> = {
  hypernatural: "HyperNatural (video)",
  infographic: "Infographic (mobile)",
};

export default function ContentGenerator() {
  const [input, setInput] = useState<Step12Input>(DEFAULT_STEP12_INPUT);
  const [outputs, setOutputs] = useState<Record<Step12TargetFormat, string>>({} as Record<Step12TargetFormat, string>);

  useEffect(() => {
    // Verify no patientData access
    if (typeof window !== "undefined") {
      console.assert(
        !(window as any).patientData,
        "⚠️ Step 12 should not access patientData"
      );
    }
  }, []);

  const sourceText = (() => {
    if (input.sourceType === "from-scratch") return extractPlainText(input.topic);
    if (input.sourceType === "paste" && input.pastedText) return extractPlainText(input.pastedText);
    return input.pastedText ?? ""; // upload path: parent sets pastedText from file
  })();

  const handleGenerate = () => {
    const text = sourceText || input.topic || "(No content)";
    const title = input.topic || undefined;
    const inputWithDefaults: Step12Input & { websiteUrl?: string; clinic?: string } = {
      ...input,
      websiteUrl: STEP12_DEFAULT_WEBSITE_URL,
      clinic: STEP12_DEFAULT_CLINIC,
    };
    const next: Record<Step12TargetFormat, string> = {} as Record<Step12TargetFormat, string>;
    for (const format of input.targetFormats) {
      if (format === "hypernatural") {
        next[format] = generateHyperNaturalPrompt(inputWithDefaults);
      } else if (format === "infographic") {
        next[format] = generateMobileInfographicPrompt(inputWithDefaults);
      } else {
        const fn = TEXT_GENERATORS[format];
        if (fn) next[format] = fn(text, title);
      }
    }
    setOutputs(next);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">{formatStep12Label()}</h1>
        <p className="text-gray-600 text-sm">Topic-agnostic. No research data. Choose source, formats, audience, tone.</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
          <input
            value={input.topic}
            onChange={(e) => setInput((i) => ({ ...i, topic: e.target.value }))}
            placeholder="e.g. Role of Ghee in Diabetes"
            className="w-full p-2 border rounded text-sm"
          />
        </div>

        <SourceTypeSelector
          value={input.sourceType}
          onChange={(sourceType) => setInput((i) => ({ ...i, sourceType }))}
        />

        {input.sourceType === "upload" && (
          <DocumentUploader
            onExtracted={(text) => setInput((i) => ({ ...i, pastedText: text }))}
          />
        )}

        {(input.sourceType === "paste" || input.sourceType === "upload") && (
          <div className="bg-white rounded-lg shadow p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {input.sourceType === "paste" ? "Paste source text" : "Or paste text (for PDF: copy visible text from the page, not the file)"}
            </label>
            <textarea
              value={input.pastedText ?? ""}
              onChange={(e) => setInput((i) => ({ ...i, pastedText: e.target.value }))}
              placeholder="Paste the visible text from your document here (copy from Word/Google Docs/PDF viewer)…"
              className="w-full p-2 border rounded min-h-[80px] text-sm"
              rows={3}
            />
          </div>
        )}

        <FormatSelector
          value={input.targetFormats}
          onChange={(targetFormats) => setInput((i) => ({ ...i, targetFormats }))}
        />

        <AudienceToneSelectors
          audience={input.audience}
          tone={input.tone}
          onAudienceChange={(audience) => setInput((i) => ({ ...i, audience }))}
          onToneChange={(tone) => setInput((i) => ({ ...i, tone }))}
        />

        <button
          type="button"
          onClick={handleGenerate}
          className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
        >
          Generate
        </button>
      </div>

      {Object.keys(outputs).length > 0 && (
        <div className="space-y-4 mb-6">
          {(input.targetFormats as Step12TargetFormat[]).map((format) => {
            const out = outputs[format];
            if (out == null) return null;
            const copy = () => void navigator.clipboard?.writeText(out);
            const download = () => {
              const blob = new Blob([out], { type: "text/plain;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `step12-${format}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            };
            return (
              <div key={format} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h2 className="text-xl font-bold text-indigo-900">{FORMAT_LABELS[format] ?? format.charAt(0).toUpperCase() + format.slice(1)}</h2>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={copy}
                      className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={download}
                      className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Download
                    </button>
                  </div>
                </div>
                <pre className="p-4 bg-gray-50 rounded border text-sm whitespace-pre-wrap font-sans max-h-[400px] overflow-y-auto">
                  {out}
                </pre>
              </div>
            );
          })}
        </div>
      )}

      <CollaborationTrackerCard />

      <div className="flex flex-wrap gap-4 mt-6">
        <Link href="/" className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300">
          ← Home
        </Link>
        <Link href="/step11" className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-800 font-medium hover:bg-indigo-200">
          Step 11
        </Link>
      </div>

      <div className="mt-8 p-4 rounded-xl bg-amber-50 border-2 border-amber-200 text-center">
        <p className="text-sm font-semibold text-amber-900 mb-2">People need to visit — the gamechanger</p>
        <a
          href={STEP12_DEFAULT_WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
        >
          Visit Dr. Muddu&apos;s Metabolic Care (HOMA Clinic) →
        </a>
      </div>
    </div>
  );
}
