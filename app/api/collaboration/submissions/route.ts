/**
 * Step 13 – read author submissions from local file.
 * File: data/step13-submissions.json
 */

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { AuthorSubmission } from "@/lib/utils/admin/author-schema";

export const runtime = "nodejs";

const FILE_PATH = path.join(process.cwd(), "data", "step13-submissions.json");

export async function GET() {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [];
    return NextResponse.json(list as AuthorSubmission[]);
  } catch {
    return NextResponse.json([]);
  }
}
