/**
 * Extract raw text from a PDF buffer using pdf.js (digital PDFs).
 * Does not use OCR; for scanned PDFs the OCR route remains the option.
 */

const PATTERNS = {
  tg: [
    /triglycerides?\s*[:\s|\-]*(\d{2,3})/i,
    /tg\s*[:\s|\-]*(\d{2,3})/i,
    /trig\s*[:\s|\-]*(\d{2,3})/i,
    /(?:triglycerides?|tg)\s+(\d{2,3})/i,
  ],
  glucose: [
    /glucose\s*fbs?\s*[:\s|\-]*(\d{2,3})/i,
    /fbs\s*[:\s|\-]*(\d{2,3})/i,
    /fbg\s*[:\s|\-]*(\d{2,3})/i,
    /fasting\s*blood\s*sugar\s*[:\s|\-]*(\d{2,3})/i,
    /glucose\s*[:\s|\-]*(\d{2,3})/i,
  ],
  hdl: [
    /hdl\s*(?:cholesterol)?\s*[:\s|\-]*(\d{2,3})/i,
    /hdl-c\s*[:\s|\-]*(\d{2,3})/i,
    /(?:hdl|hdl-c)\s+(\d{2,3})/i,
  ],
  age: [
    /age\s*[:\s|\-]*(\d{1,3})/i,
    /(\d{1,3})\s*y(?:ears?)?\s*(?:old)?/i,
  ],
  sex: [
    /sex\s*[:\s|\-]*([MF])/i,
    /gender\s*[:\s|\-]*([MF])/i,
    /([MF])\s*(?:ale|emale)/i,
  ],
  name: [
    /patient\s*name\s*[:\s|\-]*([A-Za-z\s]+)/i,
    /name\s*[:\s|\-]*([A-Za-z][A-Za-z\s]{2,30})/i,
  ],
};

function extractValue(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const val = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(val) && val >= 0 && val < 3000) return val;
    }
  }
  return null;
}

function extractText(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

/** Extract raw text from a PDF buffer (all pages). */
export async function extractTextFromPdfBuffer(buffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const numPages = doc.numPages;
  const parts: string[] = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item: { str?: string }) => item.str ?? "").join(" ");
    parts.push(text);
  }
  return parts.join("\n");
}

export interface ExtractedLabFields {
  name: string | null;
  age: number | null;
  sex: string | null;
  tg: number | null;
  glucose: number | null;
  hdl: number | null;
}

/** Run regex extraction on text (same style as OCR). Use with parseAgeString for age strings like "74 Y 0 M 0 D". */
export function extractStructuredFromText(
  text: string,
  parseAge?: (s: string | null) => number | null
): ExtractedLabFields {
  const normalized = text.replace(/\s+/g, " ");
  const ageFromRegex = extractValue(normalized, PATTERNS.age);
  const ageStr = text.match(/age\s*[:\s\-]*([^\n]+)/i)?.[1]?.trim();
  const age = parseAge && ageStr ? parseAge(ageStr) : ageFromRegex;

  return {
    name: extractText(normalized, PATTERNS.name),
    age,
    sex: extractText(normalized, PATTERNS.sex),
    tg: extractValue(normalized, PATTERNS.tg),
    glucose: extractValue(normalized, PATTERNS.glucose),
    hdl: extractValue(normalized, PATTERNS.hdl),
  };
}
