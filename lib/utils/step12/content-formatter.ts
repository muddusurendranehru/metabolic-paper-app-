/**
 * Step 12 – format content for output (sections, headings).
 * ISOLATED: lib/utils/step12/ only. No imports from research steps or other lib/utils.
 */

/**
 * Wrap content in a section with optional title.
 */
export function formatSection(title: string | null, body: string): string {
  if (!title) return body;
  return `## ${title}\n\n${body}`.trim();
}

/**
 * Format as markdown list items.
 */
export function formatBullets(items: string[]): string {
  return items.filter(Boolean).map((item) => `- ${item}`).join("\n");
}

/**
 * Join sections with double newline.
 */
export function formatDocument(sections: string[]): string {
  return sections.filter(Boolean).join("\n\n");
}
