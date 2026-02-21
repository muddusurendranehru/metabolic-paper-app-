import { NextRequest, NextResponse } from "next/server";
import Tesseract from "tesseract.js";
import { fromBuffer as pdf2picFromBuffer } from "pdf2pic";
import { extractWithLLM, parseAge } from "@/lib/utils/llm-extract";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Indian Lab Report Regex Patterns (optimized for OCR text)
const PATTERNS = {
  tg: [
    /triglycerides?\s*[:\s|\-]*(\d{2,3})/i,
    /tg\s*[:\s|\-]*(\d{2,3})/i,
    /trig\s*[:\s|\-]*(\d{2,3})/i,
    /serum\s*triglycerides?\s*[:\s|\-]*(\d{2,3})/i,
    /(?:triglycerides?|tg)\s+(\d{2,3})/i,
  ],
  glucose: [
    /glucose\s*fbs?\s*[:\s|\-]*(\d{2,3})/i,
    /fbs\s*[:\s|\-]*(\d{2,3})/i,
    /fbg\s*[:\s|\-]*(\d{2,3})/i,
    /fasting\s*blood\s*sugar\s*[:\s|\-]*(\d{2,3})/i,
    /fasting\s*sugar\s*[:\s|\-]*(\d{2,3})/i,
    /blood\s*sugar\s*fasting\s*[:\s|\-]*(\d{2,3})/i,
    /sugar\s*fasting\s*[:\s|\-]*(\d{2,3})/i,
    /glucose\s*[:\s|\-]*(\d{2,3})/i,
  ],
  hdl: [
    /hdl\s*(?:cholesterol)?\s*[:\s|\-]*(\d{2,3})/i,
    /hdl-c\s*[:\s|\-]*(\d{2,3})/i,
    /high\s*density\s*lipoprotein\s*[:\s|\-]*(\d{2,3})/i,
    /(?:hdl|hdl-c)\s+(\d{2,3})/i,
  ],
};

function extractValue(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const val = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(val) && val > 0 && val < 3000) return val;
    }
  }
  return null;
}

function calculateTyG(tg: number, glucose: number): number {
  return Math.log((tg * glucose) / 2);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    const manualTg = formData.get("tg")
      ? parseFloat(formData.get("tg") as string)
      : null;
    const manualGlucose = formData.get("glucose")
      ? parseFloat(formData.get("glucose") as string)
      : null;
    const manualHdl = formData.get("hdl")
      ? parseFloat(formData.get("hdl") as string)
      : null;
    const waist = formData.get("waist")
      ? parseFloat(formData.get("waist") as string)
      : null;

    let tg: number | null = manualTg;
    let glucose: number | null = manualGlucose;
    let hdl: number | null = manualHdl;

    if (file && file.type === "application/pdf") {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File too large. Max 5MB." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);

      const convert = pdf2picFromBuffer(pdfBuffer, {
        density: 100,
        format: "png",
        width: 1200,
        height: 1600,
      });

      let fullText = "";

      for (let i = 1; i <= 3; i++) {
        try {
          const result = await convert(i, { responseType: "buffer" });
          const buffer =
            Buffer.isBuffer(result)
              ? result
              : typeof result === "object" && result && "buffer" in result
                ? (result as { buffer: Buffer }).buffer
                : null;

          if (buffer) {
            const { data } = await Tesseract.recognize(buffer, "eng");
            fullText += data.text + "\n";
          }
        } catch {
          break;
        }
      }

      if (fullText.trim()) {
        const text = fullText
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n")
          .replace(/\s+/g, " ")
          .toLowerCase();

        if (process.env.NODE_ENV === "development") {
          console.log("=== OCR EXTRACTED TEXT (first 2000 chars) ===");
          console.log(fullText.substring(0, 2000));
          console.log("=== END OCR TEXT ===");
        }

        const pdfTg = extractValue(text, PATTERNS.tg);
        const pdfGlucose = extractValue(text, PATTERNS.glucose);
        const pdfHdl = extractValue(text, PATTERNS.hdl);

        if (pdfTg != null) tg = pdfTg;
        if (pdfGlucose != null) glucose = pdfGlucose;
        if (pdfHdl != null) hdl = pdfHdl;

        const unitMatch = fullText.match(/(mg\/dl|mmol\/l)/i);
        const unit = unitMatch ? unitMatch[1].toLowerCase() : "mg/dl";
        if (unit === "mmol/l") {
          if (tg != null) tg = tg * 88.57;
          if (glucose != null) glucose = glucose * 18;
          if (hdl != null) hdl = hdl * 38.67;
        }

        // OCR failed to get tg/glucose — try LLM fallback
        if ((tg === null || glucose === null) && fullText.trim().length >= 50) {
          try {
            const llmData = await extractWithLLM(fullText);
            const lipids = llmData.lipids as Record<string, unknown> | undefined;
            const llmTg = typeof lipids?.triglycerides === "number" ? (lipids.triglycerides as number) : null;
            const llmGlucose = typeof llmData.glucose_fbs === "number" ? (llmData.glucose_fbs as number) : null;
            if (llmTg != null && llmGlucose != null) {
              tg = llmTg;
              glucose = llmGlucose;
              const llmHdl = typeof lipids?.hdl === "number" ? (lipids.hdl as number) : null;
              if (llmHdl != null) hdl = llmHdl;
            }
          } catch (llmError) {
            console.error("LLM extraction failed:", llmError);
          }
        }
      }
    }

    if (tg === null || glucose === null) {
      return NextResponse.json(
        {
          error:
            "Triglycerides and Glucose are required. Enter manually or upload a valid PDF.",
          found: { tg, glucose, hdl },
        },
        { status: 422 }
      );
    }

    const tyG = calculateTyG(tg, glucose);

    return NextResponse.json({
      success: true,
      ok: true,
      tg,
      glucose,
      hdl: hdl ?? 0,
      data: { patient: { tg, glucose, hdl: hdl ?? 0, waist, tyG } },
      message: hdl != null ? "PDF parsed successfully" : "Some values entered manually",
    });
  } catch (error) {
    console.error("Upload PDF Error:", error);
    return NextResponse.json(
      {
        error: "OCR processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
