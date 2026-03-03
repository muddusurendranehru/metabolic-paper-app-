/**
 * Step 12 – Nutrition Bot + Step 12 workflow.
 * POST { topic, nutritionData } → { blog?, twitter?, handout? } with website link injected.
 * Does NOT call OpenAI; uses provided Nutrition Bot JSON only. No steps 1–6.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  buildContentFromNutritionData,
  normalizeNutritionBotJson,
} from "@/lib/utils/step12/nutrition-bot-content";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const nutritionDataRaw = body.nutritionData ?? body.nutrition_data ?? body.data;
    const language = typeof body.language === "string" ? body.language : "en";
    const formats = Array.isArray(body.formats)
      ? body.formats.filter((f: unknown) => f === "blog" || f === "twitter" || f === "handout")
      : ["blog", "twitter", "handout"];

    if (!topic) {
      return NextResponse.json({ error: "topic required" }, { status: 400 });
    }

    const nutritionData = normalizeNutritionBotJson(nutritionDataRaw);
    if (!nutritionData) {
      return NextResponse.json(
        { error: "Valid nutritionData (Nutrition Bot JSON) required" },
        { status: 400 }
      );
    }

    const result = buildContentFromNutritionData({
      topic,
      nutritionData,
      language: language as "en" | "hi" | "te" | "ta",
      formats,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Step 12 from-nutrition-bot error:", error);
    return NextResponse.json(
      { error: "Content generation from Nutrition Bot data failed" },
      { status: 500 }
    );
  }
}
