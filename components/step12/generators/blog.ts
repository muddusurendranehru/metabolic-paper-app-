/**
 * Step 12 – blog content generator. Imports ONLY from @/lib/utils/step12.
 */

import { extractPlainText, extractSnippet } from "@/lib/utils/step12";
import { formatSection, formatDocument } from "@/lib/utils/step12";

export function generateBlog(sourceText: string, title?: string): string {
  const text = extractPlainText(sourceText);
  const summary = extractSnippet(text, 160);
  const sections = [
    formatSection(title ?? "Summary", summary),
    formatSection("Details", text || "(No content)"),
  ];
  return formatDocument(sections);
}
