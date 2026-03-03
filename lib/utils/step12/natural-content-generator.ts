/**
 * Step 12 – guideline-aware natural content (ICMR, ADA, WHO, Indian evidence).
 * For FOOD topics: uses getFoodFacts (calories, GI, fiber, portion) and builds food-specific content.
 * ISOLATED: Only this folder (lib/utils/step12). No steps 1–6; no patientData.
 * Always injects website link.
 */

import { checkGuidelines, type GuidelineResult } from "./guideline-checker";
import { getFoodFacts, isFoodTopic, type FoodFactResult } from "./food-facts";
import { injectWebsiteLink } from "./link-injector";
import { WEBSITE_CONFIG } from "./step12-config";
import type { Step12Language } from "./step12-types";

export interface NaturalContentInput {
  topic: string;
  sourceText?: string;
  language: Step12Language;
  audience: "patients" | "doctors" | "general";
  contentType: "blog" | "social" | "handout";
}

/**
 * Generate natural, localized, evidence-based content for a topic.
 * For FOOD topics: uses getFoodFacts and builds food-specific content.
 * Otherwise: calls checkGuidelines then builds guideline content. Always injects website link.
 */
export async function generateNaturalContent(
  input: NaturalContentInput
): Promise<string> {
  const lang = input.language === "en" || input.language === "hi" || input.language === "te" || input.language === "ta" ? input.language : "en";

  if (isFoodTopic(input.topic)) {
    const food = await getFoodFacts(input.topic, lang);
    const content = buildFoodContent(input, food);
    return injectWebsiteLink(content, input.language);
  }

  const guidelines = await checkGuidelines({
    topic: input.topic,
    region: "both",
    guidelineSources: ["ICMR", "ADA", "WHO", "ICMR-INDIAB"],
    audience: input.audience,
    language: lang,
  });

  const content = buildNaturalContent(input, guidelines);
  return injectWebsiteLink(content, input.language);
}

function getWebsiteLabel(language: string): string {
  const labels: Record<string, string> = {
    en: "Free Metabolic Tools",
    hi: "निःशुल्क मेटाबोलिक टूल्स",
    te: "ఉచిత మెటాబాలిక్ సాధనాలు",
    ta: "இலவச வளர்சிதை மாற்ற கருவிகள்",
  };
  return labels[language] ?? labels.en;
}

function buildNaturalContent(
  input: NaturalContentInput,
  guidelines: GuidelineResult
): string {
  const { topic, audience, contentType, language } = input;
  const linkLabel = getWebsiteLabel(language);

  if (contentType === "blog") {
    return `
# ${topic}

## Introduction
${guidelines.naturalLanguageIntro}

## What Does the Evidence Say?
${guidelines.summary}

### Key Recommendations
${guidelines.recommendations.map((r) => `• ${r}`).join("\n")}

### Indian Context
${
  guidelines.localEvidence.length > 0
    ? guidelines.localEvidence.map((e) => `• ${e}`).join("\n")
    : "Local Indian data on this topic is still emerging. International guidelines provide a useful framework while we await more population-specific research."
}

### Practical Tips for ${audience === "patients" ? "You" : "Clinical Practice"}
1. Start with routine fasting labs (glucose, triglycerides) – widely available and affordable
2. Use validated calculators: ${WEBSITE_CONFIG.url}
3. Monitor trends over time, not single values
4. Combine with lifestyle measures: diet, activity, sleep, stress management
5. Consult your physician for personalized interpretation

## Bottom Line
${getNaturalConclusion(topic, guidelines)}

---
🔗 ${linkLabel}: ${WEBSITE_CONFIG.url}

---
*Dr. Muddu Surendra Nehru, MD*  
*HOMA Clinic, Gachibowli, Hyderabad*
`.trim();
  }

  if (contentType === "social") {
    const intro = guidelines.naturalLanguageIntro.slice(0, 120).trim() + (guidelines.naturalLanguageIntro.length > 120 ? "…" : "");
    return `${topic}\n\n${intro}\n\n🔗 ${linkLabel}: ${WEBSITE_CONFIG.url}`.trim();
  }

  if (contentType === "handout") {
    return `
# ${topic}
**HOMA Clinic, Hyderabad**

## Key points
${guidelines.recommendations.map((r) => `• ${r}`).join("\n")}

## Indian context
${guidelines.localEvidence.length > 0 ? guidelines.localEvidence.map((e) => `• ${e}`).join("\n") : guidelines.summary}

---
🔗 ${linkLabel}: ${WEBSITE_CONFIG.url}
`.trim();
  }

  return `Content for ${contentType} on ${topic}`;
}

function getNaturalConclusion(
  topic: string,
  guidelines: GuidelineResult
): string {
  const keyPoint =
    guidelines.recommendations[0] ?? "individualized assessment";
  const isImperative = /^(consult|monitor|focus|use|get|start|combine)/i.test(keyPoint.trim());
  const cornerstone = isImperative
    ? `Following that advice remains the cornerstone of effective care.`
    : `${keyPoint} remains the cornerstone of effective care.`;
  return `Understanding ${topic} in the context of metabolic health requires balancing evidence, practicality, and personal factors. ${isImperative ? keyPoint + ". " + cornerstone : cornerstone} As research in Indian populations grows, we'll continue to refine guidance – but the fundamentals of routine monitoring, lifestyle focus, and clinician partnership remain timeless.`;
}

function buildFoodContent(input: NaturalContentInput, food: FoodFactResult): string {
  const { topic, audience, contentType, language } = input;
  const linkLabel = getWebsiteLabel(language);
  const url = WEBSITE_CONFIG.url;

  if (contentType === "blog") {
    return `
# ${topic}

## Introduction
${food.naturalIntro}

## Nutritional facts (per serving)
| Nutrient | Value |
|----------|--------|
| Serving size | ${food.perServing} |
| Calories | ${food.calories} |
| Glycemic index | ${food.glycemicIndex} |
| Glycemic load | ${food.glycemicLoad} |
| Fiber | ${food.fiber} |
| Protein | ${food.protein} |
| Fat | ${food.fat} |
| Carbs | ${food.carbs} |

## Diabetes verdict
**${food.diabetesVerdict}**

## Portion guidance
${food.portionGuidance}

## Pairing tips
${food.pairingTips.map((t) => `• ${t}`).join("\n")}

## Indian context
${food.indianContext}

## Bottom line
Use the facts above as a starting point. Monitor your own blood glucose when you include ${food.foodName} in your diet, and consult your dietitian or doctor for personalized advice.

---
🔗 ${linkLabel}: ${url}

---
*Dr. Muddu Surendra Nehru, MD*  
*HOMA Clinic, Gachibowli, Hyderabad*
`.trim();
  }

  if (contentType === "social") {
    const intro = food.naturalIntro.slice(0, 120).trim() + (food.naturalIntro.length > 120 ? "…" : "");
    return `${topic}\n\n${intro}\n\n${food.diabetesVerdict}\n\n🔗 ${linkLabel}: ${url}`.trim();
  }

  if (contentType === "handout") {
    return `
# ${topic}
**HOMA Clinic, Hyderabad**

## Key facts
• Serving: ${food.perServing} | Calories: ${food.calories} | GI: ${food.glycemicIndex}
• Verdict: ${food.diabetesVerdict}
• ${food.portionGuidance}

## Tips
${food.pairingTips.map((t) => `• ${t}`).join("\n")}

---
🔗 ${linkLabel}: ${url}
`.trim();
  }

  return `Content for ${contentType} on ${topic}`;
}
