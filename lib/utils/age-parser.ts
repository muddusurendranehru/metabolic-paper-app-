/**
 * Parse age from lab report strings like "74 Y 0 M 0 D", "74Y", "74 years", "Age: 74"
 */

const PATTERNS = [
  // "74 Y 0 M 0 D" or "74 Y" (years only)
  /(\d{1,3})\s*Y(?:\s*\d{1,2}\s*M)?(?:\s*\d{1,2}\s*D)?/i,
  // "74 years" or "74 yrs"
  /(\d{1,3})\s*(?:years?|yrs?)\s*(?:old)?/i,
  // "Age: 74" or "Age 74" or "Age-74"
  /age\s*[:\s\-]*(\d{1,3})/i,
  // Standalone 1–3 digit number after "age" context (e.g. "Male 74")
  /(?:age|gender)\s*[:\s\-]*(\d{1,3})\b/i,
];

/**
 * Parse age in years from text. Returns null if not found or invalid.
 */
export function parseAge(text: string): number | null {
  if (!text || typeof text !== "string") return null;
  const normalized = text.replace(/\s+/g, " ").trim();
  for (const pattern of PATTERNS) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      const years = parseInt(match[1], 10);
      if (!isNaN(years) && years >= 0 && years <= 120) return years;
    }
  }
  return null;
}
