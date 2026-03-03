/*
 * SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - No hardcoded medical terms (TyG, HbA1c, etc.) – all via input
 * - Topic-agnostic: works for ANY medical topic
 * - If Step 12 extensions are deleted, Steps 1-6 work 100%
 */
/**
 * Step 12 – multi-format content generator. Imports ONLY from @/lib/utils/step12 and local generators.
 * Topic-agnostic: NO hardcoded TyG/HbA1c/Waist, NO research metrics, NO patient data.
 * Video: 60–90s script + AI prompt for Grok/HyperNatural (scene-by-scene).
 */

import type { Step12Input } from "@/lib/utils/step12";
import {
  extractPlainText,
  extractSnippet,
  formatSection,
  formatBullets,
  formatDocument,
  STEP12_CONSTANTS,
} from "@/lib/utils/step12";
import { generateBlog } from "./blog";
import { generateHandout } from "./handout";
import { generateMcqGenerator } from "./mcq-generator";

/** Output of generateAllFormats – one entry per required format. */
export interface Step12AllFormats {
  blog: string;
  twitterThread: string;
  linkedin: string;
  handout: string;
  youtubeScript: string;
  youtubeAIPrompt: string;
  mcq: string;
  whatsapp: string;
}

/** Get source text from Step12Input (topic or pasted/uploaded text). No patientData. */
function getSourceText(input: Step12Input): string {
  const raw =
    input.sourceType === "from-scratch"
      ? input.topic
      : (input.pastedText ?? input.topic ?? "");
  return extractPlainText(raw) || input.topic || "";
}

const WEBSITE_LINE = `${STEP12_CONSTANTS.WEBSITE_LABEL}: ${STEP12_CONSTANTS.WEBSITE_URL}`;

/** Split text into tweets (max 7, each ≤280 chars). Last tweet includes website link. No invented metrics. */
function toTwitterThread(text: string, maxTweets: number = 7): string {
  const t = extractPlainText(text);
  if (!t) return "(No content)\n\n" + WEBSITE_LINE;
  const maxLen = 280;
  const tweets: string[] = [];
  let rest = t;
  while (rest && tweets.length < maxTweets) {
    if (rest.length <= maxLen) {
      tweets.push(rest.trim());
      break;
    }
    const chunk = rest.slice(0, maxLen);
    const lastSpace = chunk.lastIndexOf(" ");
    const cut = lastSpace > maxLen * 0.5 ? lastSpace : maxLen;
    tweets.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  const withLink = tweets.length > 0 ? [...tweets.slice(0, -1), tweets[tweets.length - 1] + "\n\n" + WEBSITE_LINE] : [WEBSITE_LINE];
  return withLink.map((s, i) => `Tweet ${i + 1}: ${s}`).join("\n\n");
}

/** LinkedIn article ~300 words (~1500 chars). Neutral, evidence-based. Includes website link. */
function toLinkedinArticle(text: string, title?: string): string {
  const t = extractPlainText(text);
  const body = extractSnippet(t, 1480) || "Key points from the topic.";
  const heading = title ? `## ${title}\n\n` : "";
  return `${heading}${body}\n\n${WEBSITE_LINE}`.trim();
}

/** Blog: target 800–1200 words when source is long; structured sections from source. */
function toBlogPost(sourceText: string, title?: string): string {
  return generateBlog(sourceText, title);
}

/** Patient handout: 1-page style (key points). */
function toHandout(sourceText: string, title?: string): string {
  return generateHandout(sourceText, title);
}

/** YouTube script 60–90s: hook → problem → science → solution → CTA. No invented p/r/n values. Includes website link. */
function toYoutubeScript(sourceText: string, title?: string): string {
  const t = extractPlainText(sourceText);
  const hook = extractSnippet(t, 80) || "Introduce the topic.";
  const main = extractSnippet(t, 600) || "Studies show relevant evidence. Discuss key points.";
  const cta = `Subscribe for more. ${WEBSITE_LINE}`;
  const sections = [
    formatSection("Hook (0–15s)", hook),
    formatSection("Problem (15–25s)", "Briefly state the issue or question."),
    formatSection("Science (25–50s)", main),
    formatSection("Solution (50–75s)", "Summarize takeaway. Use 'studies show' where appropriate."),
    formatSection("CTA (75–90s)", cta),
  ];
  return formatDocument([formatSection(title ?? "YouTube Script (60–90s)", ""), ...sections]);
}

/** AI video prompt for Grok/HyperNatural: scene-by-scene visual descriptions. No metrics. Includes website in CTA. */
function toYoutubeAIPrompt(sourceText: string, title?: string): string {
  const t = extractPlainText(sourceText);
  const topic = title || extractSnippet(t, 60) || "Medical education topic";
  const scenes = [
    "Scene 1: Presenter or narrator on neutral background; friendly, professional tone.",
    "Scene 2: Simple graphic or text card with the main topic title.",
    "Scene 3: B-roll or illustration showing the problem or question (no data charts unless user-provided).",
    "Scene 4: Clear explanation visuals; use 'studies show' style, no specific p-values or r-values.",
    "Scene 5: Summary card with 1–2 takeaway points.",
    `Scene 6: CTA – subscribe, show link: ${STEP12_CONSTANTS.WEBSITE_URL}. Clean, minimal.`,
  ];
  const intro = `AI Video Prompt (Grok/HyperNatural)\nTopic: ${topic}\nTone: Educational, evidence-based. No invented statistics.\n\n`;
  return intro + formatBullets(scenes);
}

/** MCQ: 3 multiple choice questions from source + topic. */
function toMcq(sourceText: string, title?: string): string {
  return generateMcqGenerator(sourceText, title);
}

/** WhatsApp: short message + website link. */
function toWhatsapp(sourceText: string): string {
  const t = extractPlainText(sourceText);
  const msg = extractSnippet(t, 180) || "(No content)";
  return msg.trim() + "\n\n" + WEBSITE_LINE;
}

/**
 * Generate all 7 formats from a single Step12Input.
 * Content is topic-agnostic; no hardcoded research terms, no patient data, no invented metrics.
 */
export function generateAllFormats(input: Step12Input): Step12AllFormats {
  const sourceText = getSourceText(input);
  const title = input.topic || undefined;

  return {
    blog: toBlogPost(sourceText, title),
    twitterThread: toTwitterThread(sourceText),
    linkedin: toLinkedinArticle(sourceText, title),
    handout: toHandout(sourceText, title),
    youtubeScript: toYoutubeScript(sourceText, title),
    youtubeAIPrompt: toYoutubeAIPrompt(sourceText, title),
    mcq: toMcq(sourceText, title),
    whatsapp: toWhatsapp(sourceText),
  };
}
