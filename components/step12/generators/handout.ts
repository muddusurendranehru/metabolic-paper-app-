/**
 * Step 12 – handout generator. Imports ONLY from @/lib/utils/step12.
 */

import { extractPlainText } from "@/lib/utils/step12";
import { formatSection, formatBullets, formatDocument } from "@/lib/utils/step12";

export function generateHandout(sourceText: string, title?: string): string {
  const text = extractPlainText(sourceText);
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const sections = [
    formatSection(title ?? "Handout", ""),
    formatSection("Key points", formatBullets(lines.length ? lines : ["(Add content)"])),
  ];
  return formatDocument(sections);
}
