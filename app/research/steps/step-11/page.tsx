"use client";

/**
 * Step 11: Universal Content Amplification – Main UI.
 * Topic input + platform selection. Uses local template-engine only.
 * Does not import from step-1 to step-6. No patientData.
 */

import { useState } from "react";
import Link from "next/link";
import { DEFAULT_TOPIC_INPUT, validateTopicInput, type TopicInput, type TargetAudience, type PlatformFocus } from "./topic-schema";
import { generateAll } from "./template-engine";

function copyToClipboard(text: string): boolean {
  if (typeof navigator?.clipboard?.writeText === "function") {
    navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

export default function Step11ResearchPage() {
  const [input, setInput] = useState<TopicInput>({ ...DEFAULT_TOPIC_INPUT });
  const [output, setOutput] = useState<ReturnType<typeof generateAll> | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [platformTab, setPlatformTab] = useState<"twitter" | "linkedin" | "instagram" | "youtube" | "lecture" | "blog" | "mcq">("twitter");

  const update = (key: keyof TopicInput, value: string) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const errors = validateTopicInput(input);
  const hasErrors = Object.keys(errors).length > 0;

  const handleGenerate = () => {
    setOutput(generateAll(input));
    setPlatformTab("twitter");
  };

  const handleCopy = (label: string, text: string) => {
    if (copyToClipboard(text)) {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link href="/" className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 font-medium">
            ← Home
          </Link>
          <Link href="/step11" className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 font-medium">
            Step 11 (App)
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">✅ Step 11 – Universal Content Amplification</span>
          <h1 className="text-3xl font-bold text-indigo-900 mt-1 mb-2">Topic input + platform selection</h1>
          <p className="text-gray-600">Topic-agnostic template. Enter any medical topic; same output format for all platforms.</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-900 mb-4">Topic &amp; inputs</h2>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="md:col-span-2">
              <label className="block text-gray-600 mb-1">Topic name</label>
              <input
                value={input.topicName}
                onChange={(e) => update("topicName", e.target.value)}
                placeholder="e.g. Pioglitazone in PCOS, Waist Circumference & CAD Risk"
                className="w-full p-2 border rounded"
              />
              {errors.topicName && <p className="text-amber-600 text-xs mt-1">{errors.topicName}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-600 mb-1">Key findings</label>
              <textarea value={input.keyFindings} onChange={(e) => update("keyFindings", e.target.value)} className="w-full p-2 border rounded min-h-[60px]" rows={2} />
            </div>
            <div><label className="block text-gray-600 mb-1">r value</label><input value={input.rValue} onChange={(e) => update("rValue", e.target.value)} className="w-full p-2 border rounded" /></div>
            <div><label className="block text-gray-600 mb-1">p value</label><input value={input.pValue} onChange={(e) => update("pValue", e.target.value)} className="w-full p-2 border rounded" /></div>
            <div><label className="block text-gray-600 mb-1">n</label><input value={input.n} onChange={(e) => update("n", e.target.value)} className="w-full p-2 border rounded" /></div>
            <div><label className="block text-gray-600 mb-1">Effect size</label><input value={input.effectSize} onChange={(e) => update("effectSize", e.target.value)} className="w-full p-2 border rounded" /></div>
            <div>
              <label className="block text-gray-600 mb-1">Target audience</label>
              <select value={input.targetAudience} onChange={(e) => update("targetAudience", e.target.value as TargetAudience)} className="w-full p-2 border rounded">
                <option value="doctors">Doctors</option>
                <option value="patients">Patients</option>
                <option value="students">Students</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Platform focus</label>
              <select value={input.platformFocus} onChange={(e) => update("platformFocus", e.target.value as PlatformFocus)} className="w-full p-2 border rounded">
                <option value="Twitter">Twitter</option>
                <option value="YouTube">YouTube</option>
                <option value="Lecture">Lecture</option>
                <option value="Blog">Blog</option>
              </select>
            </div>
            <div><label className="block text-gray-600 mb-1">Author</label><input value={input.authorName} onChange={(e) => update("authorName", e.target.value)} className="w-full p-2 border rounded" /></div>
            <div><label className="block text-gray-600 mb-1">Clinic</label><input value={input.clinicName} onChange={(e) => update("clinicName", e.target.value)} className="w-full p-2 border rounded" /></div>
            <div><label className="block text-gray-600 mb-1">Location</label><input value={input.location} onChange={(e) => update("location", e.target.value)} className="w-full p-2 border rounded" /></div>
            <div><label className="block text-gray-600 mb-1">Journal / source</label><input value={input.journalOrSource} onChange={(e) => update("journalOrSource", e.target.value)} className="w-full p-2 border rounded" /></div>
          </div>
          <button type="button" onClick={handleGenerate} className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700">
            Generate all content
          </button>
        </div>

        {output && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-indigo-900 mb-3">Output by platform</h2>
            <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200">
              {(["twitter", "linkedin", "instagram", "youtube", "lecture", "blog", "mcq"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setPlatformTab(tab)}
                  className={`px-3 py-1.5 rounded-t-lg text-sm font-medium capitalize ${platformTab === tab ? "bg-indigo-100 text-indigo-800 border border-b-0 border-indigo-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {platformTab === "twitter" && (
              <div className="space-y-3">
                {output.twitter.map((tweet, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded border text-sm">
                    <pre className="whitespace-pre-wrap font-sans">{tweet}</pre>
                    <button type="button" onClick={() => handleCopy(`tw-${i}`, tweet)} className="mt-2 text-indigo-600 text-xs font-medium">{copied === `tw-${i}` ? "Copied!" : "Copy"}</button>
                  </div>
                ))}
                <button type="button" onClick={() => handleCopy("twitter-all", output.twitter.join("\n\n---\n\n"))} className="mt-2 px-3 py-1.5 rounded bg-indigo-100 text-indigo-800 text-sm font-medium">{copied === "twitter-all" ? "Copied!" : "Copy all"}</button>
              </div>
            )}
            {platformTab === "linkedin" && (
              <>
                <pre className="p-4 bg-gray-50 rounded border text-sm whitespace-pre-wrap font-sans max-h-[300px] overflow-y-auto">{output.linkedin}</pre>
                <button type="button" onClick={() => handleCopy("linkedin", output.linkedin)} className="mt-3 px-3 py-1.5 rounded bg-indigo-100 text-indigo-800 text-sm font-medium">{copied === "linkedin" ? "Copied!" : "Copy"}</button>
              </>
            )}
            {platformTab === "instagram" && (
              <>
                <pre className="p-4 bg-gray-50 rounded border text-sm whitespace-pre-wrap font-sans max-h-[200px] overflow-y-auto">{output.instagram}</pre>
                <button type="button" onClick={() => handleCopy("instagram", output.instagram)} className="mt-3 px-3 py-1.5 rounded bg-indigo-100 text-indigo-800 text-sm font-medium">{copied === "instagram" ? "Copied!" : "Copy"}</button>
              </>
            )}
            {platformTab === "youtube" && (
              <>
                <p className="text-gray-600 text-sm mb-2">Shorts (60s)</p>
                <pre className="p-4 bg-gray-50 rounded border text-sm whitespace-pre-wrap font-sans max-h-[200px] overflow-y-auto">{output.youtubeShorts}</pre>
                <button type="button" onClick={() => handleCopy("yt-shorts", output.youtubeShorts)} className="mt-2 px-3 py-1.5 rounded bg-indigo-100 text-indigo-800 text-sm font-medium">{copied === "yt-shorts" ? "Copied!" : "Copy Shorts"}</button>
                <p className="text-gray-600 text-sm mt-4 mb-2">Long-form</p>
                <pre className="p-4 bg-gray-50 rounded border text-sm whitespace-pre-wrap font-sans max-h-[200px] overflow-y-auto">{output.youtubeLong}</pre>
                <button type="button" onClick={() => handleCopy("yt-long", output.youtubeLong)} className="mt-2 px-3 py-1.5 rounded bg-indigo-100 text-indigo-800 text-sm font-medium">{copied === "yt-long" ? "Copied!" : "Copy long-form"}</button>
              </>
            )}
            {platformTab === "lecture" && (
              <>
                <pre className="p-4 bg-gray-50 rounded border text-sm whitespace-pre-wrap font-sans max-h-[400px] overflow-y-auto">{output.lectureSlides}</pre>
                <button type="button" onClick={() => handleCopy("lecture", output.lectureSlides)} className="mt-3 px-3 py-1.5 rounded bg-indigo-100 text-indigo-800 text-sm font-medium">{copied === "lecture" ? "Copied!" : "Copy slides"}</button>
              </>
            )}
            {platformTab === "blog" && (
              <>
                <pre className="p-4 bg-gray-50 rounded border text-sm whitespace-pre-wrap font-sans max-h-[300px] overflow-y-auto">{output.blog}</pre>
                <button type="button" onClick={() => handleCopy("blog", output.blog)} className="mt-3 px-3 py-1.5 rounded bg-indigo-100 text-indigo-800 text-sm font-medium">{copied === "blog" ? "Copied!" : "Copy"}</button>
              </>
            )}
            {platformTab === "mcq" && (
              <div className="space-y-4">
                {output.mcq.map((q, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded border text-sm">
                    <p className="font-medium">Q{i + 1} [{q.category}] {q.question}</p>
                    <ul className="list-disc list-inside mt-1">{q.options.map((o, j) => <li key={j}>{o}{j === q.correctIndex ? " ✓" : ""}</li>)}</ul>
                    {q.explanation && <p className="text-gray-600 text-xs mt-1">{q.explanation}</p>}
                  </div>
                ))}
                <button type="button" onClick={() => handleCopy("mcq", JSON.stringify(output.mcq, null, 2))} className="mt-2 px-3 py-1.5 rounded bg-indigo-100 text-indigo-800 text-sm font-medium">{copied === "mcq" ? "Copied!" : "Copy MCQ JSON"}</button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <Link href="/step9" className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300">← Step 9</Link>
          <Link href="/step11" className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-800 font-medium hover:bg-indigo-200">Step 11 (App route)</Link>
          <Link href="/" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-medium hover:bg-gray-200">Home</Link>
        </div>
      </div>
    </div>
  );
}
