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
import {
  generateBookSection,
  type BookSectionSectionType,
  type BookSectionDepthLevel,
  type BookSectionCitationStyle,
} from "./generators/book-section";
import { generateSeoBlog, type SeoBlogMetaLength } from "./generators/seo-blog";
import { generateSocial, generateTwitter, generateLinkedin, generateWhatsapp } from "./generators/social";
import { generateHandout } from "./generators/handout";
import { generateYoutube } from "./generators/youtube";
import { generateMcqGenerator } from "./generators/mcq-generator";
import { generateYoutubePackage } from "./generators/youtube-package";
import { generateWhatsappCta } from "./generators/whatsapp-cta";
import { generateFacebookPost } from "./generators/facebook-post";
import {
  formatStep12Label,
  DEFAULT_STEP12_INPUT,
  extractPlainText,
  STEP12_DEFAULT_WEBSITE_URL,
  STEP12_DEFAULT_CLINIC,
  STEP12_LANGUAGES,
  parseNutritionBotText,
  generateMCTContent,
  generateMetaTitle,
  generateMetaDescription,
  generateSchemaOrg,
  WEBSITE_CONFIG,
  type Step12Input,
  type Step12TargetFormat,
  type Step12Language,
} from "@/lib/utils/step12";
import { generateHyperNatural50sScript } from "./generators/video-prompts";
import { generateMobileInfographicPrompt } from "./generators/mobile-infographic";
import CollaborationTrackerCard from "./CollaborationTrackerCard";

const TEXT_GENERATORS: Partial<
  Record<Step12TargetFormat, (text: string, title?: string, language?: Step12Language) => string>
> = {
  blog: generateBlog,
  twitter: generateTwitter,
  linkedin: generateLinkedin,
  handout: generateHandout,
  youtube: generateYoutube,
  "youtube-package": generateYoutubePackage,
  mcq: generateMcqGenerator,
  whatsapp: generateWhatsapp,
  "whatsapp-cta": generateWhatsappCta,
  "facebook-post": generateFacebookPost,
};

const FORMAT_LABELS: Partial<Record<Step12TargetFormat, string>> = {
  hypernatural: "HyperNatural (video)",
  infographic: "Infographic (mobile)",
  "book-section": "📚 Book section",
  "seo-blog": "🔍 SEO Blog + Metadata",
  "youtube-package": "YouTube (full pkg)",
  "whatsapp-cta": "WhatsApp CTA",
  "facebook-post": "Facebook",
};

export default function ContentGenerator() {
  const [input, setInput] = useState<Step12Input>(DEFAULT_STEP12_INPUT);
  const [outputs, setOutputs] = useState<Record<Step12TargetFormat, string>>({} as Record<Step12TargetFormat, string>);
  const [bookTitle, setBookTitle] = useState("");
  const [sectionType, setSectionType] = useState<BookSectionSectionType>("chapter");
  const [depthLevel, setDepthLevel] = useState<BookSectionDepthLevel>("moderate");
  const [citationStyle, setCitationStyle] = useState<BookSectionCitationStyle>("vancouver");
  const [includeKeyPoints, setIncludeKeyPoints] = useState(true);
  const [targetKeyword, setTargetKeyword] = useState("");
  const [metaLength, setMetaLength] = useState<SeoBlogMetaLength>("160");
  const [includeSchema, setIncludeSchema] = useState(true);
  const [includeOpenGraph, setIncludeOpenGraph] = useState(true);
  const [includeTwitterCard, setIncludeTwitterCard] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [batchTopics, setBatchTopics] = useState("");
  const [batchResult, setBatchResult] = useState("");
  const [batchRunning, setBatchRunning] = useState(false);
  // Nutrition Bot + Step 12 workflow (separate option; does not change main flow)
  const [nbTopic, setNbTopic] = useState("");
  const [nbJson, setNbJson] = useState("");
  const [nbLang, setNbLang] = useState<Step12Language>("en");
  const [nbOutput, setNbOutput] = useState<{ blog?: string; twitter?: string; handout?: string } | null>(null);
  const [nbLoading, setNbLoading] = useState(false);
  const [nbError, setNbError] = useState<string | null>(null);
  const [nbActiveTab, setNbActiveTab] = useState<"blog" | "twitter" | "handout">("blog");
  // Batch (Nutrition Bot API + fallback) – separate from single JSON paste
  const [nbBatchTopics, setNbBatchTopics] = useState("");
  const [nbBatchResult, setNbBatchResult] = useState<string | null>(null);
  const [nbBatchRunning, setNbBatchRunning] = useState(false);
  const [nbBatchError, setNbBatchError] = useState<string | null>(null);
  const [useNutritionBot, setUseNutritionBot] = useState(true);
  // Batch CSV upload + results table
  const [nbBatchCsvFile, setNbBatchCsvFile] = useState<File | null>(null);
  const [mctLoading, setMctLoading] = useState(false);
  const [mctOutput, setMctOutput] = useState<string | null>(null);
  const [blogMetadata, setBlogMetadata] = useState<{
    metaTitle: string;
    metaDescription: string;
    schemaOrg: string;
  } | null>(null);
  const [nbBatchTableResults, setNbBatchTableResults] = useState<
    Array<{
      topic: string;
      language?: string;
      audience?: string;
      formats?: string[];
      blog?: string;
      twitter?: string;
      handout?: string;
      source?: "nutrition-bot" | "local";
      posted?: boolean;
    }>
  >([]);

  const runNutritionBotWorkflow = async () => {
    setNbError(null);
    setNbOutput(null);
    const topic = nbTopic.trim();
    if (!topic) {
      setNbError("Topic is required");
      return;
    }
    let data: unknown;
    const trimmed = nbJson.trim();
    if (!trimmed) {
      setNbError("Paste Nutrition Bot JSON or plain text (e.g. calories, GI, fiber, verdict).");
      return;
    }
    try {
      data = JSON.parse(trimmed);
    } catch {
      const parsed = parseNutritionBotText(trimmed);
      data = parsed ?? null;
    }
    if (!data || typeof data !== "object") {
      setNbError("Could not parse as JSON or Nutrition Bot text. Paste JSON or text with calories, verdict, etc.");
      return;
    }
    setNbLoading(true);
    try {
      const res = await fetch("/api/step12/from-nutrition-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, nutritionData: data, language: nbLang, formats: ["blog", "twitter", "handout"] }),
      });
      const result = await res.json();
      if (!res.ok) {
        setNbError(result?.error || "Request failed");
        return;
      }
      setNbOutput(result);
    } catch (e) {
      setNbError("Request failed. Check network and try again.");
    } finally {
      setNbLoading(false);
    }
  };

  const runNutritionBotBatch = async () => {
    setNbBatchError(null);
    setNbBatchResult(null);
    const lines = nbBatchTopics
      .split(/[\r\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      setNbBatchError("Enter at least one topic (one per line or comma-separated).");
      return;
    }
    setNbBatchRunning(true);
    try {
      const res = await fetch("/api/step12/batch-nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: lines,
          language: nbLang,
          formats: ["blog", "twitter", "handout"],
          useNutritionBot,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNbBatchError(data?.error || "Batch request failed");
        return;
      }
      const results = data.results as Array<{ topic: string; blog?: string; twitter?: string; handout?: string }>;
      if (!Array.isArray(results)) {
        setNbBatchError("Invalid batch response");
        return;
      }
      const parts: string[] = [];
      for (const r of results) {
        parts.push(`========== ${r.topic} ==========`);
        if (r.blog) parts.push(`\n--- Blog ---\n${r.blog}`);
        if (r.twitter) parts.push(`\n--- Twitter ---\n${r.twitter}`);
        if (r.handout) parts.push(`\n--- Handout ---\n${r.handout}`);
        parts.push("");
      }
      setNbBatchResult(parts.join("\n"));
    } catch {
      setNbBatchError("Network error. Try again.");
    } finally {
      setNbBatchRunning(false);
    }
  };

  const copyWebsiteUrl = () => {
    navigator.clipboard?.writeText(STEP12_DEFAULT_WEBSITE_URL).then(
      () => {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      },
      () => {}
    );
  };

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

  const handleGenerate = async () => {
    setTranslateError(null);
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
        next[format] = generateHyperNatural50sScript(inputWithDefaults);
      } else if (format === "infographic") {
        next[format] = generateMobileInfographicPrompt(inputWithDefaults);
      } else if (format === "book-section") {
        next[format] = generateBookSection(text, title, {
          bookTitle,
          sectionType,
          depthLevel,
          citationStyle,
          includeKeyPoints,
          audience: input.audience,
          tone: input.tone,
        });
      } else if (format === "seo-blog") {
        next[format] = generateSeoBlog(text, title, {
          targetKeyword: targetKeyword.trim() || undefined,
          metaDescriptionLength: metaLength,
          includeSchema,
          includeOpenGraph,
          includeTwitterCard,
          audience: input.audience,
          tone: input.tone,
        });
      } else if (format === "blog") {
        const topicOnly = text.length < 200;
        if (topicOnly) {
          try {
            const res = await fetch("/api/step12/generate-blog", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                topic: title || text,
                audience: input.audience,
                language: input.language ?? "en",
              }),
            });
            const data = await res.json();
            if (res.ok && typeof data.content === "string") {
              next[format] = data.content;
            } else {
              next[format] = generateBlog(text, title, input.language, { audience: input.audience, tone: input.tone });
            }
          } catch {
            next[format] = generateBlog(text, title, input.language, { audience: input.audience, tone: input.tone });
          }
        } else {
          next[format] = generateBlog(text, title, input.language, { audience: input.audience, tone: input.tone });
        }
      } else {
        const fn = TEXT_GENERATORS[format];
        if (fn) next[format] = fn(text, title, input.language);
      }
    }

    // Generate metadata FROM the single blog output (topic-type routing is done in API)
    const blogContent = next.blog;
    if (blogContent) {
      const topicStr = title || input.topic || "";
      const keyword = topicStr.replace(/^"+|"+$/g, "").trim() || topicStr;
      setBlogMetadata({
        metaTitle: generateMetaTitle(topicStr, keyword),
        metaDescription: generateMetaDescription(blogContent, 160),
        schemaOrg: generateSchemaOrg({
          title: topicStr,
          description: generateMetaDescription(blogContent, 160),
          author: "Dr. Muddu Surendra Nehru, MD",
          datePublished: new Date().toISOString().slice(0, 10),
          website: WEBSITE_CONFIG.url,
        }),
      });
    } else {
      setBlogMetadata(null);
    }

    const lang = input.language ?? "en";
    if (lang !== "en") {
      setIsTranslating(true);
      try {
        const translated: Record<Step12TargetFormat, string> = { ...next };
        let apiError: string | null = null;
        for (const format of input.targetFormats) {
          const content = next[format];
          if (!content) continue;
          try {
            const res = await fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: content, targetLanguage: lang }),
            });
            const data = await res.json();
            if (res.ok && typeof data.translated === "string") {
              translated[format] = data.translated;
            } else if (!res.ok && typeof data.error === "string") {
              apiError = data.error;
            }
          } catch {
            // Keep original content for this format on failure
          }
        }
        if (apiError) setTranslateError(apiError);
        setOutputs(translated);
      } catch (e) {
        setTranslateError(e instanceof Error ? e.message : "Translation failed. Showing English content.");
        setOutputs(next);
      } finally {
        setIsTranslating(false);
      }
    } else {
      setOutputs(next);
    }
  };

  const buildOutputsForTopic = (text: string, title: string): Record<Step12TargetFormat, string> => {
    const inputWithDefaults: Step12Input & { websiteUrl?: string; clinic?: string } = {
      ...input,
      topic: title,
      websiteUrl: STEP12_DEFAULT_WEBSITE_URL,
      clinic: STEP12_DEFAULT_CLINIC,
    };
    const next: Record<Step12TargetFormat, string> = {} as Record<Step12TargetFormat, string>;
    for (const format of input.targetFormats) {
      if (format === "hypernatural") {
        next[format] = generateHyperNatural50sScript(inputWithDefaults);
      } else if (format === "infographic") {
        next[format] = generateMobileInfographicPrompt(inputWithDefaults);
      } else if (format === "book-section") {
        next[format] = generateBookSection(text, title, {
          bookTitle,
          sectionType,
          depthLevel,
          citationStyle,
          includeKeyPoints,
          audience: input.audience,
          tone: input.tone,
        });
      } else if (format === "seo-blog") {
        next[format] = generateSeoBlog(text, title, {
          targetKeyword: targetKeyword.trim() || undefined,
          metaDescriptionLength: metaLength,
          includeSchema,
          includeOpenGraph,
          includeTwitterCard,
          audience: input.audience,
          tone: input.tone,
        });
      } else if (format === "blog") {
        next[format] = generateBlog(text, title, input.language, { audience: input.audience, tone: input.tone });
      } else {
        const fn = TEXT_GENERATORS[format];
        if (fn) next[format] = fn(text, title, input.language);
      }
    }
    return next;
  };

  const handleBatchGenerate = async () => {
    const lines = batchTopics
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      setTranslateError("Enter at least one topic (one per line).");
      return;
    }
    setTranslateError(null);
    setBatchRunning(true);
    setBatchResult("");
    const lang = input.language ?? "en";
    const parts: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const topic = lines[i];
      const text = extractPlainText(topic);
      const title = topic;
      const fallbackNext = buildOutputsForTopic(text, title);
      let next: Record<Step12TargetFormat, string> = {} as Record<Step12TargetFormat, string>;
      for (const format of input.targetFormats) {
        if (format === "blog") {
          try {
            const res = await fetch("/api/step12/generate-blog", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ topic: title, audience: input.audience, language: lang }),
            });
            const data = await res.json();
            if (res.ok && typeof data.content === "string") next[format] = data.content;
            else next[format] = fallbackNext[format];
          } catch {
            next[format] = fallbackNext[format];
          }
        } else {
          next[format] = fallbackNext[format];
        }
      }
      if (lang !== "en") {
        const translated: Record<Step12TargetFormat, string> = { ...next };
        for (const format of input.targetFormats) {
          const content = next[format];
          if (!content) continue;
          try {
            const res = await fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: content, targetLanguage: lang }),
            });
            const data = await res.json();
            if (res.ok && typeof data.translated === "string") translated[format] = data.translated;
          } catch {
            // keep original
          }
        }
        next = translated;
      }
      parts.push(`========== Topic: ${topic} ==========`);
      for (const format of input.targetFormats) {
        const out = next[format];
        if (out) parts.push(`\n--- ${FORMAT_LABELS[format] ?? format} ---\n${out}`);
      }
      parts.push("");
    }
    setBatchResult(parts.join("\n"));
    setBatchRunning(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">{formatStep12Label()}</h1>
        <p className="text-gray-600 text-sm">Topic-agnostic. No research data. Choose source, formats, audience, tone.</p>
      </div>

      {/* Nutrition Bot + Step 12 – separate workflow; does not affect main generator */}
      <div className="mb-8 rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-emerald-900 mb-1">Nutrition Bot + Step 12 Workflow</h2>
        <p className="text-sm text-emerald-800/90 mb-4">
          Paste Nutrition Bot JSON (ghee, papaya, brown poha, etc.) + topic → get Blog, Twitter, Handout with link auto-injected.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <input
              value={nbTopic}
              onChange={(e) => setNbTopic(e.target.value)}
              placeholder="e.g. Ghee and Diabetes"
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nutrition Bot JSON or plain text</label>
            <textarea
              value={nbJson}
              onChange={(e) => setNbJson(e.target.value)}
              placeholder='JSON: {"foodName":"Ghee","calories":112,...} or paste plain text (Calories: 210, SAFE FOR DIABETES, etc.)'
              className="w-full p-2 border border-gray-300 rounded text-sm font-mono min-h-[100px]"
              rows={4}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Language:</span>
            {(["en", "hi", "te", "ta"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setNbLang(l)}
                className={`px-3 py-1.5 rounded border text-sm ${nbLang === l ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-gray-300 text-gray-700"}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
            <button
              type="button"
              onClick={runNutritionBotWorkflow}
              disabled={nbLoading}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium text-sm disabled:opacity-50"
            >
              {nbLoading ? "Generating…" : "Generate content"}
            </button>
          </div>
          {nbError && <p className="text-sm text-red-600">{nbError}</p>}
          {nbOutput && (
            <div className="mt-3 border border-emerald-200 rounded-lg bg-white p-3">
              <div className="flex gap-2 mb-2 border-b border-gray-200">
                {nbOutput.blog && <button type="button" onClick={() => setNbActiveTab("blog")} className={`px-3 py-1.5 text-sm rounded ${nbActiveTab === "blog" ? "bg-emerald-100 font-medium" : ""}`}>Blog</button>}
                {nbOutput.twitter && <button type="button" onClick={() => setNbActiveTab("twitter")} className={`px-3 py-1.5 text-sm rounded ${nbActiveTab === "twitter" ? "bg-emerald-100 font-medium" : ""}`}>Twitter</button>}
                {nbOutput.handout && <button type="button" onClick={() => setNbActiveTab("handout")} className={`px-3 py-1.5 text-sm rounded ${nbActiveTab === "handout" ? "bg-emerald-100 font-medium" : ""}`}>Handout</button>}
              </div>
              <pre className="text-xs overflow-auto max-h-[320px] p-2 bg-gray-50 rounded whitespace-pre-wrap font-sans">
                {nbActiveTab === "blog" && nbOutput.blog}
                {nbActiveTab === "twitter" && nbOutput.twitter}
                {nbActiveTab === "handout" && nbOutput.handout}
              </pre>
              <button
                type="button"
                onClick={() => {
                  const text = nbOutput[nbActiveTab];
                  if (text) navigator.clipboard?.writeText(text);
                }}
                className="mt-2 text-sm text-emerald-700 hover:underline"
              >
                Copy to clipboard
              </button>
            </div>
          )}
        </div>

        {/* Batch: Nutrition Bot API + fallback (CSV / one per line) */}
        <div className="mt-6 pt-4 border-t border-emerald-200">
          <h3 className="text-sm font-semibold text-emerald-900 mb-2">Batch content (Nutrition Bot API + fallback)</h3>
          <p className="text-xs text-emerald-800/90 mb-2">
            One topic per line (e.g. ghee diabetes, papaya diabetes). Calls Nutrition Bot API; on failure uses local food-facts. Link auto-injected.
          </p>
          <textarea
            value={nbBatchTopics}
            onChange={(e) => setNbBatchTopics(e.target.value)}
            placeholder={"ghee diabetes\npapaya diabetes\nbrown poha diabetes"}
            className="w-full p-2 border border-gray-300 rounded text-sm min-h-[80px]"
            rows={3}
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => void runNutritionBotBatch()}
              disabled={nbBatchRunning}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium text-sm disabled:opacity-50"
            >
              {nbBatchRunning ? "Generating batch…" : "Generate batch"}
            </button>
            {nbBatchError && <span className="text-sm text-red-600">{nbBatchError}</span>}
          </div>
          {nbBatchResult && (
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex gap-2">
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(nbBatchResult)}`}
                  download={`step12-nutrition-batch-${new Date().toISOString().slice(0, 10)}.txt`}
                  className="text-sm text-emerald-700 hover:underline"
                >
                  Download batch
                </a>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(nbBatchResult)}
                  className="text-sm text-emerald-700 hover:underline"
                >
                  Copy all
                </button>
              </div>
              <pre className="text-xs overflow-auto max-h-[240px] p-2 bg-white border border-emerald-200 rounded whitespace-pre-wrap">
                {nbBatchResult}
              </pre>
            </div>
          )}
        </div>
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

        {/* === MCT Evidence: below Topic; always visible (don't destroy success) === */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">🔬 PubMed Evidence Mode (Optional)</h4>
            <p className="text-sm text-blue-700 mb-3">
              Generate neutral, PubMed-checked content for MCT-related topics. Result is filled into Blog, Twitter, and Handout so you can use it for all.
              <br />
              <span className="text-xs">• Public PubMed API only • No patient data • Fallback if unavailable</span>
            </p>
            <button
              type="button"
              onClick={async () => {
                const topic = input.topic?.trim() || "MCT metabolic health";
                setMctLoading(true);
                setMctOutput(null);
                try {
                  const audience = input.audience === "patients" || input.audience === "doctors" || input.audience === "general" ? input.audience : "general";
                  const lang = (input.language ?? "en") as "en" | "hi" | "te" | "ta";
                  const contentBlog = await generateMCTContent({ topic, language: lang, audience, outputFormat: "blog" });
                  const contentTwitter = await generateMCTContent({ topic, language: lang, audience, outputFormat: "twitter" });
                  const contentHandout = await generateMCTContent({ topic, language: lang, audience, outputFormat: "handout" });
                  setOutputs((prev) => ({
                    ...prev,
                    blog: contentBlog,
                    twitter: contentTwitter,
                    handout: contentHandout,
                  }));
                  setMctOutput(contentBlog);
                } catch (e) {
                  console.warn("MCT content generation failed", e);
                  setMctOutput(null);
                } finally {
                  setMctLoading(false);
                }
              }}
              disabled={mctLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {mctLoading ? "Generating…" : "Generate PubMed-Checked MCT Content"}
            </button>
            {mctOutput && (
              <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
                <h5 className="text-sm font-semibold text-blue-900 mb-2">Generated content (copy-paste ready) — use in Blog / Twitter / Handout below</h5>
                <pre className="text-xs overflow-auto max-h-[320px] p-3 bg-gray-50 rounded whitespace-pre-wrap font-sans border border-gray-200">
                  {mctOutput}
                </pre>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(mctOutput)}
                  className="mt-2 text-sm text-blue-700 hover:underline"
                >
                  Copy to clipboard
                </button>
              </div>
            )}
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

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output Language
          </label>
          <div className="flex flex-wrap gap-2">
            {STEP12_LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                type="button"
                onClick={() => setInput((i) => ({ ...i, language: lang.value }))}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  (input.language ?? "en") === lang.value
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-indigo-300"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          {(input.language ?? "en") !== "en" && (
            <p className="text-xs text-gray-500 mt-1">
              ℹ️ AI-powered translation (English fallback for technical terms)
            </p>
          )}
        </div>

        <div className="mb-6">
          <FormatSelector
            value={input.targetFormats}
            onChange={(targetFormats) => setInput((i) => ({ ...i, targetFormats }))}
          />
        </div>

        {input.targetFormats.includes("book-section") && (
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h4 className="font-semibold text-indigo-900 mb-3">Book Section Settings</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="New Concepts in Diabetes"
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Type</label>
                <select
                  value={sectionType}
                  onChange={(e) => setSectionType(e.target.value as BookSectionSectionType)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                >
                  <option value="chapter">Chapter (1500-2500 words)</option>
                  <option value="sub-chapter">Sub-chapter (800-1200 words)</option>
                  <option value="short">Short section (400-600 words)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level of Depth</label>
                <select
                  value={depthLevel}
                  onChange={(e) => setDepthLevel(e.target.value as BookSectionDepthLevel)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                >
                  <option value="introductory">Introductory (for students/patients)</option>
                  <option value="moderate">Moderate (for clinicians)</option>
                  <option value="advanced">Advanced (for specialists)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Citation Style</label>
                <select
                  value={citationStyle}
                  onChange={(e) => setCitationStyle(e.target.value as BookSectionCitationStyle)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                >
                  <option value="vancouver">Vancouver (numbered)</option>
                  <option value="narrative">Narrative (author-year, no numbering)</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="keyPoints"
                checked={includeKeyPoints}
                onChange={(e) => setIncludeKeyPoints(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="keyPoints" className="text-sm text-gray-700">
                Include &quot;Key Points&quot; box (5 bullets)
              </label>
            </div>
          </div>
        )}

        {input.targetFormats.includes("seo-blog") && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">SEO Settings</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Keyword</label>
                <input
                  type="text"
                  value={targetKeyword}
                  onChange={(e) => setTargetKeyword(e.target.value)}
                  placeholder="e.g., TyG index diabetes India"
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description Length</label>
                <select
                  value={metaLength}
                  onChange={(e) => setMetaLength(e.target.value as SeoBlogMetaLength)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                >
                  <option value="150">~150 chars (Google snippet)</option>
                  <option value="160">~160 chars (optimal)</option>
                  <option value="300">~300 chars (social preview)</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs font-medium text-gray-600">Include:</span>
              <label className="flex items-center gap-1 text-xs text-gray-700">
                <input type="checkbox" checked={includeSchema} onChange={(e) => setIncludeSchema(e.target.checked)} className="rounded border-gray-300" />
                Schema.org JSON-LD
              </label>
              <label className="flex items-center gap-1 text-xs text-gray-700">
                <input type="checkbox" checked={includeOpenGraph} onChange={(e) => setIncludeOpenGraph(e.target.checked)} className="rounded border-gray-300" />
                Open Graph tags
              </label>
              <label className="flex items-center gap-1 text-xs text-gray-700">
                <input type="checkbox" checked={includeTwitterCard} onChange={(e) => setIncludeTwitterCard(e.target.checked)} className="rounded border-gray-300" />
                Twitter Card
              </label>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <input
              type="checkbox"
              checked={batchMode}
              onChange={(e) => setBatchMode(e.target.checked)}
              className="rounded border-gray-300"
            />
            Batch mode (multiple topics)
          </label>
          {batchMode && (
            <div className="mt-3 space-y-2">
              <label className="block text-xs font-medium text-gray-600">Batch topics (one per line, e.g. for 30-day content)</label>
              <textarea
                value={batchTopics}
                onChange={(e) => setBatchTopics(e.target.value)}
                placeholder={"Role of Ghee in Diabetes\nTyG Index and heart health\nFasting glucose tips"}
                className="w-full p-2 border border-gray-300 rounded text-sm min-h-[100px]"
                rows={4}
              />
              <button
                type="button"
                onClick={() => void handleBatchGenerate()}
                disabled={batchRunning || input.targetFormats.length === 0}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {batchRunning ? "Generating batch…" : "Generate batch"}
              </button>
            </div>
          )}
        </div>

        <AudienceToneSelectors
          audience={input.audience}
          tone={input.tone}
          onAudienceChange={(audience) => setInput((i) => ({ ...i, audience }))}
          onToneChange={(tone) => setInput((i) => ({ ...i, tone }))}
        />

        {translateError && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {translateError}
          </p>
        )}
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={isTranslating}
          className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isTranslating ? `Translating to ${STEP12_LANGUAGES.find((l) => l.value === (input.language ?? "en"))?.name ?? input.language}…` : "Generate"}
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

      {batchResult && (
        <div className="space-y-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-xl font-bold text-indigo-900">Batch results</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([batchResult], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `step12-batch-${new Date().toISOString().slice(0, 10)}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Download batch
                </button>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(batchResult)}
                  className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Copy all
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-50 rounded border text-sm whitespace-pre-wrap font-sans max-h-[500px] overflow-y-auto">
              {batchResult}
            </pre>
          </div>
        </div>
      )}

      <CollaborationTrackerCard />

      <div className="mt-6 rounded-xl border-2 border-violet-200 bg-violet-50/80 p-4">
        <h2 className="text-lg font-bold text-violet-900 mb-2">🎬 Patient review / testimonials</h2>
        <p className="text-sm text-violet-800 mb-3">
          Generate patient testimonial scripts and the 45s HOMA video brief (Shorts/Reels). Warm, personal tone only — never mixed with clinical content.
        </p>
        <Link
          href="/ai/testimonials"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          Open Patient Review Generator →
        </Link>
      </div>

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
        <div className="flex flex-wrap items-center justify-center gap-2">
          <a
            href={STEP12_DEFAULT_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
          >
            Visit Dr. Muddu&apos;s Metabolic Care (HOMA Clinic) →
          </a>
          <button
            type="button"
            onClick={copyWebsiteUrl}
            className="inline-block px-4 py-2 rounded-lg bg-white border-2 border-amber-500 text-amber-800 font-medium hover:bg-amber-100"
          >
            {copiedUrl ? "Copied!" : "Copy Website URL"}
          </button>
        </div>
        <p className="text-xs text-amber-800 mt-2">Universal link in every generated output: {STEP12_DEFAULT_WEBSITE_URL}</p>
      </div>
    </div>
  );
}
