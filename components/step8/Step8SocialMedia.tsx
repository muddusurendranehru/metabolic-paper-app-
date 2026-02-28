"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DEFAULT_META,
  generateTwitterThread,
  generateLinkedInPost,
  generateYouTubeScript,
  generateInfographicPrompts,
  type Step8PaperMeta,
} from "./step8-config";

function copyToClipboard(text: string): boolean {
  if (typeof navigator?.clipboard?.writeText === "function") {
    navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

export default function Step8SocialMedia() {
  const [meta, setMeta] = useState<Step8PaperMeta>({ ...DEFAULT_META });
  const [twitterTweets, setTwitterTweets] = useState<string[]>([]);
  const [linkedIn, setLinkedIn] = useState("");
  const [youtube, setYoutube] = useState("");
  const [infographic, setInfographic] = useState<{ canva: string; midjourney: string; dallE: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerateAll = () => {
    setTwitterTweets(generateTwitterThread(meta));
    setLinkedIn(generateLinkedInPost(meta));
    setYoutube(generateYouTubeScript(meta));
    setInfographic(generateInfographicPrompts(meta));
  };

  const handleCopy = (label: string, text: string) => {
    if (copyToClipboard(text)) {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const updateMeta = (key: keyof Step8PaperMeta, value: string) => {
    setMeta((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">Step 8: Social Media</h1>
        <p className="text-gray-600">Generate Twitter thread, LinkedIn post, YouTube script, and infographic prompts from your paper.</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-indigo-900 mb-4">Paper metadata (edit if needed)</h2>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div>
            <label className="block text-gray-600 mb-1">Title</label>
            <input value={meta.title} onChange={(e) => updateMeta("title", e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Journal</label>
            <input value={meta.journal} onChange={(e) => updateMeta("journal", e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">n (sample size)</label>
            <input value={meta.n} onChange={(e) => updateMeta("n", e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Location</label>
            <input value={meta.location} onChange={(e) => updateMeta("location", e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">r value</label>
            <input value={meta.rValue} onChange={(e) => updateMeta("rValue", e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">p value</label>
            <input value={meta.pValue} onChange={(e) => updateMeta("pValue", e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-600 mb-1">Key finding (one line)</label>
            <input value={meta.keyFinding} onChange={(e) => updateMeta("keyFinding", e.target.value)} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">DOI</label>
            <input value={meta.doi} onChange={(e) => updateMeta("doi", e.target.value)} className="w-full p-2 border rounded" />
          </div>
        </div>
        <button
          type="button"
          onClick={handleGenerateAll}
          className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
        >
          Generate All Content
        </button>
      </div>

      {twitterTweets.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-900 mb-3">Twitter thread (5 tweets)</h2>
          <div className="space-y-3">
            {twitterTweets.map((tweet, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded border text-sm">
                <span className="text-gray-500 font-medium">Tweet {i + 1}</span>
                <pre className="mt-1 whitespace-pre-wrap font-sans">{tweet}</pre>
                <button
                  type="button"
                  onClick={() => handleCopy(`twitter-${i}`, tweet)}
                  className="mt-2 text-indigo-600 text-xs font-medium"
                >
                  {copied === `twitter-${i}` ? "Copied!" : "Copy"}
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => handleCopy("twitter-all", twitterTweets.join("\n\n---\n\n"))}
            className="mt-3 px-3 py-1.5 rounded bg-indigo-100 text-indigo-800 text-sm font-medium"
          >
            {copied === "twitter-all" ? "Copied!" : "Copy all"}
          </button>
        </div>
      )}

      {linkedIn && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-900 mb-3">LinkedIn post</h2>
          <pre className="p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap font-sans">{linkedIn}</pre>
          <button
            type="button"
            onClick={() => handleCopy("linkedin", linkedIn)}
            className="mt-3 px-3 py-1.5 rounded bg-indigo-100 text-indigo-800 text-sm font-medium"
          >
            {copied === "linkedin" ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {youtube && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-900 mb-3">YouTube Shorts script (60s)</h2>
          <pre className="p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap font-sans">{youtube}</pre>
          <button
            type="button"
            onClick={() => handleCopy("youtube", youtube)}
            className="mt-3 px-3 py-1.5 rounded bg-indigo-100 text-indigo-800 text-sm font-medium"
          >
            {copied === "youtube" ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {infographic && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-indigo-900 mb-3">Infographic prompts</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600 font-medium text-sm">Canva</span>
              <pre className="mt-1 p-2 bg-gray-50 rounded border text-xs whitespace-pre-wrap font-sans">{infographic.canva}</pre>
              <button type="button" onClick={() => handleCopy("canva", infographic.canva)} className="mt-1 text-indigo-600 text-xs font-medium">
                {copied === "canva" ? "Copied!" : "Copy"}
              </button>
            </div>
            <div>
              <span className="text-gray-600 font-medium text-sm">Midjourney</span>
              <pre className="mt-1 p-2 bg-gray-50 rounded border text-xs whitespace-pre-wrap font-sans">{infographic["midjourney"]}</pre>
              <button type="button" onClick={() => handleCopy("midjourney", infographic["midjourney"])} className="mt-1 text-indigo-600 text-xs font-medium">
                {copied === "midjourney" ? "Copied!" : "Copy"}
              </button>
            </div>
            <div>
              <span className="text-gray-600 font-medium text-sm">DALL-E</span>
              <pre className="mt-1 p-2 bg-gray-50 rounded border text-xs whitespace-pre-wrap font-sans">{infographic.dallE}</pre>
              <button type="button" onClick={() => handleCopy("dalle", infographic.dallE)} className="mt-1 text-indigo-600 text-xs font-medium">
                {copied === "dalle" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <Link href="/step9" className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700">
          Proceed to Step 9 →
        </Link>
        <Link href="/step7" className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300">
          ← Back to Step 7
        </Link>
      </div>
    </div>
  );
}
