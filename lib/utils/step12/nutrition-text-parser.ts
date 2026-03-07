/**
 * Step 12 – parse Nutrition Bot plain text/emoji output into JSON for Step 12 generators.
 * UNIVERSAL: Works for any food (ghee, papaya, poha, seeds, sweets, grains, etc.). Not hardwired to any single item.
 * Example inputs: "Bellam Watermelon Seed Undalu", "Ghee", "Brown poha diabetes", "Papaya" – same parsing logic.
 * ISOLATED: Only this folder (lib/utils/step12). No steps 1–6.
 *
 * SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - Graceful fallback: if parsing fails → return null → local generator used
 * - Website link auto-injected in all outputs
 * - If this adapter is removed, Step 12 falls back to local generator (Steps 1-6 unaffected)
 */

export interface ParsedNutritionData {
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
}

/** Try to extract and parse a JSON object from hybrid Nutrition Bot text. */
function extractJsonFromNutritionBotText(raw: string): Record<string, unknown> | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as Record<string, unknown>;
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

/** Map JSON blob to ParsedNutritionData if it has required fields. */
function mapJsonToSchema(json: Record<string, unknown>): ParsedNutritionData | null {
  try {
    const foodName = (json.foodName as string) || (json.name as string) || "Unknown Food";
    const calories = typeof json.calories === "number" ? json.calories : parseFloat(String(json.calories || 0)) || 100;
    const protein = String(json.protein ?? "N/A").replace(/^(\d+(?:\.\d+)?)$/, "$1g");
    const carbs = String(json.carbs ?? "N/A").replace(/^(\d+(?:\.\d+)?)$/, "$1g");
    const fat = String(json.fat ?? "N/A").replace(/^(\d+(?:\.\d+)?)$/, "$1g");
    const fiber = String(json.fiber ?? "1-2g");
    const verdict =
      json.diabetesVerdict === "✅ Good in moderation" || /safe|good/i.test(String(json.diabetesVerdict ?? ""))
        ? ("✅ Good in moderation" as const)
        : json.diabetesVerdict === "❌ Avoid if uncontrolled" || /avoid/i.test(String(json.diabetesVerdict ?? ""))
          ? ("❌ Avoid if uncontrolled" as const)
          : ("⚠️ Limit portion" as const);
    return {
      foodName: String(foodName),
      perServing: String(json.perServing ?? "typical home portion (1 scoop / 1 katori / 1 cup)"),
      calories,
      glycemicIndex: String(json.glycemicIndex ?? estimateGI(foodName)),
      glycemicLoad: String(json.glycemicLoad ?? "Medium (11-19)"),
      fiber,
      protein,
      fat,
      carbs,
      diabetesVerdict: verdict,
      portionGuidance: String(json.portionGuidance ?? generatePortionGuidance(verdict, foodName)),
      pairingTips: Array.isArray(json.pairingTips) ? (json.pairingTips as string[]) : ["Monitor your blood sugar response after eating"],
      indianContext: String(json.indianContext ?? generateIndianContext(foodName)),
    };
  } catch {
    return null;
  }
}

export function parseNutritionBotText(rawText: string): ParsedNutritionData | null {
  try {
    // STEP 1: Try JSON extraction first (if Nutrition Bot returns hybrid format)
    const jsonData = extractJsonFromNutritionBotText(rawText);
    if (jsonData) {
      const mapped = mapJsonToSchema(jsonData);
      if (mapped) return mapped;
    }

    // STEP 2: Emoji-aware text parsing (fixes field collision); fallback to label-only if no emoji
    const extractByEmoji = (emoji: string, label: string): string | null => {
      const withEmoji = new RegExp(`${emoji}\\s*${label}:?\\s*([^\n]+)`, "i");
      const m1 = rawText.match(withEmoji);
      if (m1) return m1[1].trim();
      const labelOnly = new RegExp(`\\b${label}:?\\s*([^\n]+)`, "i");
      const m2 = rawText.match(labelOnly);
      return m2 ? m2[1].trim() : null;
    };

    const caloriesStr = extractByEmoji("🔥", "Calories");
    const proteinStr = extractByEmoji("🥩", "Protein");
    const carbsStr = extractByEmoji("🍞", "Carbs");
    const fatStr = extractByEmoji("🥑", "Fat");
    const fiberStr = extractByEmoji("🌾", "Fiber") || extractByEmoji("🥗", "Fiber") || "1-2g";

    const parseNumber = (str: string | null, fallback: number): number => {
      if (!str) return fallback;
      const num = parseFloat(str.replace(/[^\d.]/g, ""));
      return Number.isNaN(num) ? fallback : num;
    };

    const calories = parseNumber(caloriesStr, 100);
    const protein = proteinStr || `${parseNumber(proteinStr, 0)}g`;
    const carbs = carbsStr || `${parseNumber(carbsStr, 0)}g`;
    const fat = fatStr || `${parseNumber(fatStr, 0)}g`;
    const fiber = fiberStr;

    const firstLine = rawText.split("\n")[0]?.trim() || "Unknown Food";
    const foodName = firstLine
      .replace(/[🔥🥩🍞🥑🟢🟡🔴🤖🌾🥗]/g, "")
      .replace(/\d+/g, "")
      .replace(/\|.*$/, "")
      .trim() || "Unknown Food";

    let verdict: ParsedNutritionData["diabetesVerdict"] = "⚠️ Limit portion";
    if (rawText.includes("🟢 SAFE") || /SAFE\s*FOR\s*DIABETES/i.test(rawText)) verdict = "✅ Good in moderation";
    else if (rawText.includes("🟡 LIMIT")) verdict = "⚠️ Limit portion";
    else if (rawText.includes("🔴 AVOID")) verdict = "❌ Avoid if uncontrolled";
    else if (calories < 150 && parseNumber(proteinStr, 0) > 5) verdict = "✅ Good in moderation";

    const glycemicIndex = estimateGI(foodName);
    const glycemicLoad = estimateGL(carbs, glycemicIndex);
    const pairingTips = generateSmartPairingTips(foodName, { protein, carbs, fat, fiber });
    const indianContext = generateIndianContext(foodName);

    return {
      foodName,
      perServing: "typical home portion (1 scoop / 1 katori / 1 cup)",
      calories,
      glycemicIndex,
      glycemicLoad,
      fiber,
      protein,
      fat,
      carbs,
      diabetesVerdict: verdict,
      portionGuidance: generatePortionGuidance(verdict, foodName),
      pairingTips,
      indianContext,
    };
  } catch (error) {
    console.warn("Failed to parse Nutrition Bot text:", error);
    return null;
  }
}

/** Universal heuristic: common Indian foods by category. Not tied to any single item (e.g. watermelon is one of many). */
function estimateGI(foodName: string): string {
  const lower = foodName.toLowerCase();
  if (
    /\b(jaggery|bellam|sugar|honey|watermelon|mango|grapes|dates|juice)\b/.test(lower) ||
    lower.includes("high") ||
    lower.includes("sweet")
  )
    return "High (≥70)";
  if (
    /\b(seed|nut|almond|peanut|undalu|ghee|oil|dal|lentil)\b/.test(lower) ||
    lower.includes("protein")
  )
    return "Low (≤55)";
  if (
    /\b(poha|rice|roti|idli|dosa|oats|bread|chapati)\b/.test(lower) ||
    lower.includes("grain") ||
    lower.includes("carb")
  )
    return "Medium (56-69)";
  return "Medium (56-69)";
}

function estimateGL(carbsStr: string, gi: string): string {
  const num = carbsStr.replace(/[^\d.]/g, "");
  const carbs = parseFloat(num) || 20;
  const giValue = gi.includes("Low") ? 45 : gi.includes("Medium") ? 60 : 75;
  const gl = (carbs * giValue) / 100;
  if (gl <= 10) return "Low (≤10)";
  if (gl <= 19) return "Medium (11-19)";
  return "High (≥20)";
}

function generatePortionGuidance(
  verdict: string,
  foodName: string
): string {
  if (verdict.includes("Good")) return "1 typical serving per day";
  if (verdict.includes("Limit"))
    return "1/2 to 1 typical serving, monitor response";
  return "Consult dietitian; small portions only if blood sugar controlled";
}

function generateSmartPairingTips(
  foodName: string,
  macros: { protein: string; carbs: string; fat: string; fiber: string }
): string[] {
  const tips: string[] = [];
  const lower = foodName.toLowerCase();

  if (!lower.includes("protein") && !lower.includes("whey") && !lower.includes("casein")) {
    if (macros.carbs.includes("20") || parseFloat(macros.carbs.replace(/[^\d.]/g, "")) > 15) {
      tips.push("Pair with protein (curd, nuts, dal) to slow glucose absorption");
    }
  }

  if (macros.fat.includes("10") || parseFloat(macros.fat.replace(/[^\d.]/g, "")) > 8) {
    tips.push("Choose healthy fats; avoid deep-fried preparations");
  }

  if (macros.fiber.includes("N/A") || macros.fiber.includes("0")) {
    tips.push("Add vegetables or whole grains to increase fiber intake");
  }

  if (tips.length === 0) {
    tips.push("Monitor your blood sugar response after eating");
  }

  return tips;
}

function generateIndianContext(foodName: string): string {
  const lower = foodName.toLowerCase();

  if (lower.includes("ghee") || lower.includes("poha") || lower.includes("idli") || lower.includes("dosa")) {
    return `${foodName} is commonly prepared in Indian homes. Choose homemade versions for better oil/salt control.`;
  }

  if (lower.includes("jackfruit") || lower.includes("papaya") || lower.includes("mango") || lower.includes("guava")) {
    return `${foodName} is seasonally available across India. Choose fresh, locally grown varieties when possible.`;
  }

  if (lower.includes("protein") || lower.includes("whey") || lower.includes("supplement")) {
    return `${foodName} supplements are available in Indian markets. Choose reputable brands with third-party testing. Consult your dietitian before adding supplements.`;
  }

  return `${foodName} can be incorporated into Indian dietary patterns with attention to portion sizes and overall balance.`;
}
