/*
 * SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - No hardcoded medical terms (TyG, HbA1c, etc.) – all via input
 * - Topic-agnostic: works for ANY medical topic
 * - If Step 12 extensions are deleted, Steps 1-6 work 100%
 */
/**
 * Step 12 – social post generators. Imports ONLY from @/lib/utils/step12.
 */

import { extractPlainText, extractSnippet } from "@/lib/utils/step12";

export function generateSocial(sourceText: string): string {
  const text = extractPlainText(sourceText);
  return extractSnippet(text, 280) || "(No content)";
}

export function generateTwitter(sourceText: string): string {
  const text = extractPlainText(sourceText);
  return extractSnippet(text, 280) || "(No content)";
}

export function generateLinkedin(sourceText: string): string {
  const text = extractPlainText(sourceText);
  return extractSnippet(text, 1300) || "(No content)";
}

export function generateWhatsapp(sourceText: string): string {
  const text = extractPlainText(sourceText);
  return extractSnippet(text, 256) || "(No content)";
}
