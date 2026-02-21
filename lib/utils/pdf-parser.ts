/**
 * Extract text from PDF (pdf.js via pdf-parse) and apply regex for TyG fields.
 * Used by LLM-extract API as text source and regex fallback.
 */

import { parseAge } from "./age-parser";

// Same pattern style as OCR route; no changes to app/api/ocr/route.ts
const PATTERNS = {
  tg: [
    /triglycerides?\s*[:\s|\-]*(\d{2,3})/i,
    /tg\s*[:\s|\-]*(\d{2,3})/i,
    /trig\s*[:\s|\-]*(\d{2,3})/i,
    /serum\s*triglycerides?\s*[:\s|\-]*(\d{2,3})/i,
    /(?:triglycerides?|tg)\s+(\d{2,3})/i,
  ],
  glucose: [
    /glucose\s*fbs?\s*[:\s|\-]*(\d{2,3})/i,
    /fbs\s*[:\s|\-]*(\d{2,3})/i,
    /fbg\s*[:\s|\-]*(\d{2,3})/i,
    /fasting\s*blood\s*sugar\s*[:\s|\-]*(\d{2,3})/i,
    /glucose\s*[:\s|\-]*(\d{2,3})/i,
    /blood\s*sugar\s*fasting\s*[:\s|\-]*(\d{2,3})/i,
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

export type PdfExtractResult = {
  name: string | null;
  age: number | null;
  sex: string | null;
  tg: number | null;
  glucose: number | null;
  hdl: number | null;
  tyg: number | null;
  risk: string;
  ocrSuccess: boolean;
};

/**
 * Extract raw text from PDF buffer. Uses pdf-parse (pdf.js).
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return (data?.text as string) ?? "";
}

/**
 * Extract text from PDF then run regex to get structured TyG fields.
 * Age uses age-parser for formats like "74 Y 0 M 0 D".
 */
export async function extractStructuredFromPdf(buffer: Buffer): Promise<{
  text: string;
  data: PdfExtractResult;
}> {
  const text = await extractTextFromPdf(buffer);
  const normalized = text.replace(/\s+/g, " ").toLowerCase();
  const fullText = text.replace(/\s+/g, " ");

  const tg = extractValue(normalized, PATTERNS.tg);
  const glucose = extractValue(normalized, PATTERNS.glucose);
  const hdl = extractValue(normalized, PATTERNS.hdl);
  const ageFromRegex = extractValue(normalized, PATTERNS.age);
  const ageFromParser = parseAge(fullText);
  const age = ageFromRegex ?? ageFromParser;
  const sex = extractText(normalized, PATTERNS.sex);
  const name = extractText(normalized, PATTERNS.name);

  const unitMatch = fullText.match(/(mg\/dl|mmol\/l)/i);
  const unit = unitMatch ? unitMatch[1].toLowerCase() : "mg/dl";
  let tgVal = tg ?? 0;
  let glucoseVal = glucose ?? 0;
  let hdlVal = hdl ?? null;
  if (unit === "mmol/l") {
    if (tgVal) tgVal = tgVal * 88.57;
    if (glucoseVal) glucoseVal = glucoseVal * 18;
    if (hdlVal) hdlVal = hdlVal * 38.67;
  }

  let tyg: number | null = null;
  let risk = "Pending";
  if (tg && glucose) {
    tyg = Math.log((tg * glucose) / 2);
    risk = tyg >= 9.5 ? "High" : tyg >= 8.5 ? "Moderate" : "Normal";
  }

  const data: PdfExtractResult = {
    name: name ?? null,
    age: age ?? null,
    sex: sex ?? null,
    tg: tg ?? null,
    glucose: glucose ?? null,
    hdl: hdlVal ?? null,
    tyg: tyg ?? null,
    risk,
    ocrSuccess: !!(tg && glucose),
  };

  return { text: fullText.trim(), data };
}
