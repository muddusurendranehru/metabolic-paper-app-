import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf, extractStructuredFromPdf } from "@/lib/utils/pdf-parser";
import { EXTRACTION_SYSTEM_PROMPT, EXTRACTION_USER_PROMPT } from "@/lib/utils/llm-prompts";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function assessRisk(tyg: number): string {
  if (tyg >= 9.5) return "High";
  if (tyg >= 8.5) return "Moderate";
  return "Normal";
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

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
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
          const parsed = JSON.parse(content) as Record<string, unknown>;
          const tg = typeof parsed.tg === "number" ? parsed.tg : regexData.tg;
          const glucose =
            typeof parsed.glucose === "number" ? parsed.glucose : regexData.glucose;
          const tgVal = tg ?? 0;
          const glucoseVal = glucose ?? 0;
          const tyg =
            tgVal > 0 && glucoseVal > 0
              ? Math.log((tgVal * glucoseVal) / 2)
              : regexData.tyg;

          return NextResponse.json({
            name:
              typeof parsed.name === "string" && parsed.name
                ? parsed.name.trim()
                : regexData.name,
            age:
              typeof parsed.age === "number" && !isNaN(parsed.age)
                ? parsed.age
                : regexData.age,
            sex:
              parsed.sex === "M" || parsed.sex === "F" ? parsed.sex : regexData.sex,
            tg: tg ?? regexData.tg,
            glucose: glucose ?? regexData.glucose,
            hdl:
              typeof parsed.hdl === "number" && !isNaN(parsed.hdl)
                ? parsed.hdl
                : regexData.hdl,
            tyg: tyg ?? regexData.tyg,
            risk: tyg != null ? assessRisk(tyg) : regexData.risk,
            ocrSuccess: !!(tg && glucose),
          });
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
