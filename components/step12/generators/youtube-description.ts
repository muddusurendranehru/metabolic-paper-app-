/**
 * Step 12 – YouTube description generator. Imports ONLY from @/lib/utils/step12.
 * Topic-agnostic; mobile-friendly; CTA to default website.
 */

import type { Step12Input } from "@/lib/utils/step12";
import { extractPlainText, extractSnippet, formatSection, formatDocument } from "@/lib/utils/step12";
import { STEP12_DEFAULT_WEBSITE_URL } from "@/lib/utils/step12";

function getSourceText(input: Step12Input): string {
  const raw =
    input.sourceType === "from-scratch"
      ? input.topic
      : (input.pastedText ?? input.topic ?? "");
  return extractPlainText(raw) || input.topic || "";
}

/**
 * Generate a YouTube video description. Includes topic, key points, timestamps placeholder, CTA.
 */
export function generateYoutubeDescription(input: Step12Input): string {
  const sourceText = getSourceText(input);
  const topic = input.topic || "Medical education";
  const summary = extractSnippet(sourceText, 300) || "Evidence-based overview of the topic.";
  const url = STEP12_DEFAULT_WEBSITE_URL;

  const sections = [
    formatSection(null, summary),
    formatSection("Timestamps", "0:00 Introduction\n0:30 Key points\n... (add your timestamps)"),
    formatSection("Resources & visit", `Learn more: ${url}`),
    formatSection("Disclaimer", "For educational purposes. Not medical advice. Consult your doctor."),
  ];

  return formatDocument([`# ${topic}\n`, ...sections]);
}
