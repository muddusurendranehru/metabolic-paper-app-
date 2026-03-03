/**
 * Step 12 – guideline-aware content: ICMR, ADA, WHO, FDA, Indian evidence.
 * ISOLATED: Only this folder (lib/utils/step12). No steps 1–6; no patientData.
 * Server/API only (uses OPENAI_API_KEY). Fallback: safe English template on any failure.
 */

import OpenAI from "openai";

export interface GuidelineQuery {
  topic: string;
  region: "india" | "global" | "both";
  guidelineSources: Array<
    "ICMR" | "ADA" | "WHO" | "FDA" | "ICMR-INDIAB" | "Indian Dietetic Association"
  >;
  audience: "patients" | "doctors" | "general";
  /** When set and not 'en', explanatory text may be in this language; medical terms stay English. */
  language?: "en" | "hi" | "te" | "ta";
}

export interface GuidelineResult {
  summary: string;
  recommendations: string[];
  localEvidence: string[];
  internationalGuidelines: string[];
  cautionNotes: string[];
  naturalLanguageIntro: string;
}

function fallbackResult(topic: string): GuidelineResult {
  return {
    summary: `Evidence on ${topic} in Indian populations is evolving. Current guidelines emphasize individualized assessment and routine metabolic monitoring.`,
    recommendations: [
      "Consult your physician for personalized advice",
      "Monitor routine fasting labs (glucose, lipids)",
      "Focus on balanced diet and regular physical activity",
      "Use validated calculators for risk assessment",
    ],
    localEvidence: ["ICMR-INDIAB study highlights metabolic risk in urban India"],
    internationalGuidelines: [
      "ADA recommends routine screening for high-risk individuals",
    ],
    cautionNotes: ["Individual responses vary; monitor your own metrics"],
    naturalLanguageIntro: `If you're exploring ${topic} in the context of metabolic health, you're not alone. Many patients and clinicians in India are asking similar questions. While research continues to evolve, current evidence supports a practical, individualized approach to risk assessment and management.`,
  };
}

function normalizeResult(raw: Record<string, unknown>, topic: string): GuidelineResult {
  const arr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  const str = (v: unknown): string =>
    typeof v === "string" && v.trim() ? v.trim() : fallbackResult(topic).summary;
  return {
    summary: str(raw.summary),
    recommendations: arr(raw.recommendations),
    localEvidence: arr(raw.localEvidence),
    internationalGuidelines: arr(raw.internationalGuidelines),
    cautionNotes: arr(raw.cautionNotes),
    naturalLanguageIntro:
      typeof raw.naturalLanguageIntro === "string" && raw.naturalLanguageIntro.trim()
        ? raw.naturalLanguageIntro.trim()
        : fallbackResult(topic).naturalLanguageIntro,
  };
}

/**
 * Query guidelines (ICMR, ADA, WHO, FDA, Indian studies) for a topic.
 * Returns natural, localized, evidence-based content. Fallback on API error or missing key.
 */
export async function checkGuidelines(
  query: GuidelineQuery
): Promise<GuidelineResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn(
      "Step 12: OPENAI_API_KEY missing; using fallback content. Set OPENAI_API_KEY in .env.local for guideline-aware content."
    );
    return fallbackResult(query.topic);
  }

  const regionPrompt =
    query.region === "india"
      ? "Focus on Indian guidelines (ICMR, ICMR-INDIAB, Indian Dietetic Association) and local evidence."
      : query.region === "global"
        ? "Include international guidelines (ADA, WHO, FDA) with Indian context where relevant."
        : "Provide both Indian and international perspectives, highlighting similarities/differences.";

  const audiencePrompt =
    query.audience === "patients"
      ? "Use simple, conversational language suitable for lay readers. Avoid jargon."
      : query.audience === "doctors"
        ? "Use professional medical language with appropriate terminology and evidence levels."
        : "Use clear, accessible language for educated general readers.";

  const languagePrompt =
    query.language && query.language !== "en"
      ? `Translate explanatory text to ${query.language.toUpperCase()}, but KEEP medical terms in English: TyG, HbA1c, insulin, glucose, triglycerides, BMI, waist circumference.`
      : "Keep all content in English.";

  const prompt = `
You are a medical content expert specializing in Indian healthcare guidelines.

TOPIC: "${query.topic}"

TASK: Provide evidence-based guidance by checking:
${query.guidelineSources.map((s) => `- ${s}`).join("\n")}

${regionPrompt}
${audiencePrompt}
${languagePrompt}

OUTPUT FORMAT (JSON):
{
  "summary": "2-3 sentence evidence summary in natural language",
  "recommendations": ["Actionable bullet 1", "Actionable bullet 2", "..."],
  "localEvidence": ["Indian study citation 1", "..."],
  "internationalGuidelines": ["ADA position", "WHO position", "..."],
  "cautionNotes": ["Safety warning 1", "..."],
  "naturalLanguageIntro": "Engaging intro paragraph (80-120 words) that sounds human-written, not templated"
}

RULES:
1. If topic is food-related (ghee, jaggery, oils, mango, etc.):
   - Address glycemic impact, portion guidance, cultural context
   - Cite Indian dietary guidelines if available
   - Mention traditional use + modern evidence balance
2. If topic is clinical (TyG, HbA1c, insulin resistance):
   - Reference ICMR-INDIAB, ADA Standards of Care
   - Include practical calculation/interpretation tips
3. ALWAYS keep medical terms in English: TyG, HbA1c, insulin, glucose, triglycerides, HDL, LDL, BMI, waist circumference, HOMA-IR
4. Use natural, conversational language – avoid robotic template phrasing
5. If evidence is limited, state "Limited Indian data; international guidelines suggest..."
6. Include practical tips for Indian patients (diet, lifestyle, monitoring)

RESPOND WITH VALID JSON ONLY.
`.trim();

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a medical guideline expert for Indian healthcare content.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return fallbackResult(query.topic);
    }

    const parsed = JSON.parse(content) as Record<string, unknown>;
    if (!parsed.summary || !parsed.naturalLanguageIntro) {
      return fallbackResult(query.topic);
    }

    return normalizeResult(parsed, query.topic);
  } catch (error) {
    console.error("Step 12 guideline check failed (using fallback):", error);
    return fallbackResult(query.topic);
  }
}
