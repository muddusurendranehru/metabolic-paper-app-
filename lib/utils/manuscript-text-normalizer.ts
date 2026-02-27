/**
 * Normalize manuscript text for consistent output.
 * - "P P = 0.001" → "P = 0.001"
 * - "26 -- 72" (age range) → "26-72 years"
 * - double hyphens "--" in ranges → single "-"
 */

export function normalizeManuscriptText(text: string): string {
  if (typeof text !== 'string' || text.length === 0) return text;
  let out = text;
  // Fix "P P " or "P P=" (double P before p-value)
  out = out.replace(/\bP\s+P\s*=\s*/g, 'P = ');
  out = out.replace(/\bP\s+P\s*<\s*/g, 'P < ');
  // Fix age range: "26 -- 72" or "26 -- 72 years" → "26-72 years"
  out = out.replace(/(\d{1,3})\s*--\s*(\d{1,3})(?=\s*years|\s|$|\.|,|\))/g, '$1-$2 years');
  out = out.replace(/(\d{1,3})\s*--\s*(\d{1,3})\s*years/g, '$1-$2 years');
  // Fix any remaining " -- " used as range (e.g. in prose)
  out = out.replace(/\s+--\s+/g, ' - ');
  return out;
}
