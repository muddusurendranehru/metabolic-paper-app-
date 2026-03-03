/**
 * Step 12 – build blog, twitter, handout from Nutrition Bot JSON (no OpenAI; link always injected).
 * Separate path: input = Nutrition Bot JSON + topic → output = multi-format content.
 * Does NOT replace or change existing food/non-food flows.
 */

import type { FoodFactResult } from "./food-facts";
import { WEBSITE_CONFIG } from "./step12-config";

export type NutritionBotLanguage = "en" | "hi" | "te" | "ta";

export interface NutritionBotContentInput {
  topic: string;
  /** Nutrition Bot JSON (calories, GI, fiber, verdict, etc.) – same shape as FoodFactResult */
  nutritionData: FoodFactResult;
  language?: NutritionBotLanguage;
  /** Which formats to build; default all */
  formats?: ("blog" | "twitter" | "handout")[];
}

export interface NutritionBotContentOutput {
  blog?: string;
  twitter?: string;
  handout?: string;
}

const WEBSITE_LABELS: Record<string, string> = {
  en: "Free Metabolic Tools",
  hi: "निःशुल्क मेटाबोलिक टूल्स",
  te: "ఉచిత మెటాబాలిక్ సాధనాలు",
  ta: "இலவச வளர்சிதை மாற்ற கருவிகள்",
};

function getLabel(lang: string): string {
  return WEBSITE_LABELS[lang] ?? WEBSITE_LABELS.en;
}

/**
 * Build Step 12 content from Nutrition Bot JSON + topic.
 * Use when Nutrition Bot (external) has already provided calories, GI, fiber, verdict, etc.
 */
export function buildContentFromNutritionData(input: NutritionBotContentInput): NutritionBotContentOutput {
  const { topic, nutritionData: f, language = "en", formats = ["blog", "twitter", "handout"] } = input;
  const url = WEBSITE_CONFIG.url;
  const label = getLabel(language);

  const out: NutritionBotContentOutput = {};

  if (formats.includes("blog")) {
    out.blog = `
# ${f.foodName} and Diabetes: Simple Nutrition Facts

## Introduction
${f.naturalIntro}

## Quick Nutrition Facts (${f.perServing})
| Nutrient | Amount |
|----------|--------|
| Calories | ${f.calories} kcal |
| Glycemic Index | ${f.glycemicIndex} |
| Glycemic Load | ${f.glycemicLoad} |
| Fiber | ${f.fiber} |
| Protein | ${f.protein} |
| Fat | ${f.fat} |
| Carbs | ${f.carbs} |

## Diabetes Verdict: ${f.diabetesVerdict}
**Portion Guidance:** ${f.portionGuidance}

### Smart Pairing Tips
${(f.pairingTips || []).map((tip) => `• ${tip}`).join("\n")}

### Indian Context
${f.indianContext}

## Practical Tips for You
1. **Start small**: Try the recommended portion and check your blood sugar 2 hours later
2. **Pair wisely**: Combine with protein (nuts, curd) or fiber (vegetables) to slow glucose rise
3. **Timing matters**: Eat as part of a meal, not alone on empty stomach
4. **Monitor your response**: Everyone's body reacts differently – track your own patterns
5. **Use free tools**: Calculate your metabolic risk at ${url}

## Bottom Line
${f.foodName} can fit into a diabetes-friendly diet when portions are controlled and paired thoughtfully. Focus on overall dietary patterns, not single foods. When in doubt, consult your physician or dietitian for personalized advice.

---
🔗 ${label}: ${url}

---
*Dr. Muddu Surendra Nehru, MD*  
*HOMA Clinic, Gachibowli, Hyderabad*
`.trim();
  }

  if (formats.includes("twitter")) {
    const intro = (f.naturalIntro || "").slice(0, 100).trim() + (f.naturalIntro.length > 100 ? "…" : "");
    out.twitter = `${topic}\n\n${intro}\n\n${f.diabetesVerdict}\n\n🔗 ${label}: ${url}`.trim();
  }

  if (formats.includes("handout")) {
    out.handout = `
# ${topic}
**HOMA Clinic, Hyderabad**

## Key facts
• Serving: ${f.perServing} | Calories: ${f.calories} | GI: ${f.glycemicIndex}
• Verdict: ${f.diabetesVerdict}
• ${f.portionGuidance}

## Tips
${(f.pairingTips || []).map((t) => `• ${t}`).join("\n")}

---
🔗 ${label}: ${url}
`.trim();
  }

  return out;
}

/**
 * Normalize external Nutrition Bot JSON into FoodFactResult shape (safe defaults for missing fields).
 */
export function normalizeNutritionBotJson(raw: unknown): FoodFactResult | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === "number" && !Number.isNaN(v) ? v : 0);
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

  const foodName = str(o.foodName || o.food_name) || "Food";
  const verdict = str(o.diabetesVerdict || o.diabetes_verdict || o.verdict);
  const validVerdict: FoodFactResult["diabetesVerdict"] =
    verdict.includes("Good") || verdict.includes("✅")
      ? "✅ Good in moderation"
      : verdict.includes("Avoid") || verdict.includes("❌")
        ? "❌ Avoid if uncontrolled"
        : "⚠️ Limit portion";

  return {
    foodName,
    perServing: str(o.perServing || o.per_serving) || "1 serving",
    calories: num(o.calories),
    glycemicIndex: str(o.glycemicIndex || o.glycemic_index || o.gi) || "—",
    glycemicLoad: str(o.glycemicLoad || o.glycemic_load || o.gl) || "—",
    fiber: str(o.fiber) || "—",
    protein: str(o.protein) || "—",
    fat: str(o.fat) || "—",
    carbs: str(o.carbs) || "—",
    diabetesVerdict: validVerdict,
    portionGuidance: str(o.portionGuidance || o.portion_guidance) || "Consult your dietitian",
    pairingTips: arr(o.pairingTips || o.pairing_tips),
    indianContext: str(o.indianContext || o.indian_context) || "Individual responses vary.",
    naturalIntro:
      str(o.naturalIntro || o.natural_intro) ||
      `Simple nutrition facts for ${foodName} and diabetes – use the table below as a starting point and consult your dietitian for personalized advice.`,
  };
}
