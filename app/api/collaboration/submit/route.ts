/**
 * Step 13 – save author submission to a local JSON file.
 * No patient data. Author metadata only. File: data/step13-submissions.json
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { validateAuthorSubmission } from "@/lib/utils/admin/author-schema";
import type { AuthorSubmission } from "@/lib/utils/admin/author-schema";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "step13-submissions.json");

async function readSubmissions(): Promise<AuthorSubmission[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeSubmissions(list: AuthorSubmission[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(list, null, 2), "utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = validateAuthorSubmission({
      ...body,
      submittedAt: body.submittedAt ?? new Date().toISOString(),
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const submissions = await readSubmissions();
    submissions.push(result.data);
    await writeSubmissions(submissions);
    return NextResponse.json({ ok: true, id: submissions.length - 1 });
  } catch (e) {
    console.error("Collaboration submit error:", e);
    return NextResponse.json(
      { error: "Failed to save submission" },
      { status: 500 }
    );
  }
}
