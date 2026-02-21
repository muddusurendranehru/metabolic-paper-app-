import { NextRequest, NextResponse } from "next/server";
import { extractStructuredFromPdf } from "@/lib/utils/pdf-parser";
import { EXTRACTION_SYSTEM_PROMPT, EXTRACTION_USER_PROMPT } from "@/lib/utils/llm-prompts";
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

/**
 * POST: PDF file in formData as "file".
 * - Extracts text via pdf-parser (pdf.js).
 * - If OPENAI_API_KEY: uses LLM to extract fields (fallback: regex from same text).
 * - If no key: uses regex-only extraction from PDF text.
 * Returns same shape as /api/ocr for drop-in use in Extract tab.
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

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

    const pdfBuffer = Buffer.from(await file.arrayBuffer());
    const { text, data: regexData } = await extractStructuredFromPdf(pdfBuffer);

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from PDF" },
        { status: 500 }
      );
    }

    if (apiKey && text.trim().length >= MIN_TEXT_LENGTH_FOR_LLM) {
      try {
        const { default: OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
            { role: "user", content: EXTRACTION_USER_PROMPT(text) },
          ],
          response_format: { type: "json_object" },
        });
        const content = completion.choices[0]?.message?.content?.trim();
        if (content) {
          const parsed = parseJsonResponse(content);
          if (parsed != null) {
            const tg = typeof parsed.tg === "number" ? parsed.tg : regexData.tg;
            const glucose =
              typeof parsed.glucose === "number" ? parsed.glucose : regexData.glucose;
            const tgVal = tg ?? 0;
            const glucoseVal = glucose ?? 0;
            const tyg =
              tgVal > 0 && glucoseVal > 0
                ? Math.log((tgVal * glucoseVal) / 2)
                : regexData.tyg;
            const ageRaw = parsed.age;
            const age =
              typeof ageRaw === "number" && !isNaN(ageRaw)
                ? ageRaw
                : parseAgeString(ageRaw != null ? String(ageRaw) : null) ?? regexData.age;

            return NextResponse.json({
              name:
                typeof parsed.name === "string" && parsed.name
                  ? parsed.name.trim()
                  : regexData.name,
              age,
              sex:
                parsed.sex === "M" || parsed.sex === "F" ? parsed.sex : regexData.sex,
              tg: tg ?? regexData.tg,
              glucose: glucose ?? regexData.glucose,
              hdl:
                typeof parsed.hdl === "number" && !isNaN(parsed.hdl)
                  ? parsed.hdl
                  : regexData.hdl,
              hba1c: null,
              tyg: tyg ?? regexData.tyg,
              risk: tyg != null ? assessRisk(tyg) : regexData.risk,
              ocrSuccess: !!(tg && glucose),
            });
          }
        }
      } catch (llmErr) {
        console.warn("LLM extract failed, using regex:", llmErr);
      }
    }

    return NextResponse.json({
      name: regexData.name,
      age: regexData.age,
      sex: regexData.sex,
      tg: regexData.tg,
      glucose: regexData.glucose,
      hdl: regexData.hdl,
      tyg: regexData.tyg,
      risk: regexData.risk,
      ocrSuccess: regexData.ocrSuccess,
      hba1c: null,
    });
  } catch (error) {
    console.error("LLM-extract Error:", error);
    return NextResponse.json(
      {
        error: "Extraction failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
