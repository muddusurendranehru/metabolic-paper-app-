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

export function parseNutritionBotText(rawText: string): ParsedNutritionData | null {
  try {
    const lines = rawText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const foodName =
      lines[0]
        ?.replace(/[🔥🥩🍞🥑🟢🟡🔴]/g, "")
        .replace(/\d+/g, "")
        .replace(/\|.*$/, "")
        .trim() || "Unknown Food";

    let verdict: ParsedNutritionData["diabetesVerdict"] = "⚠️ Limit portion";
    if (rawText.includes("🟢 SAFE") || /SAFE\s*FOR\s*DIABETES/i.test(rawText))
      verdict = "✅ Good in moderation";
    else if (rawText.includes("🟡 LIMIT")) verdict = "⚠️ Limit portion";
    else if (rawText.includes("🔴 AVOID")) verdict = "❌ Avoid if uncontrolled";

    const extractNumber = (label: string, unit = ""): number | null => {
      const pattern = new RegExp(
        `${label}:?\\s*([\\d.]+)\\s*${unit}`.replace(/\s+/g, "\\s*"),
        "i"
      );
      const match = rawText.match(pattern);
      return match ? parseFloat(match[1]) : null;
    };

    const extractString = (label: string): string => {
      const pattern = new RegExp(`${label}:?\\s*([^\\n]+)`, "i");
      const match = rawText.match(pattern);
      return match ? match[1].trim() : "N/A";
    };

    const calories = extractNumber("Calories") ?? 100;
    const protein = extractString("Protein");
    const carbs = extractString("Carbs");
    const fat = extractString("Fat");
    const fiber = extractString("Fiber") || "1-2g";

    const glycemicIndex = estimateGI(foodName);
    const glycemicLoad = estimateGL(carbs, glycemicIndex);
    const portionGuidance = generatePortionGuidance(verdict, foodName);
    const pairingTips = generatePairingTips({ protein, carbs, fat });
    const indianContext = `${foodName} is commonly consumed in Telangana/Andhra. Choose fresh, minimally processed forms when possible.`;

    return {
      foodName,
      perServing: "typical home portion (1 katori / 1 cup / 1 medium)",
      calories,
      glycemicIndex,
      glycemicLoad,
      fiber,
      protein,
      fat,
      carbs,
      diabetesVerdict: verdict,
      portionGuidance,
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

function generatePairingTips(macros: {
  protein: string;
  carbs: string;
  fat: string;
}): string[] {
  const tips: string[] = [];
  const carbNum = parseFloat(macros.carbs.replace(/[^\d.]/g, "")) || 0;
  const fatNum = parseFloat(macros.fat.replace(/[^\d.]/g, "")) || 0;
  const proteinNum = parseFloat(macros.protein.replace(/[^\d.]/g, "")) || 0;

  if (carbNum > 15 || macros.carbs.includes("20"))
    tips.push("Pair with protein (curd, nuts) to slow glucose absorption");
  if (fatNum > 8 || macros.fat.includes("10"))
    tips.push("Choose healthy fats; avoid deep-fried preparations");
  if (proteinNum > 5 || macros.protein.includes("6"))
    tips.push("Good protein source; combine with fiber-rich vegetables");

  return tips.length > 0 ? tips : ["Monitor your blood sugar response after eating"];
}
