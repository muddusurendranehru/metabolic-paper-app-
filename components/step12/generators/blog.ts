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
 * Imports ONLY from @/lib/utils/step12. Topic-agnostic; no patientData.
 */

import { extractPlainText, extractSnippet } from "@/lib/utils/step12";
import { formatSection, formatDocument } from "@/lib/utils/step12";

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

export function generateBlog(sourceText: string, title?: string): string {
  const text = extractPlainText(sourceText);
  const summary = extractSnippet(text, 160);
  const sectionTitle = title ?? "Summary";
  const seoBlock = buildSeoBlock(sectionTitle, summary);
  const sections = [
    formatSection(sectionTitle, summary),
    formatSection("Details", text || "(No content)"),
  ];
  const body = formatDocument(sections);
  return seoBlock + "\n\n" + body;
}
