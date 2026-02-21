/**
 * Parse age strings from lab reports and LLM output to a number.
 * Examples: "74 Y 0 M 0 D" -> 74, "58 years" -> 58, "45" -> 45
 */
export function parseAgeString(str: string | null | undefined): number | null {
  if (str == null || typeof str !== "string") return null;
  const trimmed = str.trim();
  if (!trimmed) return null;

  // "74 Y 0 M 0 D" or "74Y 0M 0D" -> take first number as years
  const ymdMatch = trimmed.match(/^(\d{1,3})\s*[Yy]\s*(?:\d+\s*[Mm])?\s*(?:\d+\s*[Dd])?/);
  if (ymdMatch && ymdMatch[1]) {
    const n = parseInt(ymdMatch[1], 10);
    if (!isNaN(n) && n >= 0 && n <= 120) return n;
  }

  // "58 years" / "58 yrs" / "58 year old"
  const yearsMatch = trimmed.match(/(\d{1,3})\s*(?:y(?:ears?|rs?)?\s*(?:old)?)?/i);
  if (yearsMatch && yearsMatch[1]) {
    const n = parseInt(yearsMatch[1], 10);
    if (!isNaN(n) && n >= 0 && n <= 120) return n;
  }

  // "Age: 45" or plain "45"
  const numMatch = trimmed.match(/(\d{1,3})/);
  if (numMatch && numMatch[1]) {
    const n = parseInt(numMatch[1], 10);
    if (!isNaN(n) && n >= 0 && n <= 120) return n;
  }

  return null;
}
