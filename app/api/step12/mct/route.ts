/**
 * Step 12 – MCT Trial Agent (PubMed only, no patient data).
 * GET/POST ?query=... &language=... → { content } with website link.
 * Isolated: only uses mct-agent. Delete mct-agent + this route → rest of Step 12 unchanged.
 */

import { NextRequest, NextResponse } from "next/server";
import { getMctContent } from "@/lib/utils/step12/mct-agent";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
    const language = request.nextUrl.searchParams.get("language") ?? "en";
    if (!query) {
      return NextResponse.json({ error: "query required" }, { status: 400 });
    }
    const content = await getMctContent(query, { language });
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Step 12 MCT agent error:", error);
    return NextResponse.json({ error: "MCT content failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = (body.query ?? body.q ?? "").toString().trim();
    const language = (body.language ?? "en").toString();
    if (!query) {
      return NextResponse.json({ error: "query required" }, { status: 400 });
    }
    const content = await getMctContent(query, { language });
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Step 12 MCT agent error:", error);
    return NextResponse.json({ error: "MCT content failed" }, { status: 500 });
  }
}
