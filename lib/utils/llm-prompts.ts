/**
 * Prompts for LLM-based extraction of lab values from PDF text.
 * No API calls; only prompt text for use by api/llm-extract.
 */

const SYSTEM_PROMPT = `You are a medical data extractor. Given text from a lab report or clinical PDF, extract structured fields. Respond only with valid JSON, no markdown or explanation.`;

const USER_PROMPT_TEMPLATE = `Extract the following from this lab/clinical report text. Return a single JSON object with exactly these keys (use null if not found): name (string), age (number or null), sex ("M" or "F" or null), tg (triglycerides mg/dL, number or null), glucose (fasting blood sugar mg/dL, number or null), hdl (HDL cholesterol mg/dL, number or null). If age appears as "X Y 0 M 0 D" use X as the age number.

Text:
---
{{TEXT}}
---`;

export function getExtractionPrompts(pdfText: string): { system: string; user: string } {
  const truncated = pdfText.length > 12000 ? pdfText.slice(0, 12000) + "\n[... truncated]" : pdfText;
  return {
    system: SYSTEM_PROMPT,
    user: USER_PROMPT_TEMPLATE.replace("{{TEXT}}", truncated),
  };
}
