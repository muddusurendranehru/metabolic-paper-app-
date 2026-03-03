/*
 * SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - No hardcoded medical terms (TyG, HbA1c, etc.) – all via input
 * - Topic-agnostic: works for ANY medical topic
 * - If Step 12 extensions are deleted, Steps 1-6 work 100%
 */
/**
 * Step 12 – YouTube script generator. Imports ONLY from @/lib/utils/step12.
 */

import { extractPlainText, extractSnippet, formatSection, formatDocument, STEP12_CONSTANTS } from "@/lib/utils/step12";

export function generateYoutube(sourceText: string, title?: string): string {
  const text = extractPlainText(sourceText);
  const hook = extractSnippet(text, 80);
  const url = STEP12_CONSTANTS.WEBSITE_URL;
  const cta = `Subscribe for more. ${STEP12_CONSTANTS.WEBSITE_LABEL}: ${url}`;
  const sections = [
    formatSection("Hook (0–15s)", hook || "Introduce the topic."),
    formatSection("Main (15–45s)", text || "(Key message)"),
    formatSection("CTA (45–60s)", cta),
  ];
  return formatDocument(sections);
}
