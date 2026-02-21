/**
 * LLM-based extraction from PDF text. Add-only utility.
 * Uses existing OPENAI_API_KEY; does not replace lib/utils/llm-prompts or age-parser.
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

export async function extractWithLLM(pdfText: string): Promise<LLMExtractResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

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

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty LLM response");

  return JSON.parse(content) as LLMExtractResult;
}

export function parseAge(ageString: string): number | null {
  // Handle "74 Y 0 M 0 D" format
  const yearsMatch = ageString.match(/(\d+)\s*Y/i);
  if (yearsMatch) return parseInt(yearsMatch[1], 10);

  // Handle plain number
  const numMatch = ageString.match(/^(\d+)$/);
  if (numMatch) return parseInt(numMatch[1], 10);

  return null;
}

export function calculateTyG(
  glucose: number | null,
  tg: number | null
): number | null {
  if (!glucose || !tg) return null;
  return Math.log((glucose * tg) / 2);
}

export function calculateTyG_WC(
  tyG: number | null,
  waist: number | null
): number | null {
  if (!tyG || !waist) return null;
  return tyG * waist; // TyG-WC index
}
