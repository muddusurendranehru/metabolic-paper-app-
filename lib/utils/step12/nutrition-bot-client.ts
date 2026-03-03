/**
 * Step 12 – Nutrition Bot API client (external app). Fallback: local food-facts.
 * ISOLATED: Only this folder (lib/utils/step12). No steps 1–6.
 * If Nutrition Bot API fails, callers use getNutritionForTopicWithFallback → getFoodFacts (never break output).
 */

import type { FoodFactResult } from "./food-facts";
import { getFoodFacts } from "./food-facts";
import { normalizeNutritionBotJson } from "./nutrition-bot-content";
import { parseNutritionBotText, type ParsedNutritionData } from "./nutrition-text-parser";

const NUTRITION_BOT_API_URL = "https://nutrition-bot-frontend.onrender.com/api/nutrition";

/** Response shape from Nutrition Bot API when it returns JSON (may omit naturalIntro). */
export interface NutritionBotResponse {
  foodName: string;
  perServing: string;
  calories: number;
  glycemicIndex: string;
  glycemicLoad: string;
  fiber: string;
  protein: string;
  fat: string;
  carbs: string;
  diabetesVerdict:
    | "✅ Good in moderation"
    | "⚠️ Limit portion"
    | "❌ Avoid if uncontrolled";
  portionGuidance: string;
  pairingTips: string[];
  indianContext: string;
  naturalIntro?: string;
}

/**
 * Call Nutrition Bot API for a food query. Returns parsed data or null on failure (caller falls back to local generator).
 * Handles both JSON and plain text/emoji API responses via parseNutritionBotText.
 */
export async function fetchNutritionData(
  foodQuery: string
): Promise<ParsedNutritionData | null> {
  try {
    const response = await fetch(NUTRITION_BOT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: foodQuery.trim(),
        includeDiabetesGuidance: true,
      }),
    });

    if (!response.ok) throw new Error("Nutrition Bot API error");

    const rawText = await response.text();

    try {
      const jsonData = JSON.parse(rawText);
      if (jsonData != null && typeof jsonData === "object" && jsonData.calories !== undefined) {
        return jsonData as ParsedNutritionData;
      }
    } catch {
      // Not JSON, proceed to text parsing
    }

    const parsed = parseNutritionBotText(rawText);
    if (parsed) return parsed;

    throw new Error("Could not parse Nutrition Bot response");
  } catch (error) {
    console.warn("Nutrition Bot fetch failed, using local fallback:", error);
    return null;
  }
}

/**
 * Get nutrition data for a topic: try Nutrition Bot API first; on failure use local getFoodFacts.
 * Use for batch/single food-topic content so output never breaks.
 */
export async function getNutritionForTopicWithFallback(
  topic: string,
  language: "en" | "hi" | "te" | "ta" = "en"
): Promise<FoodFactResult> {
  const fromApi = await fetchNutritionData(topic);
  if (fromApi) {
    const normalized = normalizeNutritionBotJson(fromApi);
    if (normalized) return normalized;
  }
  return getFoodFacts(topic, language);
}

/** Result with source for status badges (Nutrition Bot vs local). */
export type NutritionSource = "nutrition-bot" | "local";

/**
 * Same as getNutritionForTopicWithFallback but returns { facts, source } for batch status display.
 */
export async function getNutritionForTopicWithFallbackAndSource(
  topic: string,
  language: "en" | "hi" | "te" | "ta" = "en"
): Promise<{ facts: FoodFactResult; source: NutritionSource }> {
  const fromApi = await fetchNutritionData(topic);
  if (fromApi) {
    const normalized = normalizeNutritionBotJson(fromApi);
    if (normalized) return { facts: normalized, source: "nutrition-bot" };
  }
  const facts = await getFoodFacts(topic, language);
  return { facts, source: "local" };
}
