/**
 * Step 12 – FAQ generator. Imports ONLY from @/lib/utils/step12.
 */

import { extractPlainText } from "@/lib/utils/step12";
import { formatSection, formatBullets, formatDocument } from "@/lib/utils/step12";

export function generateFaq(sourceText: string, title?: string): string {
  const text = extractPlainText(sourceText);
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const qas = lines.slice(0, 10).map((line, i) => `Q${i + 1}: ${line}\nA: See source content.`);
  const sections = [
    formatSection(title ?? "FAQ", ""),
    formatSection("Questions & answers", qas.length ? qas.join("\n\n") : "Q1: (Add content)\nA: —"),
  ];
  return formatDocument(sections);
}
