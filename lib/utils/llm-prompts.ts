/**
 * Prompts for LLM-based extraction of TyG/lab fields from PDF text.
 * Used by app/api/llm-extract/route.ts when OPENAI_API_KEY is set.
 */

export const EXTRACTION_SYSTEM_PROMPT = `You are a medical data extractor. Extract patient lab and demographic fields from the given text (from a lab report or clinical PDF). Reply with valid JSON only, no markdown or explanation. Use null for any value you cannot find.`;

export const EXTRACTION_USER_PROMPT = (text: string) => `Extract the following fields from this lab/clinical report text. Return a single JSON object with these keys only: name (string), age (number, years), sex ("M" or "F"), tg (number, triglycerides mg/dL), glucose (number, fasting glucose mg/dL), hdl (number or null, HDL mg/dL), waist (number or null, cm). If units are mmol/L convert: TG * 88.57, glucose * 18, HDL * 38.67.

Text:
---
${text.slice(0, 12000)}
---`;

export const EXTRACTION_JSON_SCHEMA = {
  name: "string or null",
  age: "number or null",
  sex: '"M" or "F" or null',
  tg: "number or null",
  glucose: "number or null",
  hdl: "number or null",
  waist: "number or null",
} as const;

export function getExtractionPrompts(pdfText: string): { system: string; user: string } {
  return {
    system: EXTRACTION_SYSTEM_PROMPT,
    user: EXTRACTION_USER_PROMPT(pdfText.length > 12000 ? pdfText.slice(0, 12000) + "\n[... truncated]" : pdfText),
  };
}
