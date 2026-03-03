/**
 * Step 12 – Batch content via Nutrition Bot API with local fallback.
 * POST { topics?: string[], items?: [{ topic, language?, formats? }], language?, formats?, useNutritionBot? }
 * → { results: { topic, language?, blog?, twitter?, handout?, source }[] }.
 * useNutritionBot: true = try API then fallback; false = local only. No steps 1–6.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getNutritionForTopicWithFallbackAndSource,
} from "@/lib/utils/step12/nutrition-bot-client";
import { getFoodFacts } from "@/lib/utils/step12/food-facts";
import { buildContentFromNutritionData } from "@/lib/utils/step12/nutrition-bot-content";

export const runtime = "nodejs";
export const maxDuration = 120;

type Lang = "en" | "hi" | "te" | "ta";
type FormatOption = "blog" | "twitter" | "handout";
const LANGS: Lang[] = ["en", "hi", "te", "ta"];
const FORMATS_LIST: FormatOption[] = ["blog", "twitter", "handout"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useNutritionBot = body.useNutritionBot !== false;

    const rawItems = body.items;
    let rows: { topic: string; language: Lang; formats: FormatOption[] }[] = [];

    if (Array.isArray(rawItems) && rawItems.length > 0) {
      rows = rawItems.map((row: Record<string, unknown>) => {
        const topic = typeof row.topic === "string" ? row.topic.trim() : "";
        const lang = typeof row.language === "string" && LANGS.includes(row.language as Lang) ? (row.language as Lang) : "en";
        const rawFormats = row.formats;
        const formats: FormatOption[] = Array.isArray(rawFormats)
          ? (rawFormats.filter((f: unknown) => FORMATS_LIST.includes(f as FormatOption)) as FormatOption[])
          : [...FORMATS_LIST];
        return { topic, language: lang, formats: formats.length ? formats : [...FORMATS_LIST] };
      }).filter((r) => r.topic.length > 0);
    } else {
      const rawTopics = body.topics;
      const topics: string[] = Array.isArray(rawTopics)
        ? rawTopics.map((t: unknown) => (typeof t === "string" ? t.trim() : "")).filter(Boolean)
        : typeof rawTopics === "string"
          ? rawTopics.split(/[\r\n,]/).map((s) => s.trim()).filter(Boolean)
          : [];
      const language = typeof body.language === "string" && LANGS.includes(body.language as Lang) ? (body.language as Lang) : "en";
      const formats: FormatOption[] = Array.isArray(body.formats)
        ? (body.formats.filter((f: unknown) => FORMATS_LIST.includes(f as FormatOption)) as FormatOption[])
        : [...FORMATS_LIST];
      if (topics.length === 0) {
        return NextResponse.json(
          { error: "topics or items required" },
          { status: 400 }
        );
      }
      rows = topics.map((topic) => ({ topic, language, formats }));
    }

    const results: { topic: string; language?: string; blog?: string; twitter?: string; handout?: string; source?: "nutrition-bot" | "local" }[] = [];

    for (const row of rows) {
      const { topic, language: lang, formats } = row;
      let facts;
      let source: "nutrition-bot" | "local" | undefined;
      if (useNutritionBot) {
        const out = await getNutritionForTopicWithFallbackAndSource(topic, lang);
        facts = out.facts;
        source = out.source;
      } else {
        facts = await getFoodFacts(topic, lang);
        source = "local";
      }
      const content = buildContentFromNutritionData({
        topic,
        nutritionData: facts,
        language: lang,
        formats,
      });
      results.push({ topic, language: lang, ...content, source });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Step 12 batch-nutrition error:", error);
    return NextResponse.json(
      { error: "Batch nutrition content generation failed" },
      { status: 500 }
    );
  }
}
