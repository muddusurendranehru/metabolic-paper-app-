/**
 * Step 12 – translate generated content to target language using OpenAI (medical-accurate).
 * Telugu (te): uses lib/utils/step12/openai-telugu-translator (GPT-4, preserve medical terms, fallback).
 * Other languages: generic GPT-4o translation. No steps 1–6; Step 12 only.
 */

import { NextRequest, NextResponse } from "next/server";
import { translateToTelugu } from "@/lib/utils/step12/openai-telugu-translator";

export const runtime = "nodejs";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  ta: "Tamil",
  kn: "Kannada",
  ml: "Malayalam",
  bn: "Bengali",
  mr: "Marathi",
};

const MAX_TEXT_LENGTH = 12000;

const SYSTEM_PROMPT = `You are a medical content translator. Your task is to translate the given text into the target language.

Rules:
- Output ONLY the translation. No preamble, no "Here is the translation:", no explanations.
- Preserve structure: markdown headings (##, ###), bullet lists, numbered lists, line breaks.
- Keep standard medical/clinical terms in English where they are universally used (e.g. TyG, HbA1c, BMI, diabetes, insulin, glucose, metabolic, triglycerides, hypertension, obesity, HOMA-IR, prediabetes). Do not translate these.
- Translate all other text (explanations, instructions, labels, CTAs) into the target language naturally and accurately.
- Preserve URLs exactly. Do not translate the URL or the domain.
- Keep placeholders like [QR Code: ...] or [INSERT ...] unchanged.
- If the text is already largely in the target language, return it with only minor corrections if needed.`;

function buildUserPrompt(text: string, targetLangCode: string): string {
  const langName = LANGUAGE_NAMES[targetLangCode] ?? targetLangCode;
  return `Translate the following text into ${langName}. Output only the translated text.\n\n---\n\n${text}`;
}

/**
 * POST { text: string, targetLanguage: string, audience?: string, tone?: string }
 * Returns { translated: string } or { error: string }
 * For targetLanguage 'te' uses openai-telugu-translator (medical-accurate, fallback to English).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const targetLanguage = typeof body.targetLanguage === "string" ? body.targetLanguage : "te";

    if (!text) {
      return NextResponse.json({ error: "Missing or empty text" }, { status: 400 });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text too long. Max ${MAX_TEXT_LENGTH} characters.` },
        { status: 400 }
      );
    }

    if (targetLanguage === "te") {
      const audience = ["patients", "doctors", "general"].includes(body.audience) ? body.audience : "patients";
      const tone = ["professional", "friendly", "educational"].includes(body.tone) ? body.tone : "educational";
      const translated = await translateToTelugu(text, {
        preserveMedicalTerms: true,
        audience,
        tone,
      });
      return NextResponse.json({ translated });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not set. Translation unavailable." },
        { status: 503 }
      );
    }

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(text, targetLanguage) },
      ],
      temperature: 0.2,
    });

    const translated = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!translated) {
      return NextResponse.json(
        { error: "Empty translation response" },
        { status: 502 }
      );
    }

    return NextResponse.json({ translated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Translation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
