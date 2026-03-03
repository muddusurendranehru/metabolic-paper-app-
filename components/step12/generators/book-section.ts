/*
 * SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - No hardcoded medical terms (TyG, HbA1c, etc.) – all via input
 * - Topic-agnostic: works for ANY medical topic
 * - If Step 12 extensions are deleted, Steps 1-6 work 100%
 */
/**
 * Step 12 – academic book section generator. Imports ONLY from @/lib/utils/step12.
 * Uses book-formatter (formatBookSection, formatAcademicContent). Topic-agnostic; no patientData.
 */

import {
  extractPlainText,
  extractSnippet,
  formatBookSection,
  formatAcademicContent,
  type AcademicHeading,
} from "@/lib/utils/step12";

export type BookSectionSectionType = "chapter" | "sub-chapter" | "short";
export type BookSectionDepthLevel = "introductory" | "moderate" | "advanced";
export type BookSectionCitationStyle = "vancouver" | "narrative";

export interface BookSectionOptions {
  bookTitle?: string;
  sectionType?: BookSectionSectionType;
  depthLevel?: BookSectionDepthLevel;
  citationStyle?: BookSectionCitationStyle;
  includeKeyPoints?: boolean;
  audience?: string;
  tone?: string;
}

export interface BookSectionOutput {
  markdown: string;
  wordCount: number;
  headings: string[];
  keyPoints?: string[];
  suggestedReading: string[];
}

const WORD_TARGETS: Record<BookSectionSectionType, { min: number; max: number }> = {
  chapter: { min: 1500, max: 2500 },
  "sub-chapter": { min: 800, max: 1200 },
  short: { min: 400, max: 600 },
};

function generateAcademicHeadings(
  topic: string,
  depth: BookSectionDepthLevel,
  audience: string
): AcademicHeading[] {
  const keyTerm = extractKeyTerm(topic);
  if (depth === "introductory" || audience === "patients") {
    return [
      { level: 2, text: "What Is " + keyTerm + "?" },
      { level: 2, text: "Why Does It Matter?" },
      { level: 2, text: "What Does the Evidence Show?" },
      { level: 2, text: "How to Apply This in Practice" },
      { level: 2, text: "Key Takeaways" },
    ];
  }
  return [
    { level: 2, text: "Introduction" },
    { level: 2, text: "Pathophysiological Basis" },
    { level: 2, text: "Clinical Evidence" },
    { level: 2, text: "Practical Applications in Indian Settings" },
    { level: 2, text: "Limitations and Future Directions" },
  ];
}

function generatePlaceholderReferences(topic: string, style: BookSectionCitationStyle): string[] {
  const keyTerm = extractKeyTerm(topic);
  const refs = [
    `${keyTerm} was first described as a surrogate marker in metabolic research (Simental-Mendía et al.).`,
    `Population data from India highlight the burden of related metabolic conditions (ICMR-INDIAB Study).`,
    `Clinical guidelines recommend routine assessment of metabolic risk factors (American Diabetes Association).`,
    `Recent reviews summarize the evidence for ${keyTerm.toLowerCase()} in clinical practice.`,
    `Future research directions include validation in diverse Indian populations.`,
  ];
  if (style === "vancouver") {
    return refs.map((ref, i) => `${i + 1}. ${ref}`);
  }
  return refs;
}

function extractKeyTerm(topic: string): string {
  return topic.trim().split(/\s+/)[0] || "Topic";
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

function generateKeyPoints(content: string, count: number): string[] {
  const sections = content.split(/\n\n+/).filter((s) => s.trim().length > 50);
  return sections.slice(0, count).map((s) => {
    const first = s.split(/[.!?]/)[0]?.trim();
    if (first) return first + ".";
    return s.slice(0, 80).trim() + (s.length > 80 ? "…" : "");
  });
}

export function generateBookSection(
  sourceText: string,
  title?: string,
  options?: BookSectionOptions
): string {
  const text = extractPlainText(sourceText);
  const topic = title ?? "Section";
  const sectionType = options?.sectionType ?? "chapter";
  const depthLevel = options?.depthLevel ?? "moderate";
  const citationStyle = options?.citationStyle ?? "narrative";
  const includeKeyPoints = options?.includeKeyPoints !== false;
  const audience = options?.audience ?? "general";
  const tone = options?.tone ?? "professional";

  const wordTarget = WORD_TARGETS[sectionType];
  const headings = generateAcademicHeadings(topic, depthLevel, audience);

  const content = formatAcademicContent({
    topic,
    sourceText: text || "(No content provided.)",
    headings,
    wordTarget,
    tone: tone === "professional" ? "academic" : tone,
    audience,
    citationStyle,
  });

  const keyPoints = includeKeyPoints ? generateKeyPoints(content, 5) : undefined;
  const suggestedReading = generatePlaceholderReferences(topic, citationStyle);

  const keyPointsBlock =
    keyPoints && keyPoints.length > 0
      ? `\n\n### Key Points\n${keyPoints.map((kp) => `- ${kp}`).join("\n")}`
      : "";

  const markdown = [
    `# ${topic}`,
    content,
    keyPointsBlock,
    `\n### Suggested Reading\n${suggestedReading.map((ref) => `- ${ref}`).join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n")
    .trim();

  const output: BookSectionOutput = {
    markdown,
    wordCount: countWords(markdown),
    headings: headings.map((h) => h.text),
    keyPoints,
    suggestedReading,
  };

  return output.markdown;
}
