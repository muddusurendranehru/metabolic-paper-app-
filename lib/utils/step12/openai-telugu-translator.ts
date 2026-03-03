/**
 * Step 12 – OpenAI GPT-4 Telugu translator (medical-accurate).
 * ISOLATED: Only imports from this folder (step12). No steps 1–6; no patientData.
 * Used by app/api/translate when targetLanguage is 'te'. Fallback: English + Telugu footer.
 */

import { STEP12_DEFAULT_WEBSITE_URL } from "./step12-config";

export interface TeluguTranslationOptions {
  preserveMedicalTerms?: boolean;
  audience?: "patients" | "doctors" | "general";
  tone?: "professional" | "friendly" | "educational";
}

const DEFAULT_OPTIONS: Required<TeluguTranslationOptions> = {
  preserveMedicalTerms: true,
  audience: "patients",
  tone: "educational",
};

/**
 * Translate English medical content to Telugu using GPT-4.
 * Preserves medical terms in English; fallback returns English + Telugu footer on error.
 */
export async function translateToTelugu(
  englishText: string,
  options: TeluguTranslationOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallbackTelugu(englishText);
  }

  try {
    const medicalTermsPrompt = opts.preserveMedicalTerms
      ? `IMPORTANT: Keep these medical terms in ENGLISH (do not translate): TyG, HbA1c, insulin, glucose, triglycerides, HDL, LDL, BMI, waist circumference, HOMA-IR, diabetes, prediabetes, metabolic, glycemic, lipotoxicity, glucotoxicity. Translate ONLY explanatory text to Telugu.`
      : "";

    const audiencePrompt =
      opts.audience === "patients"
        ? "Use simple, conversational Telugu that a layperson can understand. Avoid complex medical jargon."
        : opts.audience === "doctors"
          ? "Use professional medical Telugu with appropriate terminology. Keep English medical terms."
          : "Use clear, standard Telugu suitable for general educated readers.";

    const tonePrompt =
      opts.tone === "friendly"
        ? "Use a warm, encouraging tone with respectful address (మీరు)."
        : opts.tone === "educational"
          ? "Use a clear, instructive tone suitable for health education."
          : "Use a formal, professional tone.";

    const prompt = `
You are a medical translator specializing in Telugu health content.

TASK: Translate the following English medical content to Telugu.

${medicalTermsPrompt}

${audiencePrompt}

${tonePrompt}

FORMAT RULES:
1. Keep section headings bilingual: "Introduction / పరిచయం"
2. Keep bullet points and numbering intact
3. Preserve any URLs, numbers, percentages, and statistical values (r=0.46, p=0.001, n=74)
4. Do NOT translate: DOI links, author names, journal names, clinic names
5. Add a footer line in Telugu: "మరింత సమాచారం: [website URL]" if not already present

CONTENT TO TRANSLATE:
"""
${englishText}
"""

OUTPUT: Telugu translation only (no English preamble).
`.trim();

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a professional medical translator for Telugu health content." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const translated = response.choices[0]?.message?.content?.trim();
    if (!translated) throw new Error("Empty translation response");
    return translated;
  } catch (error) {
    console.error("Telugu translation failed:", error);
    return fallbackTelugu(englishText);
  }
}

function fallbackTelugu(englishText: string): string {
  return `${englishText}\n\n🔗 మరింత సమాచారం: ${STEP12_DEFAULT_WEBSITE_URL}`;
}

/**
 * Translate a section with bilingual heading (English / Telugu).
 */
export async function translateSection(
  sectionTitle: string,
  sectionContent: string,
  options: TeluguTranslationOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const teluguTitle = await translateToTelugu(sectionTitle, { ...opts, preserveMedicalTerms: false });
  const teluguContent = await translateToTelugu(sectionContent, opts);
  return `## ${sectionTitle} / ${teluguTitle}\n\n${teluguContent}`;
}
