/*
 * SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - No hardcoded medical terms (TyG, HbA1c, etc.) – all via input
 * - Topic-agnostic: works for ANY medical topic
 * - If Step 12 extensions are deleted, Steps 1-6 work 100%
 */
/**
 * Step 12 – Short WhatsApp CTA for video/share. Imports ONLY from @/lib/utils/step12.
 * Compact one-line style. Includes clickable website URL for traffic.
 */

import { extractPlainText, extractSnippet, STEP12_DEFAULT_WEBSITE_URL } from "@/lib/utils/step12";

const DEFAULT_WEBSITE_URL = STEP12_DEFAULT_WEBSITE_URL;

function extractKeyTerm(topic: string): string {
  return topic.trim().split(/\s+/)[0] || "this";
}

/** Generate compact WhatsApp CTA (topic + Like/Comment/Share + book screening URL). */
export function generateWhatsAppCTA(
  topic: string,
  websiteUrl: string = DEFAULT_WEBSITE_URL
): string {
  const keyTerm = extractKeyTerm(topic);
  const raw = `
🔥 Watch: ${keyTerm} – evidence-based guide
Like ✅ Comment 👇 Share ➡️
Book screening: ${websiteUrl}
`.trim();
  return raw.replace(/\s+/g, " ");
}

/** Step 12 format: (sourceText, title?) → CTA string. */
export function generateWhatsappCta(sourceText: string, title?: string): string {
  const fallback = extractSnippet(extractPlainText(sourceText), 40) || "this video";
  const topic = title ?? fallback;
  return generateWhatsAppCTA(topic, DEFAULT_WEBSITE_URL);
}
