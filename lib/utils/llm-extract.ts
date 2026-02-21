/**
 * LLM-based extraction from PDF text (add-only; does not replace api/llm-extract route).
 * Use from API route or server only (uses process.env.OPENAI_API_KEY).
 */

export type Lipids = {
  total_cholesterol: number | null;
  triglycerides: number | null;
  hdl: number | null;
  ldl: number | null;
  vldl: number | null;
};

export type LLMExtractResult = {
  patient_name: string;
  age: number | null;
  sex: string;
  sample_date: string | null;
  ref_doctor: string | null;
  lipids: Lipids;
  glucose_fbs: number | null;
  hba1c: number | null;
  insulin_fasting: number | null;
  c_peptide: number | null;
};

export async function extractWithLLM(pdfText: string): Promise<Record<string, unknown>> {
  const prompt = `
Extract clinical lab data from this Indian lab report text.
Return JSON format only.

Required fields:
- patient_name (string)
- age (number, parse "74 Y 0 M 0 D" → 74)
- sex (M/F)
- sample_date (YYYY-MM-DD)
- ref_doctor (string)
- lipids: {
    total_cholesterol: number | null,
    triglycerides: number | null,
    hdl: number | null,
    ldl: number | null,
    vldl: number | null
  }
- glucose_fbs: number | null
- hba1c: number | null
- insulin_fasting: number | null
- c_peptide: number | null

Lab text:
${pdfText.substring(0, 3000)}

Return valid JSON only, no markdown.
`;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err}`);
  }

  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  try {
    return JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    throw new Error("LLM response was not valid JSON");
  }
}

export function parseAge(ageString: string): number | null {
  if (ageString == null || typeof ageString !== "string") return null;
  // Handle "74 Y 0 M 0 D" format
  const yearsMatch = ageString.match(/(\d+)\s*Y/i);
  if (yearsMatch) return parseInt(yearsMatch[1], 10);

  // Handle plain number
  const numMatch = ageString.match(/^(\d+)$/);
  if (numMatch) return parseInt(numMatch[1], 10);

  return null;
}

export function calculateTyG(glucose: number | null, tg: number | null): number | null {
  if (!glucose || !tg) return null;
  return Math.log((glucose * tg) / 2);
}

export function calculateTyG_WC(tyG: number | null, waist: number | null): number | null {
  if (!tyG || waist == null) return null;
  return tyG * waist; // TyG-WC index
}
