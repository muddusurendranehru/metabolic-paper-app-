import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdfBuffer } from "@/lib/utils/pdf-parser";
import { getExtractionPrompts } from "@/lib/utils/llm-prompts";
import { parseAgeString } from "@/lib/utils/age-parser";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIN_TEXT_LENGTH_FOR_LLM = 50;

function assessRisk(tyg: number): string {
  if (tyg >= 9.5) return "High";
  if (tyg >= 8.5) return "Moderate";
  return "Normal";
}

function parseJsonResponse(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "LLM extraction not configured. Set OPENAI_API_KEY." },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Invalid PDF" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 5MB." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const pdfText = await extractTextFromPdfBuffer(buffer);

    if (pdfText.length < MIN_TEXT_LENGTH_FOR_LLM) {
      return NextResponse.json({
        error: "Not enough text for LLM extraction. Try OCR upload instead.",
        ocrSuccess: false,
      }, { status: 400 });
    }

    const { system, user } = getExtractionPrompts(pdfText);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI API error:", res.status, err);
      return NextResponse.json(
        { error: "LLM extraction failed", details: err },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No content from LLM" },
        { status: 502 }
      );
    }

    const parsed = parseJsonResponse(content);
    if (!parsed) {
      return NextResponse.json(
        { error: "Could not parse LLM response as JSON" },
        { status: 502 }
      );
    }

    const name = typeof parsed.name === "string" ? parsed.name : null;
    const ageRaw = parsed.age;
    const age = typeof ageRaw === "number" && !isNaN(ageRaw)
      ? ageRaw
      : parseAgeString(ageRaw != null ? String(ageRaw) : null);
    const sex = parsed.sex === "M" || parsed.sex === "F" ? parsed.sex : null;
    const tg = typeof parsed.tg === "number" && !isNaN(parsed.tg) ? parsed.tg : null;
    const glucose = typeof parsed.glucose === "number" && !isNaN(parsed.glucose) ? parsed.glucose : null;
    const hdl = typeof parsed.hdl === "number" && !isNaN(parsed.hdl) ? parsed.hdl : null;

    let tyg: number | null = null;
    let risk = "Pending";
    if (tg != null && tg > 0 && glucose != null && glucose > 0) {
      tyg = Math.log((tg * glucose) / 2);
      risk = assessRisk(tyg);
    }

    return NextResponse.json({
      name: name ?? null,
      age: age ?? null,
      sex: sex ?? null,
      tg: tg ?? null,
      glucose: glucose ?? null,
      hdl: hdl ?? null,
      hba1c: null,
      tyg: tyg ?? null,
      risk,
      ocrSuccess: true,
    });
  } catch (error) {
    console.error("LLM Extract Error:", error);
    return NextResponse.json(
      {
        error: "LLM extraction failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
