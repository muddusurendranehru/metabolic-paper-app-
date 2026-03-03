/**
 * Step 12 – generate blog post (food facts for food topics; guideline-aware for non-food; then safe template).
 * ISOLATED: Only imports from this folder (step12). No steps 1–6; no patientData.
 * For server/API use only. Fallback: universal template + optional Telugu (never break output).
 */

import { STEP12_DEFAULT_WEBSITE_URL, WEBSITE_CONFIG } from "./step12-config";
import type { Step12Audience, Step12Tone, Step12Language } from "./step12-types";
import { getFoodFacts, isFoodTopic } from "./food-facts";
import { fetchNutritionData } from "./nutrition-bot-client";
import { normalizeNutritionBotJson } from "./nutrition-bot-content";
import { generateNaturalContent } from "./natural-content-generator";
import { generateUniversalContent } from "./universal-content-generator";
import { translateToTelugu } from "./openai-telugu-translator";

export interface BlogPostInput {
  topic: string;
  sourceText?: string;
  audience?: Step12Audience;
  tone?: Step12Tone;
}

/**
 * Generate blog content. Food topics → food facts blog; non-food → guideline-aware natural content; on failure → safe template.
 * If language is Telugu, translates English content via GPT-4. On translation failure, returns English + Telugu footer.
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

  // Food topic: use food-facts generator; on failure fall back to safe template
  if (isFoodTopic(input.topic)) {
    try {
      const foodContent = await generateFoodBlog(input, lang);
      if (language === "te") {
        try {
          return await translateToTelugu(foodContent, {
            preserveMedicalTerms: true,
            audience,
            tone: (input.tone === "friendly" ? "friendly" : input.tone === "educational" ? "educational" : "professional") as "professional" | "friendly" | "educational",
          });
        } catch (err) {
          console.warn("Telugu translation failed, falling back to English", err);
          return `${foodContent}\n\n🔗 మరింత సమాచారం: ${STEP12_DEFAULT_WEBSITE_URL}`;
        }
      }
      return foodContent;
    } catch (error) {
      console.warn("Food facts generation failed, falling back to safe template", error);
      return generateFallbackBlog(input, language);
    }
  }

  // Non-food: guideline-aware natural content
  try {
    const naturalContent = await generateNaturalContent({
      topic: input.topic,
      sourceText: input.sourceText,
      language: lang,
      audience,
      contentType: "blog",
    });
    if (language === "te") {
      try {
        return await translateToTelugu(naturalContent, {
          preserveMedicalTerms: true,
          audience,
          tone: (input.tone === "friendly" ? "friendly" : input.tone === "educational" ? "educational" : "professional") as "professional" | "friendly" | "educational",
        });
      } catch (error) {
        console.warn("Telugu translation failed, falling back to English", error);
        return `${naturalContent}\n\n🔗 మరింత సమాచారం: ${STEP12_DEFAULT_WEBSITE_URL}`;
      }
    }
    return naturalContent;
  } catch (error) {
    console.warn("Natural content generation failed, falling back to safe template", error);
    return generateFallbackBlog(input, language);
  }
}

/** Build blog post for food topics. Tries Nutrition Bot API (text or JSON) first; on failure uses local getFoodFacts. */
async function generateFoodBlog(input: BlogPostInput, language: Step12Language | string): Promise<string> {
  const lang = language === "en" || language === "hi" || language === "te" || language === "ta" ? language : "en";
  const nutritionData = await fetchNutritionData(input.topic);
  const facts = nutritionData
    ? (normalizeNutritionBotJson(nutritionData) ?? await getFoodFacts(input.topic, lang))
    : await getFoodFacts(input.topic, lang);

  const labels: Record<string, string> = {
    en: "Free Metabolic Tools",
    hi: "निःशुल्क मेटाबोलिक टूल्स",
    te: "ఉచిత మెటాబాలిక్ సాధనాలు",
    ta: "இலவச வளர்சிதை மாற்ற கருவிகள்",
  };
  const websiteLabel = labels[language as string] ?? labels.en;
  const websiteUrl = WEBSITE_CONFIG.url;

  return `
# ${facts.foodName} and Diabetes: Simple Nutrition Facts

## Introduction
${facts.naturalIntro}

## Quick Nutrition Facts (${facts.perServing})
| Nutrient | Amount |
|----------|--------|
| Calories | ${facts.calories} kcal |
| Glycemic Index | ${facts.glycemicIndex} |
| Glycemic Load | ${facts.glycemicLoad} |
| Fiber | ${facts.fiber} |
| Protein | ${facts.protein} |
| Fat | ${facts.fat} |
| Carbs | ${facts.carbs} |

## Diabetes Verdict: ${facts.diabetesVerdict}
**Portion Guidance:** ${facts.portionGuidance}

### Smart Pairing Tips
${facts.pairingTips.map((tip) => `• ${tip}`).join("\n")}

### Indian Context
${facts.indianContext}

## Practical Tips for You
1. **Start small**: Try the recommended portion and check your blood sugar 2 hours later
2. **Pair wisely**: Combine with protein (nuts, curd) or fiber (vegetables) to slow glucose rise
3. **Timing matters**: Eat as part of a meal, not alone on empty stomach
4. **Monitor your response**: Everyone's body reacts differently – track your own patterns
5. **Use free tools**: Calculate your metabolic risk at ${websiteUrl}

## Bottom Line
${facts.foodName} can fit into a diabetes-friendly diet when portions are controlled and paired thoughtfully. Focus on overall dietary patterns, not single foods. When in doubt, consult your physician or dietitian for personalized advice.

---
🔗 ${websiteLabel}: ${websiteUrl}

---
*Dr. Muddu Surendra Nehru, MD*  
*HOMA Clinic, Gachibowli, Hyderabad*
`.trim();
}

/** Safe template fallback when natural/guideline generation fails. */
function generateFallbackBlog(
  input: BlogPostInput,
  language: Step12Language | string
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
    return translateToTelugu(englishContent, {
      preserveMedicalTerms: true,
      audience: (input.audience === "doctors" ? "doctors" : input.audience === "patients" ? "patients" : "general") as "patients" | "doctors" | "general",
      tone: (input.tone === "friendly" ? "friendly" : input.tone === "educational" ? "educational" : "professional") as "professional" | "friendly" | "educational",
    }).catch((error) => {
      console.warn("Telugu translation failed, falling back to English", error);
      return `${englishContent}\n\n🔗 మరింత సమాచారం: ${STEP12_DEFAULT_WEBSITE_URL}`;
    });
  }

  return Promise.resolve(englishContent);
}
