import { NextRequest, NextResponse } from "next/server";
import { correlation, correlationPValue } from "@/lib/tyg";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const patients = Array.isArray(body.patients) ? body.patients : [];
    const waist = patients.map((p: { waist?: number }) => p.waist ?? 0);
    const tyg = patients.map((p: { tyg?: number }) => p.tyg ?? 0);

    const r = waist.length >= 2 ? correlation(waist, tyg) : 0;
    const p = waist.length >= 2 ? correlationPValue(r, waist.length) : 1;

    return NextResponse.json({
      success: true,
      n: patients.length,
      correlation: { r, p },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to analyze" },
      { status: 500 }
    );
  }
}
