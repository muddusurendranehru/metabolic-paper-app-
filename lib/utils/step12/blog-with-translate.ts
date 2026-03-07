/**
 * Step 12 – generate blog post (simple food template for food/supplement; PubMed-only for clinical; neutral fallback).
 * ISOLATED: Only imports from this folder (step12). No steps 1–6; no patientData.
 * For server/API use only. Telugu translation preserved on output (never break output).
 */

import { STEP12_DEFAULT_WEBSITE_URL, WEBSITE_CONFIG } from "./step12-config";
import type { Step12Audience, Step12Tone, Step12Language } from "./step12-types";
import { generateMCTContent } from "./mct-content-generator";
import { translateToTelugu } from "./openai-telugu-translator";

export interface BlogPostInput {
  topic: string;
  sourceText?: string;
  audience?: Step12Audience;
  tone?: Step12Tone;
}

/**
 * Generate blog content. Step 1: clean & classify topic. Food/supplement → simple template only.
 * Clinical → PubMed (MCT) only. Else → simple neutral template. Telugu: translate at end on success.
 */
export async function generateBlogPost(
  input: BlogPostInput,
  language: Step12Language | string = "en"
): Promise<string> {
  const lang = language as Step12Language;
  const audience =
    (input.audience === "doctors"
      ? "doctors"
      : input.audience === "patients"
        ? "patients"
        : "general") as "patients" | "doctors" | "general";

  // STEP 1: Clean topic string + title-case for display
  const cleanTopic = input.topic
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  const lower = cleanTopic.toLowerCase();

  // STEP 2: Food/supplement keywords → SIMPLE template ONLY
  const foodKeywords = [
    "almond",
    "almonds",
    "whey",
    "protein",
    "ghee",
    "poha",
    "jackfruit",
    "papaya",
    "mango",
    "apple",
    "banana",
    "vinegar",
    "turmeric",
    "fenugreek",
  ];
  if (foodKeywords.some((k) => lower.includes(k))) {
    const content = generateSimpleFoodBlog(cleanTopic, language as string);
    return maybeTranslateToTelugu(content, language, audience, input.tone);
  }

  // STEP 3: Clinical index keywords → PubMed template ONLY
  const clinicalKeywords = ["tyg", "hba1c", "homa", "index", "marker", "correlation"];
  if (clinicalKeywords.some((k) => lower.includes(k))) {
    const content = await generateClinicalBlog(cleanTopic, lang, audience);
    return maybeTranslateToTelugu(content, language, audience, input.tone);
  }

  // STEP 4: Fallback → neutral template
  const content = generateSimpleNeutralBlog(cleanTopic, language as string);
  return maybeTranslateToTelugu(content, language, audience, input.tone);
}

/** If language is Telugu, translate; on failure return English + Telugu footer. */
async function maybeTranslateToTelugu(
  englishContent: string,
  language: Step12Language | string,
  audience: "patients" | "doctors" | "general",
  tone?: Step12Tone
): Promise<string> {
  if (language !== "te") return englishContent;
  try {
    return await translateToTelugu(englishContent, {
      preserveMedicalTerms: true,
      audience,
      tone: (tone === "friendly" ? "friendly" : tone === "educational" ? "educational" : "professional") as
        | "professional"
        | "friendly"
        | "educational",
    });
  } catch (err) {
    console.warn("Telugu translation failed, falling back to English", err);
    return `${englishContent}\n\n🔗 మరింత సమాచారం: ${STEP12_DEFAULT_WEBSITE_URL}`;
  }
}

/** SIMPLE food blog template (NO PubMed, NO complex logic). */
function generateSimpleFoodBlog(topic: string, language: string): string {
  const labels: Record<string, { freeTools: string; title: string }> = {
    en: { freeTools: "Free Metabolic Tools", title: "Simple Nutrition Facts" },
    hi: { freeTools: "निःशुल्क मेटाबोलिक टूल्स", title: "सरल पोषण तथ्य" },
    te: { freeTools: "ఉచిత మెటాబాలిక్ సాధనాలు", title: "సరళ పోషణ వాస్తవాలు" },
    ta: { freeTools: "இலவச வளர்சிதை மாற்ற கருவிகள்", title: "எளிய ஊட்டச்சத்து உண்மைகள்" },
  };
  const label = labels[language] ?? labels.en;
  const website = WEBSITE_CONFIG.url;

  return `
# ${topic}: ${label.title}

## Introduction
Simple nutrition facts for ${topic} – use the table below as a starting point and consult your dietitian for personalized advice.

## Quick Nutrition Facts (typical serving)
| Nutrient | Amount |
|----------|--------|
| Calories | varies by food |
| Glycemic Index | Low–Medium when unprocessed |
| Fiber | varies |
| Protein | varies |
| Fat | varies |
| Carbs | varies |

## Diabetes Verdict: ✅ Good in moderation
**Portion Guidance:** Consult your dietitian for personalized advice for ${topic}

### Smart Pairing Tips
• Pair with fiber-rich foods to blunt glucose response
• Choose minimally processed forms when possible
• Monitor your blood sugar 2 hours after trying

### Practical Tips for You
1. Start with small portions to assess tolerance
2. Include as part of a meal, not alone on empty stomach
3. Track your blood sugar response 2 hours after trying
4. Use free tools: ${website}

---
🔗 ${label.freeTools}: ${website}

---
*Dr. Muddu Surendra Nehru, MD*  
*HOMA Clinic, Gachibowli, Hyderabad*
`.trim();
}

/** Clinical blog (PubMed-only). Do NOT call food generators. */
async function generateClinicalBlog(
  topic: string,
  language: Step12Language,
  audience: "patients" | "doctors" | "general"
): Promise<string> {
  const lang = language === "en" || language === "hi" || language === "te" || language === "ta" ? language : "en";
  return generateMCTContent({
    topic,
    language: lang,
    audience,
    outputFormat: "blog",
  });
}

/** Neutral fallback. */
function generateSimpleNeutralBlog(topic: string, language: string): string {
  const website = WEBSITE_CONFIG.url;
  return `
# ${topic}: Evidence Overview

## Introduction
Evidence on ${topic} is evolving. Focus on overall dietary patterns, routine monitoring, and personalized counseling with your healthcare team.

## Practical Takeaway
• Monitor routine metabolic markers
• Focus on balanced, culturally-aligned eating
• Consult your physician for personalized advice
• Use validated tools: ${website}

---
🔗 Free Metabolic Tools: ${website}

---
*Dr. Muddu Surendra Nehru, MD*  
*HOMA Clinic, Gachibowli, Hyderabad*
`.trim();
}
