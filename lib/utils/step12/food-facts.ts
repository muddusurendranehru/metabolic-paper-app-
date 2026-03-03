/**
 * Step 12 – simple food facts for Indian diabetes (calories, GI, fiber, portion guidance).
 * ISOLATED: Only this folder (lib/utils/step12). No steps 1–6; no patientData.
 * For FOOD topics only. Fallback: safe defaults. Preserve medical terms in English.
 */

import OpenAI from "openai";

export interface FoodFactResult {
  foodName: string;
  perServing: string;
  calories: number;
  glycemicIndex: string;
  glycemicLoad: string;
  fiber: string;
  protein: string;
  fat: string;
  carbs: string;
  diabetesVerdict: "✅ Good in moderation" | "⚠️ Limit portion" | "❌ Avoid if uncontrolled";
  portionGuidance: string;
  pairingTips: string[];
  indianContext: string;
  naturalIntro: string;
}

const FOOD_TOPIC_KEYWORDS = [
  "grapes", "papaya", "poha", "ghee", "jaggery", "mango", "banana", "apple",
  "rice", "roti", "idli", "dosa", "oats", "bread", "milk", "curd", "dal",
  "chickpea", "pomegranate", "guava", "orange", "dates", "nuts", "oil",
  "seethaphal", "custard", "sapota", "watermelon", "coconut", "lentil",
];

/** True if topic looks like a food/diet question (e.g. "grapes and diabetes", "brown poha diabetes"). */
export function isFoodTopic(topic: string): boolean {
  const lower = topic.toLowerCase().trim();
  if (lower.length < 3) return false;
  const words = lower.split(/[\s&+,]+/);
  return words.some((w) => FOOD_TOPIC_KEYWORDS.includes(w.replace(/s$/, "")) || FOOD_TOPIC_KEYWORDS.some((k) => w.includes(k)));
}

/** Extract food name from topic: "grapes and diabetes" → "Grapes", "brown poha diabetes" → "Brown Poha". */
export function extractFoodName(topic: string): string {
  const words = topic.toLowerCase().split(/[\s&]+/);
  const stopWords = ["and", "for", "with", "in", "diabetes", "diet", "healthy", "the"];
  const foodWords = words.filter((w) => !stopWords.includes(w) && w.length > 2);
  return foodWords.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || topic;
}

function defaultFallback(foodName: string): FoodFactResult {
  return {
    foodName,
    perServing: "typical serving",
    calories: 100,
    glycemicIndex: "Medium (approx)",
    glycemicLoad: "Medium",
    fiber: "2g",
    protein: "3g",
    fat: "3g",
    carbs: "20g",
    diabetesVerdict: "⚠️ Limit portion",
    portionGuidance: "Consult your dietitian for personalized advice",
    pairingTips: ["Pair with protein/fiber to blunt glucose response"],
    indianContext: "Individual responses vary; monitor your own blood sugar after eating.",
    naturalIntro: `If you're wondering about ${foodName.toLowerCase()} and diabetes, you're not alone. Many patients in India ask about portion sizes and timing. Here's a simple, practical breakdown based on available nutrition data.`,
  };
}

function getFallbackFoodFacts(foodName: string): FoodFactResult {
  const key = Object.keys(FALLBACKS).find((k) => k.toLowerCase() === foodName.toLowerCase());
  const base = key ? FALLBACKS[key as keyof typeof FALLBACKS] : null;
  if (!base) return defaultFallback(foodName);
  return {
    ...defaultFallback(foodName),
    ...base,
    foodName: key || foodName,
    naturalIntro: base.naturalIntro ?? defaultFallback(foodName).naturalIntro,
  };
}

const FALLBACKS: Record<string, Partial<FoodFactResult>> = {
  Grapes: {
    calories: 104,
    perServing: "1 cup (150g)",
    glycemicIndex: "Low (43-53)",
    glycemicLoad: "Low (5-10)",
    fiber: "1.4g",
    protein: "1.1g",
    fat: "0.2g",
    carbs: "27g",
    diabetesVerdict: "✅ Good in moderation",
    portionGuidance: "1/2 cup (75g) per serving",
    pairingTips: ["Pair with almonds or walnuts to slow sugar absorption"],
    indianContext: "Commonly eaten as fresh snack; avoid canned grapes in syrup.",
    naturalIntro: "If you're wondering about grapes and diabetes, you're not alone. Many patients in India ask about portion sizes. Here's a simple breakdown: grapes have moderate natural sugar but are low GI when eaten in small portions with fiber.",
  },
  Papaya: {
    calories: 62,
    perServing: "1 cup diced (140g)",
    glycemicIndex: "Low (38-60)",
    glycemicLoad: "Low (4-11)",
    fiber: "2.5g",
    protein: "0.7g",
    fat: "0.1g",
    carbs: "16g",
    diabetesVerdict: "✅ Good in moderation",
    portionGuidance: "1 cup diced per serving",
    pairingTips: ["Eat fresh, not as juice; combine with protein for balanced snack"],
    indianContext: "Widely available year-round; choose ripe but firm fruit.",
    naturalIntro: "Papaya and diabetes is a common question in Indian clinics. Papaya has a low to medium glycemic index and is rich in fiber and vitamins. Portion control is key.",
  },
  "Brown Poha": {
    calories: 180,
    perServing: "1 katori (100g cooked)",
    glycemicIndex: "Medium (56-69)",
    glycemicLoad: "Medium (15-20)",
    fiber: "2g",
    protein: "4g",
    fat: "6g",
    carbs: "30g",
    diabetesVerdict: "⚠️ Limit portion",
    portionGuidance: "1 small katori (75g) with extra vegetables",
    pairingTips: ["Add peanuts, peas, and extra vegetables to increase fiber", "Avoid excess oil and potatoes"],
    indianContext: "Popular breakfast; choose brown poha over white for slightly more fiber.",
    naturalIntro: "Brown poha is a popular Indian breakfast. For people with diabetes, portion size and what you add (vegetables, peanuts) matter more than avoiding it entirely.",
  },
  Ghee: {
    calories: 112,
    perServing: "1 tbsp (14g)",
    glycemicIndex: "N/A (fat)",
    glycemicLoad: "N/A",
    fiber: "0g",
    protein: "0g",
    fat: "12.7g",
    carbs: "0g",
    diabetesVerdict: "✅ Good in moderation",
    portionGuidance: "1–2 tsp per meal for flavour; no direct blood sugar spike",
    pairingTips: ["Use with high-fiber foods to improve satiety", "Avoid large amounts if watching weight"],
    indianContext: "Traditional fat; does not raise blood glucose directly; use in small amounts.",
    naturalIntro: "Ghee and diabetes is often asked in Indian practice. Ghee is a fat and does not raise blood sugar directly. Moderation and total calorie balance matter.",
  },
  Jaggery: {
    calories: 38,
    perServing: "1 tsp (10g)",
    glycemicIndex: "High (84+)",
    glycemicLoad: "High",
    fiber: "0g",
    protein: "0g",
    fat: "0g",
    carbs: "10g",
    diabetesVerdict: "⚠️ Limit portion",
    portionGuidance: "Minimal or avoid; use as occasional small amount, not daily",
    pairingTips: ["Prefer other sweeteners or avoid if glucose uncontrolled"],
    indianContext: "Traditional sweetener; use sparingly; monitor blood sugar if used.",
    naturalIntro: "Jaggery and diabetes: jaggery is still a sugar and raises blood glucose. Small amounts may be used occasionally, but it is not a 'safe' substitute for sugar in large doses.",
  },
};

/**
 * Get simple nutritional facts and diabetes guidance for a food topic.
 * Uses OpenAI when key is set; otherwise returns fallback for known foods or safe default.
 */
export async function getFoodFacts(
  foodTopic: string,
  language: "en" | "hi" | "te" | "ta" = "en"
): Promise<FoodFactResult> {
  const foodName = extractFoodName(foodTopic);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("Step 12: OPENAI_API_KEY missing; using fallback food facts.");
    return getFallbackFoodFacts(foodName);
  }

  const languageInstruction =
    language !== "en"
      ? `Translate explanatory text to ${language.toUpperCase()}, but KEEP these terms in English: calories, glycemic index, GI, fiber, protein, fat, carbs, diabetes, insulin, glucose.`
      : "Keep all content in English.";

  const prompt = `
You are a nutrition expert for Indian diabetes care.

FOOD: "${foodName}"

TASK: Provide SIMPLE, PRACTICAL nutritional facts for people with diabetes in India.

OUTPUT FORMAT (JSON ONLY):
{
  "foodName": "${foodName}",
  "perServing": "typical Indian serving size (e.g., '1 cup (150g)', '1 medium fruit', '1 katori (100g)')",
  "calories": number,
  "glycemicIndex": "Low (≤55) / Medium (56-69) / High (≥70) + approximate value",
  "glycemicLoad": "Low (≤10) / Medium (11-19) / High (≥20)",
  "fiber": "Xg per serving",
  "protein": "Xg per serving",
  "fat": "Xg per serving",
  "carbs": "Xg per serving",
  "diabetesVerdict": "✅ Good in moderation" OR "⚠️ Limit portion" OR "❌ Avoid if uncontrolled",
  "portionGuidance": "simple portion advice for Indian patients",
  "pairingTips": ["tip 1", "tip 2"],
  "indianContext": "how this food is typically consumed in India + any cultural notes",
  "naturalIntro": "80-120 word engaging intro that sounds human-written"
}

RULES:
1. Use approximate values if exact data unavailable (cite "approximate" in response)
2. For Indian foods (poha, idli, roti, etc.): use typical home-cooked preparation assumptions
3. For fruits: specify fresh vs. juice vs. dried differences if relevant
4. Keep verdict SIMPLE: ✅ Good / ⚠️ Limit / ❌ Avoid – no complex explanations
5. ${languageInstruction}
6. If data is uncertain, use conservative estimates and add "consult your dietitian"

RESPOND WITH VALID JSON ONLY. NO PREAMBLE.
`.trim();

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a practical nutrition expert for Indian diabetes patients." },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return getFallbackFoodFacts(foodName);

    const result = JSON.parse(raw) as Record<string, unknown>;
    if (!result.foodName || !result.diabetesVerdict || result.calories == null) {
      return getFallbackFoodFacts(foodName);
    }

    const num = (v: unknown) => (typeof v === "number" && !Number.isNaN(v) ? v : 0);
    const str = (v: unknown) => (typeof v === "string" ? v : "");
    const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

    return {
      foodName: str(result.foodName) || foodName,
      perServing: str(result.perServing) || "typical serving",
      calories: num(result.calories),
      glycemicIndex: str(result.glycemicIndex) || "Medium (approx)",
      glycemicLoad: str(result.glycemicLoad) || "Medium",
      fiber: str(result.fiber) || "—",
      protein: str(result.protein) || "—",
      fat: str(result.fat) || "—",
      carbs: str(result.carbs) || "—",
      diabetesVerdict: (str(result.diabetesVerdict) as FoodFactResult["diabetesVerdict"]) || "⚠️ Limit portion",
      portionGuidance: str(result.portionGuidance) || "Consult your dietitian",
      pairingTips: arr(result.pairingTips),
      indianContext: str(result.indianContext) || "Individual responses vary.",
      naturalIntro: str(result.naturalIntro) || getFallbackFoodFacts(foodName).naturalIntro,
    };
  } catch (error) {
    console.error("Step 12 food facts lookup failed (using fallback):", error);
    return getFallbackFoodFacts(foodName);
  }
}
