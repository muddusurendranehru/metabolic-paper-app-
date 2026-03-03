/**
 * Step 12 – structure academic book content. Isolated in lib/utils/step12/.
 * No patientData; topic-agnostic. For use by book-section generator.
 */

import { formatSection, formatBullets, formatDocument } from "./content-formatter";

export interface BookSectionInput {
  sectionTitle: string;
  introduction: string;
  keyPoints: string[];
  summary: string;
  referencesPlaceholder?: string;
}

export interface AcademicHeading {
  level: number;
  text: string;
}

export interface FormatAcademicContentInput {
  topic: string;
  sourceText: string;
  headings: AcademicHeading[];
  wordTarget?: { min: number; max: number };
  tone?: string;
  audience?: string;
  citationStyle?: string;
}

/**
 * Format academic content from topic + source text distributed across headings. Topic-agnostic; no AI.
 */
export function formatAcademicContent(input: FormatAcademicContentInput): string {
  const text = (input.sourceText || "").trim();
  const sentences = text ? text.split(/(?<=[.!?])\s+/).filter(Boolean) : ["(No content provided.)"];
  const headingCount = input.headings.length || 1;
  const chunkSize = Math.max(1, Math.ceil(sentences.length / headingCount));
  const sections: string[] = [];

  for (let i = 0; i < input.headings.length; i++) {
    const h = input.headings[i];
    const start = i * chunkSize;
    const end = i === input.headings.length - 1 ? sentences.length : start + chunkSize;
    const block = sentences.slice(start, end).join(" ").trim() || "(Add content.)";
    const prefix = "#".repeat(Math.min(h.level, 6));
    sections.push(`${prefix} ${h.text}\n\n${block}`);
  }

  return sections.join("\n\n");
}

/**
 * Format a single academic book section (chapter section) with heading, intro, key points, summary, references.
 */
export function formatBookSection(input: BookSectionInput): string {
  const refPlaceholder = input.referencesPlaceholder ?? "*(Add citations as needed.)*";
  const sections: string[] = [
    `# ${input.sectionTitle}`,
    formatSection("Introduction", input.introduction || "(No content provided.)"),
    formatSection(
      "Key Points",
      input.keyPoints.length > 0 ? formatBullets(input.keyPoints) : input.introduction.slice(0, 400) || "—"
    ),
    formatSection("Summary", input.summary || input.introduction || "—"),
    "## References\n\n" + refPlaceholder,
  ];
  return formatDocument(sections);
}
