import { NextRequest, NextResponse } from "next/server";
import Tesseract from "tesseract.js";
import { fromBuffer as pdf2picFromBuffer } from "pdf2pic";
import { extractWithLLM, parseAge } from "@/lib/utils/llm-extract";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

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
  hba1c: [
    /hba1c\s*[:\s|\-]*(\d{1,2}(?:\.\d)?)\s*%/i,
    /glycated\s*hemoglobin\s*[:\s|\-]*(\d{1,2}(?:\.\d)?)/i,
    /hba1c\s*[:\s|\-]*(\d{1,2}(?:\.\d)?)/i,
  ],
  age: [
    /age\s*[:\s|\-]*(\d{1,3})/i,
    /(\d{1,3})\s*y(?:ears?)?\s*(?:old)?/i,
    /age\s*gender?\s*[:\s|\-]*(\d{1,3})/i,
  ],
  sex: [
    /sex\s*[:\s|\-]*([MF])/i,
    /gender\s*[:\s|\-]*([MF])/i,
    /([MF])\s*(?:ale|emale)/i,
  ],
  name: [
    /patient\s*name\s*[:\s|\-]*([A-Za-z\s]+)/i,
    /name\s*[:\s|\-]*([A-Za-z][A-Za-z\s]{2,30})/i,
  ],
};

function extractValue(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const val = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(val) && val >= 0 && val < 3000) return val;
    }
  }
  return null;
}

function extractText(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  return null;
}

function assessRisk(tyg: number): string {
  if (tyg >= 9.5) return "High";
  if (tyg >= 8.5) return "Moderate";
  return "Normal";
}

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

    if (!fullText.trim()) {
      return NextResponse.json(
        { error: "OCR failed - no text extracted" },
        { status: 500 }
      );
    }

    const text = fullText.replace(/\s+/g, " ").toLowerCase();

    let tg = extractValue(text, PATTERNS.tg);
    let glucose = extractValue(text, PATTERNS.glucose);
    let hdl = extractValue(text, PATTERNS.hdl);
    let hba1c = extractValue(text, PATTERNS.hba1c);
    let age = extractValue(text, PATTERNS.age);
    let sex = extractText(text, PATTERNS.sex);
    let name = extractText(text, PATTERNS.name);

    const unitMatch = fullText.match(/(mg\/dl|mmol\/l)/i);
    const unit = unitMatch ? unitMatch[1].toLowerCase() : "mg/dl";
    let tgVal = tg ?? 0;
    let glucoseVal = glucose ?? 0;
    let hdlVal = hdl ?? null;
    if (unit === "mmol/l") {
      if (tgVal) tgVal = tgVal * 88.57;
      if (glucoseVal) glucoseVal = glucoseVal * 18;
      if (hdlVal) hdlVal = hdlVal * 38.67;
    }

    // OCR failed to get tg/glucose — try LLM fallback
    if ((!tg || !glucose) && fullText.trim().length >= 50) {
      try {
        const llmData = await extractWithLLM(fullText);
        const lipids = llmData.lipids as Record<string, unknown> | undefined;
        const llmTg = typeof lipids?.triglycerides === "number" ? (lipids.triglycerides as number) : null;
        const llmGlucose = typeof llmData.glucose_fbs === "number" ? (llmData.glucose_fbs as number) : null;
        if (llmTg != null && llmGlucose != null) {
          tg = llmTg;
          glucose = llmGlucose;
          if (typeof llmData.patient_name === "string") name = llmData.patient_name;
          const ageRaw = llmData.age;
          const parsedAge = parseAge(ageRaw != null ? String(ageRaw) : "");
          if (parsedAge != null) age = parsedAge;
          if (llmData.sex === "M" || llmData.sex === "F") sex = llmData.sex;
          const llmHdl = typeof lipids?.hdl === "number" ? (lipids.hdl as number) : null;
          if (llmHdl != null) {
            hdl = llmHdl;
            hdlVal = llmHdl;
          }
          const llmHba1c = typeof llmData.hba1c === "number" ? (llmData.hba1c as number) : null;
          if (llmHba1c != null) hba1c = llmHba1c;
        }
      } catch (llmError) {
        console.error("LLM extraction failed:", llmError);
      }
    }

    let tyg: number | null = null;
    let risk = "Pending";
    if (tg && glucose) {
      tyg = Math.log((tg * glucose) / 2);
      risk = assessRisk(tyg);
    }

    return NextResponse.json({
      name: name || null,
      age: age ?? null,
      sex: sex || null,
      tg: tg ?? null,
      glucose: glucose ?? null,
      hdl: hdlVal ?? null,
      hba1c: hba1c ?? null,
      tyg: tyg ?? null,
      risk,
      ocrSuccess: true,
    });
  } catch (error) {
    console.error("OCR Error:", error);
    return NextResponse.json(
      {
        error: "OCR processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
