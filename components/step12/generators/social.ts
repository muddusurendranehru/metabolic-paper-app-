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
 * Every output includes the Step 12 website link. Supports multi-language link label.
 */

import { extractPlainText, extractSnippet, getWebsiteLinkLine, type Step12Language } from "@/lib/utils/step12";

function withWebsiteSuffix(
  content: string,
  maxContentLen: number,
  language?: Step12Language
): string {
  const line = getWebsiteLinkLine({ language: language ?? "en", format: "plain" });
  const trimmed = (content || "(No content)").trim().slice(0, maxContentLen);
  return trimmed + "\n\n" + line;
}

export function generateSocial(sourceText: string, _title?: string, language?: Step12Language): string {
  const text = extractPlainText(sourceText);
  return withWebsiteSuffix(extractSnippet(text, 260) || "(No content)", 260, language);
}

export function generateTwitter(sourceText: string, _title?: string, language?: Step12Language): string {
  const text = extractPlainText(sourceText);
  const line = getWebsiteLinkLine({ language: language ?? "en", format: "plain" });
  const suffixLen = line.length + 2;
  return withWebsiteSuffix(extractSnippet(text, Math.max(0, 280 - suffixLen)) || "(No content)", 280 - suffixLen, language);
}

export function generateLinkedin(sourceText: string, _title?: string, language?: Step12Language): string {
  const text = extractPlainText(sourceText);
  return withWebsiteSuffix(extractSnippet(text, 1280) || "(No content)", 1280, language);
}

export function generateWhatsapp(sourceText: string, _title?: string, language?: Step12Language): string {
  const text = extractPlainText(sourceText);
  return withWebsiteSuffix(extractSnippet(text, 220) || "(No content)", 220, language);
}
