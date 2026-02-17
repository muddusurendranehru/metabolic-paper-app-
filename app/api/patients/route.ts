import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * CRUD for verified patients - in-memory for MVP.
 * For production, wire to Neon/DB.
 */
let patients: Record<string, unknown>[] = [];

export async function GET() {
  return NextResponse.json(patients);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = String(Date.now());
    const patient = { ...body, id };
    patients.push(patient);
    return NextResponse.json(patient);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const idx = patients.findIndex((p) => (p as { id?: string }).id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    patients[idx] = { ...patients[idx], ...updates };
    return NextResponse.json(patients[idx]);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const idx = patients.findIndex((p) => (p as { id?: string }).id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }
  patients.splice(idx, 1);
  return NextResponse.json({ success: true });
}
