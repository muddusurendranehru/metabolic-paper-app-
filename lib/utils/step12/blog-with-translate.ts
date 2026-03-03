/**
 * Step 12 – generate blog post (English first, then optional Telugu via GPT-4).
 * ISOLATED: Only imports from this folder (step12). No steps 1–6; no patientData.
 * For server/API use only (translateToTelugu uses OPENAI_API_KEY). Fallback: English + Telugu footer.
 */

import { STEP12_DEFAULT_WEBSITE_URL } from "./step12-config";
import type { Step12Audience, Step12Tone, Step12Language } from "./step12-types";
import { generateUniversalContent } from "./universal-content-generator";
import { translateToTelugu } from "./openai-telugu-translator";

export interface BlogPostInput {
  topic: string;
  sourceText?: string;
  audience?: Step12Audience;
  tone?: Step12Tone;
}

/**
 * Generate blog content. English first; if language is Telugu, translate via GPT-4 (medical-accurate).
 * On Telugu translation failure, returns English content + Telugu footer (never break output).
 */
export async function generateBlogPost(
  input: BlogPostInput,
  language: Step12Language | string = "en"
): Promise<string> {
  const englishContent = generateUniversalContent({
    topic: input.topic,
    sourceText: input.sourceText,
    language: "en",
    contentType: "blog",
    audience: input.audience ?? "general",
    tone: input.tone ?? "professional",
  });

  if (language === "te") {
    try {
      return await translateToTelugu(englishContent, {
        preserveMedicalTerms: true,
        audience: (input.audience === "doctors" ? "doctors" : input.audience === "patients" ? "patients" : "general") as "patients" | "doctors" | "general",
        tone: (input.tone === "friendly" ? "friendly" : input.tone === "educational" ? "educational" : "professional") as "professional" | "friendly" | "educational",
      });
    } catch (error) {
      console.warn("Telugu translation failed, falling back to English", error);
      return `${englishContent}\n\n🔗 మరింత సమాచారం: ${STEP12_DEFAULT_WEBSITE_URL}`;
    }
  }

  return englishContent;
}
