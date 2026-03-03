/*
 * SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - No hardcoded medical terms (TyG, HbA1c, etc.) – all via input
 * - Topic-agnostic: works for ANY medical topic
 * - If Step 12 extensions are deleted, Steps 1-6 work 100%
 */
/**
 * Step 12 – blog content generator (single blog with SEO metadata).
 * Imports from @/lib/utils/step12 and components/step12/utils. Topic-agnostic; no patientData.
 * Uses getTranslation for section labels; injectWebsiteLink for footer.
 */

import {
  extractPlainText,
  extractSnippet,
  formatSection,
  formatDocument,
  getWebsiteLinkLine,
  type Step12Language,
} from "@/lib/utils/step12";
import { getTranslation } from "../utils/translations";
import { injectWebsiteLink } from "../utils/website-injectors";

/** Build SEO metadata block (title, description, keywords) for the same blog content. */
function buildSeoBlock(title: string, summary: string): string {
  const metaTitle = title ? title.slice(0, 60) : "Medical & Health Insights";
  const metaDesc = summary.slice(0, 160);
  const words = (title + " " + summary).replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  const seen = new Set<string>();
  const keywords = words.filter((w) => w.length > 3 && !seen.has(w.toLowerCase()) && seen.add(w.toLowerCase())).slice(0, 8).join(", ");
  return [
    "---",
    "title: " + metaTitle,
    "description: " + metaDesc,
    "keywords: " + (keywords || metaTitle),
    "---",
  ].join("\n");
}

export function generateBlog(sourceText: string, title?: string, language?: Step12Language): string {
  const lang = language ?? "en";
  const t = (key: string) => getTranslation(lang, key);
  const text = extractPlainText(sourceText);
  const summary = extractSnippet(text, 160);
  const sectionTitle = title ?? "Summary";
  const seoBlock = buildSeoBlock(sectionTitle, summary);
  const linkLine = getWebsiteLinkLine({ language: lang, format: "plain" });

  const sections = [
    formatSection(sectionTitle, summary),
    formatSection(t("introduction"), extractSnippet(text, 300) || summary || "(No content)"),
    formatSection(t("methods"), extractSnippet(text, 250) || "(No content)"),
    formatSection(t("results"), extractSnippet(text, 250) || "(No content)"),
    formatSection(t("keyFindings"), extractSnippet(text, 400) || "(No content)"),
    formatSection(t("discussion"), extractSnippet(text, 300) || "(No content)"),
    formatSection(t("conclusion"), extractSnippet(text, 200) || "(No content)"),
    formatSection(t("learnMore"), linkLine),
  ];
  const body = formatDocument(sections);
  const content = seoBlock + "\n\n" + body;

  return injectWebsiteLink(content, lang);
}
