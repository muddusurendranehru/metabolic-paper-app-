/**
 * Step 12 – YouTube script generator. Imports ONLY from @/lib/utils/step12.
 */

import { extractPlainText, extractSnippet } from "@/lib/utils/step12";
import { formatSection, formatDocument } from "@/lib/utils/step12";

export function generateYoutube(sourceText: string, title?: string): string {
  const text = extractPlainText(sourceText);
  const hook = extractSnippet(text, 80);
  const sections = [
    formatSection("Hook (0–15s)", hook || "Introduce the topic."),
    formatSection("Main (15–45s)", text || "(Key message)"),
    formatSection("CTA (45–60s)", "Subscribe for more. Link in description."),
  ];
  return formatDocument(sections);
}
