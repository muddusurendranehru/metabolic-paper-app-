"use client";

/**
 * AI Testimonials – patient review video generator ONLY.
 * Isolated: no imports from app/research/steps, no patient data.
 */

import { useState, useRef } from "react";
import { buildTestimonialScript } from "./generator";
import { getTestimonialScript, SAFE_TESTIMONIAL_TEMPLATES } from "@/lib/utils/testimonials/review-generator";
import { getHoma45sVideoSpec, getHoma45sVideoSpecWithScript } from "@/lib/utils/testimonials/homa-45s-spec";

export default function TestimonialsPage() {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [theme, setTheme] = useState("");
  const [duration, setDuration] = useState(45);
  const [language, setLanguage] = useState<"en" | "te" | "hi">("en");
  const [script, setScript] = useState("");
  const [show45sSpec, setShow45sSpec] = useState(false);
  const [copied45s, setCopied45s] = useState(false);
  const [editable45sSpec, setEditable45sSpec] = useState(() => getHoma45sVideoSpec());
  const scriptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const briefTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = () => {
    const topicToTry = selectedTopic || theme.trim();
    const template = topicToTry ? getTestimonialScript(topicToTry) : null;
    if (template) {
      const topicScript = `${template.hook}\n\n${template.middle}\n\n${template.close}\n\n---\n${template.footer}`;
      setScript(topicScript);
      setEditable45sSpec(getHoma45sVideoSpecWithScript(topicScript));
    } else {
      const out = buildTestimonialScript({
        theme: theme.trim() || "experience",
        durationSeconds: duration,
        language,
      });
      setScript(out);
      setEditable45sSpec(getHoma45sVideoSpecWithScript(out));
    }
  };

  const reset45sToTemplate = () => {
    setEditable45sSpec(getHoma45sVideoSpec());
  };

  const focusScriptEdit = () => {
    scriptTextareaRef.current?.focus();
  };

  const focusBriefEdit = () => {
    setShow45sSpec(true);
    setTimeout(() => briefTextareaRef.current?.focus(), 100);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-indigo-900">Patient Review Video Generator</h1>
      <p className="text-sm text-gray-600">
        Patient testimonials, trust-building. Warm, personal tone. Generic composite—no identifiers.
      </p>
      <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        <strong>Separation:</strong> Patient reviews only. Never mix with Neutral Content (/ai/notebook) or clinical copy.
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Quick topic (30 diabetes complication templates)</span>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">— Custom theme below —</option>
            {SAFE_TESTIMONIAL_TEMPLATES.map((t, i) => (
              <option key={t.topic} value={t.topic}>
                {i + 1}. {t.topic}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Theme (e.g. weight loss, TyG follow-up)</span>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g. diet change, follow-up experience (used if no quick topic)"
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Duration (seconds)</span>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value={30}>30s</option>
            <option value={45}>45s</option>
            <option value={60}>60s</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">CTA language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "te" | "hi")}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="en">English</option>
            <option value="te">Telugu</option>
            <option value="hi">Hindi</option>
          </select>
        </label>
        <button
          type="button"
          onClick={handleGenerate}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Generate script
        </button>
        <p className="text-xs text-gray-500">Generate script based on the selected topic. One-line (hook) change per topic; rest same. Duration 30s/45s/60s.</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-800">Script (edit manually, try different reviews)</h2>
        <p className="text-xs text-gray-500 mb-2">Spoken words only. Generate to fill template, then edit below and copy.</p>
        <textarea
          ref={scriptTextareaRef}
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Click 'Generate script' above to fill, or type your own review script here…"
          rows={12}
          className="block w-full rounded border border-gray-300 px-3 py-2 font-sans text-sm text-gray-800"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={focusScriptEdit}
            className="rounded bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
          >
            Edit (human in the loop)
          </button>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(script)}
            className="rounded bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-300"
          >
            Copy script
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-800 hover:bg-indigo-200"
          >
            Fill from template
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
        <h2 className="mb-2 text-sm font-semibold text-indigo-900">45s HOMA video brief (Shorts/Reels)</h2>
        <p className="mb-3 text-xs text-indigo-800">
          Full production spec (photo, voice, script, 8 visuals, style, 1080p 9:16). <strong>SCRIPT is linked to the selected Quick topic</strong> when you click Generate script above. Edit below or Reset to template. Use for video production or AI video tools.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={focusBriefEdit}
            className="rounded bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
          >
            Edit brief (human in the loop)
          </button>
          <button
            type="button"
            onClick={() => setShow45sSpec((s) => !s)}
            className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
          >
            {show45sSpec ? "Hide brief" : "View full brief"}
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(editable45sSpec);
              setCopied45s(true);
              setTimeout(() => setCopied45s(false), 2000);
            }}
            className="rounded bg-white border border-indigo-300 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
          >
            {copied45s ? "Copied!" : "Copy full brief"}
          </button>
        </div>
        {show45sSpec && (
          <div className="mt-3">
            <p className="text-xs text-indigo-800 mb-1">Edit below, then copy. Use &quot;Reset to template&quot; to restore default.</p>
            <textarea
              ref={briefTextareaRef}
              value={editable45sSpec}
              onChange={(e) => setEditable45sSpec(e.target.value)}
              rows={18}
              className="block w-full rounded border border-indigo-200 bg-white p-3 font-sans text-xs text-gray-800"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(editable45sSpec);
                  setCopied45s(true);
                  setTimeout(() => setCopied45s(false), 2000);
                }}
                className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
              >
                {copied45s ? "Copied!" : "Copy full brief"}
              </button>
              <button
                type="button"
                onClick={reset45sToTemplate}
                className="rounded bg-white border border-indigo-300 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
              >
                Reset to template
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
