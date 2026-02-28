/**
 * Step 12 – extract plain text from raw content.
 * ISOLATED: lib/utils/step12/ only. No imports from research steps or other lib/utils.
 */

/**
 * Normalize raw string to plain text: trim, collapse whitespace, strip simple HTML-like tags.
 */
export function extractPlainText(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  let s = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return s;
}

/**
 * Extract a short snippet (e.g. for preview). Max length in chars.
 */
export function extractSnippet(raw: string, maxLength: number = 200): string {
  const plain = extractPlainText(raw);
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength - 3).trim() + "…";
}
