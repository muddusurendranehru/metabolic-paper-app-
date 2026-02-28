"use client";
// Step 11: Universal Content Amplification. Topic-agnostic; no hardcoded medical terms.
// Do not import from step-1–step-6. Do not use patientData. Additive only.

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import mammoth from "mammoth";
import { exportPDF } from "@/lib/utils/pdf-export";
import { toLegacyTopicInput, type ContentAmplificationInput } from "@/lib/utils/content-amplification-schema";
import {
  DEFAULT_STEP11_INPUT,
  generateTwitterAmplification,
  generateYouTubeAmplification,
  generateBlogAmplification,
  generateCMEAmplification,
  type Step11TopicInput,
  type TargetAudience,
  type PlatformFocus,
} from "./step11-config";

function copyToClipboard(text: string): boolean {
  if (typeof navigator?.clipboard?.writeText === "function") {
    navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

export default function Step11ContentAmplification() {
  const [input, setInput] = useState<Step11TopicInput>({ ...DEFAULT_STEP11_INPUT });
  const [twitter, setTwitter] = useState<string[]>([]);
  const [youtube, setYoutube] = useState("");
  const [blog, setBlog] = useState("");
  const [cme, setCme] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [outputTab, setOutputTab] = useState<"twitter" | "youtube" | "blog" | "cme">("twitter");
  const pdfRef = useRef<HTMLDivElement>(null);

  const update = (key: keyof Step11TopicInput, value: string) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = useCallback(() => {
    setTwitter(generateTwitterAmplification(input));
    setYoutube(generateYouTubeAmplification(input));
    setBlog(generateBlogAmplification(input));
    setCme(generateCMEAmplification(input));
    setOutputTab("twitter");
  }, [input]);

  const handleCopy = (label: string, text: string) => {
    if (copyToClipboard(text)) {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();

    if (name.endsWith(".docx")) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = (result.value || "").trim().slice(0, 2000);
        setInput((prev) => ({ ...prev, keyFindings: text }));
      } catch {
        setInput((prev) => ({ ...prev, keyFindings: "[Could not read .docx—try saving as .txt and upload again.]" }));
      }
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      try {
        if (name.endsWith(".json")) {
          const data = JSON.parse(text) as Record<string, unknown>;
          const isUniversal = "topicTitle" in data || "topicCategory" in data || "statisticalResult" in data;
          if (isUniversal) {
            const legacy = toLegacyTopicInput(data as Partial<ContentAmplificationInput>);
            setInput((prev) => ({ ...prev, ...legacy } as Step11TopicInput));
          } else {
            setInput((prev) => ({ ...prev, ...data } as Step11TopicInput));
          }
        } else {
          setInput((prev) => ({ ...prev, keyFindings: text.slice(0, 2000) }));
        }
      } catch {
        setInput((prev) => ({ ...prev, keyFindings: text.slice(0, 2000) }));
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  const handleExportJSON = () => {
    const payload = { input, twitter, youtube, blog, cme, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "step11-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    if (!pdfRef.current) return;
    try {
      await exportPDF(pdfRef.current, "step11-cme-slides.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">Step 11: Universal Content Amplification</h1>
        <p className="text-gray-600">
          Topic-agnostic template. Enter any topic name and key findings; same output format for Twitter, YouTube, Blog, CME slides. No hardcoded medical terms.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-indigo-900">Topic &amp; inputs (all optional except topic)</h2>
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-800 text-sm font-medium cursor-pointer hover:bg-indigo-100">
            <input type="file" accept=".json,.txt,.docx" onChange={handleFileUpload} className="sr-only" />
            Upload file (.json, .txt, .docx)
          </label>
        </div>
        <p className="text-gray-500 text-xs mb-3">Optional: .json = pre-fill all fields; .txt = Key findings; .docx = text extracted into Key findings (no need to convert). Patient names are never shown—any &quot;Patient data&quot; or name-like lines are redacted.</p>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="md:col-span-2">
            <label className="block text-gray-600 mb-1">Topic name</label>
            <input
              value={input.topicName}
              onChange={(e) => update("topicName", e.target.value)}
              placeholder="e.g. Pioglitazone in PCOS, Waist Circumference & CAD Risk"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-600 mb-1">Key findings (free text)</label>
            <textarea
              value={input.keyFindings}
              onChange={(e) => update("keyFindings", e.target.value)}
              placeholder="Main result, clinical implication"
              className="w-full p-2 border rounded min-h-[60px]"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">r value</label>
            <input value={input.rValue} onChange={(e) => update("rValue", e.target.value)} className="w-full p-2 border rounded" placeholder="0.46" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">p value</label>
            <input value={input.pValue} onChange={(e) => update("pValue", e.target.value)} className="w-full p-2 border rounded" placeholder="0.001" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">n (sample size)</label>
            <input value={input.n} onChange={(e) => update("n", e.target.value)} className="w-full p-2 border rounded" placeholder="75" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Effect size</label>
            <input value={input.effectSize} onChange={(e) => update("effectSize", e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. OR 1.2" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Target audience</label>
            <select
              value={input.targetAudience}
              onChange={(e) => update("targetAudience", e.target.value as TargetAudience)}
              className="w-full p-2 border rounded"
            >
              <option value="doctors">Doctors</option>
              <option value="patients">Patients</option>
              <option value="students">Students</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Platform focus</label>
            <select
              value={input.platformFocus}
              onChange={(e) => update("platformFocus", e.target.value as PlatformFocus)}
              className="w-full p-2 border rounded"
            >
              <option value="Twitter">Twitter</option>
              <option value="YouTube">YouTube</option>
              <option value="Lecture">Lecture</option>
              <option value="Blog">Blog</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Author name</label>
            <input value={input.authorName} onChange={(e) => update("authorName", e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Clinic / institution</label>
            <input value={input.clinicName} onChange={(e) => update("clinicName", e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Location</label>
            <input value={input.location} onChange={(e) => update("location", e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Journal / source</label>
            <input value={input.journalOrSource} onChange={(e) => update("journalOrSource", e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. IJCR 2026" />
          </div>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
        >
          Generate all content
        </button>
      </div>

      {(twitter.length > 0 || youtube || blog || cme) && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-indigo-900">Output (same format for any topic)</h2>
            <div className="flex gap-2">
              <button type="button" onClick={handleExportJSON} className="px-3 py-1.5 rounded-lg bg-gray-700 text-white text-sm font-medium hover:bg-gray-800">
                Export JSON
              </button>
              <button type="button" onClick={handleExportPDF} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700">
                Export PDF
              </button>
            </div>
          </div>
          <div className="flex gap-2 mb-4 border-b border-gray-200">
            {["twitter", "youtube", "blog", "cme"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setOutputTab(tab as typeof outputTab)}
                className={`px-4 py-2 rounded-t-lg font-medium capitalize ${
                  outputTab === tab ? "bg-indigo-100 text-indigo-800 border border-b-0 border-indigo-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {outputTab === "twitter" && twitter.length > 0 && (
            <div className="space-y-3">
              {twitter.map((tweet, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded border text-sm">
                  <span className="text-gray-500 font-medium">Tweet {i + 1}</span>
                  <pre className="mt-1 whitespace-pre-wrap font-sans">{tweet}</pre>
                  <button type="button" onClick={() => handleCopy(`tw-${i}`, tweet)} className="mt-2 text-indigo-600 text-xs font-medium">
                    {copied === `tw-${i}` ? "Copied!" : "Copy"}
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => handleCopy("twitter-all", twitter.join("\n\n---\n\n"))} className="mt-2 px-3 py-1.5 rounded bg-indigo-100 text-indigo-800 text-sm font-medium">
                {copied === "twitter-all" ? "Copied!" : "Copy all"}
              </button>
            </div>
          )}
          {outputTab === "youtube" && youtube && (
            <>
              <pre className="p-4 bg-gray-50 rounded border text-sm whitespace-pre-wrap font-sans max-h-[300px] overflow-y-auto">{youtube}</pre>
              <button type="button" onClick={() => handleCopy("youtube", youtube)} className="mt-3 px-3 py-1.5 rounded bg-indigo-100 text-indigo-800 text-sm font-medium">
                {copied === "youtube" ? "Copied!" : "Copy"}
              </button>
            </>
          )}
          {outputTab === "blog" && blog && (
            <>
              <pre className="p-4 bg-gray-50 rounded border text-sm whitespace-pre-wrap font-sans max-h-[300px] overflow-y-auto">{blog}</pre>
              <button type="button" onClick={() => handleCopy("blog", blog)} className="mt-3 px-3 py-1.5 rounded bg-indigo-100 text-indigo-800 text-sm font-medium">
                {copied === "blog" ? "Copied!" : "Copy"}
              </button>
            </>
          )}
          {outputTab === "cme" && cme && (
            <>
              <pre className="p-4 bg-gray-50 rounded border text-sm whitespace-pre-wrap font-sans max-h-[400px] overflow-y-auto">{cme}</pre>
              <button type="button" onClick={() => handleCopy("cme", cme)} className="mt-3 px-3 py-1.5 rounded bg-indigo-100 text-indigo-800 text-sm font-medium">
                {copied === "cme" ? "Copied!" : "Copy CME slides"}
              </button>
            </>
          )}
        </div>
      )}

      {/* Hidden div for PDF export: CME slides (or summary when CME empty) */}
      <div
        ref={pdfRef}
        className="absolute left-[-9999px] top-0 w-[210mm] p-8 bg-white text-black text-sm"
        aria-hidden
      >
        <h1 className="text-lg font-bold mb-2">Step 11: Content Amplification</h1>
        <p className="text-gray-600 text-xs mb-4">{input.topicName || "Topic"} | {new Date().toISOString().slice(0, 10)}</p>
        <pre className="whitespace-pre-wrap font-sans text-xs">{cme || [blog, youtube, twitter.join("\n\n")].filter(Boolean).join("\n\n---\n\n") || "Generate content first."}</pre>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/step9" className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300">
          ← Back to Step 9
        </Link>
        <Link href="/step12" className="px-4 py-2 rounded-lg bg-amber-100 text-amber-800 font-medium hover:bg-amber-200">
          Step 12: Neutral Content →
        </Link>
        <Link href="/" className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-800 font-medium hover:bg-indigo-200">
          Home
        </Link>
      </div>
    </div>
  );
}
