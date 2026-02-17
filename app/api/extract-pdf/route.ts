import { NextRequest, NextResponse } from "next/server";
import Tesseract from "tesseract.js";
import { fromBuffer as pdf2picFromBuffer } from "pdf2pic";
import { patientsToCsv } from "@/lib/csv-utils";
import { createPatient } from "@/lib/tyg";
import { TG_PATTERNS, GLUCOSE_PATTERNS, HDL_PATTERNS } from "@/lib/regex-patterns";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

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

async function ocrPdfToText(pdfBuffer: Buffer): Promise<string> {
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
  return fullText;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file. Please upload a PDF." },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 5MB." },
        { status: 400 }
      );
    }

    const pdfBuffer = Buffer.from(await file.arrayBuffer());
    const fullText = await ocrPdfToText(pdfBuffer);
    const text = fullText.replace(/\s+/g, " ").toLowerCase();

    const tg = extractValue(text, TG_PATTERNS);
    const glucose = extractValue(text, GLUCOSE_PATTERNS);
    const hdl = extractValue(text, HDL_PATTERNS);

    const unitMatch = fullText.match(/(mg\/dl|mmol\/l)/i);
    const unit = unitMatch ? unitMatch[1].toLowerCase() : "mg/dl";
    let tgVal = tg ?? 0;
    let glucoseVal = glucose ?? 0;
    let hdlVal = hdl ?? 0;
    if (unit === "mmol/l") {
      if (tgVal) tgVal = tgVal * 88.57;
      if (glucoseVal) glucoseVal = glucoseVal * 18;
      if (hdlVal) hdlVal = hdlVal * 38.67;
    }

    const row = createPatient(
      "1",
      file.name.replace(/\.pdf$/i, "").slice(0, 30),
      0,
      "M",
      tgVal,
      glucoseVal,
      hdlVal,
      90
    );
    const csv = patientsToCsv([row]);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${file.name.replace(/\.pdf$/i, "")}-extract.csv"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to extract PDF" },
      { status: 500 }
    );
  }
}
