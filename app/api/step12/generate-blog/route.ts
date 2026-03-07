/**
 * Step 12 – single-routing blog: food → simple food template; clinical → PubMed (MCT); else → neutral.
 * POST { topic, audience?, language? } → { content } (full blog with optional SEO block).
 * Uses generateBlogPost (one path per topic). No steps 1–6.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateBlogPost } from "@/lib/utils/step12/blog-with-translate";
import { extractSnippet } from "@/lib/utils/step12";

export const runtime = "nodejs";

function buildSeoBlock(title: string, summary: string): string {
  const metaTitle = title ? title.slice(0, 60) : "Medical & Health Insights";
  const metaDesc = summary.slice(0, 160);
  const words = (title + " " + summary).replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  const seen = new Set<string>();
  const keywords = words
    .filter((w) => w.length > 3 && !seen.has(w.toLowerCase()) && seen.add(w.toLowerCase()))
    .slice(0, 8)
    .join(", ");
  return ["---", "title: " + metaTitle, "description: " + metaDesc, "keywords: " + (keywords || metaTitle), "---"].join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    if (!topic) {
      return NextResponse.json({ error: "topic required" }, { status: 400 });
    }
    const audience = body.audience === "doctors" ? "doctors" : body.audience === "patients" ? "patients" : "general";
    const language = typeof body.language === "string" ? body.language : "en";

    const content = await generateBlogPost(
      { topic, audience },
      language
    );
    const summary = extractSnippet(content, 160);
    const seoBlock = buildSeoBlock(topic, summary);
    const fullContent = seoBlock + "\n\n" + content;

    return NextResponse.json({ content: fullContent });
  } catch (error) {
    console.error("Step 12 generate-blog error:", error);
    return NextResponse.json({ error: "Blog generation failed" }, { status: 500 });
  }
}
