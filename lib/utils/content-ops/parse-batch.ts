/**
 * Content Ops – parse CSV and topic list into generation queue items.
 * ISOLATION: No imports from app/research/steps/.
 */

/** Queue row status: wait → gen → done. */
export type QueueStatus = "wait" | "gen" | "done";

export interface QueueItem {
  topic: string;
  language: string;
  audience: string;
  formats: string;
  scheduledDate: string;
  /** Default 'wait'. */
  status?: QueueStatus;
  /** Mark as posted to social (e.g. YT+IG). */
  posted?: boolean;
}

/** Alias for batch upload (Topic, Language, Audience, Formats, ScheduledDate). */
export type BatchTopic = QueueItem;

/** CSV template with columns: Topic, Language, Audience, Formats, ScheduledDate */
export const CSV_TEMPLATE = `Topic,Language,Audience,Formats,ScheduledDate
"TyG vs ₹500 Insulin Test",te,patients,"youtube,instagram",2026-03-01
"5 HbA1c Danger Bands",hi,doctors,"blog,twitter",2026-03-02
`;

const CSV_HEADERS = ["Topic", "Language", "Audience", "Formats", "Scheduled Date"] as const;
const DEFAULT_LANGUAGE = "en";
const DEFAULT_AUDIENCE = "general";
const DEFAULT_FORMATS = "blog";
const DEFAULT_SCHEDULED = "";

/**
 * Parse CSV text. Expected columns: Topic | Language | Audience | Formats | Scheduled Date
 * First row is header; commas and quoted fields supported.
 */
export function parseCsvToQueue(csvText: string): QueueItem[] {
  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]);
  const topicIdx = header.findIndex((h) => /topic/i.test(h));
  const langIdx = header.findIndex((h) => /language/i.test(h));
  const audienceIdx = header.findIndex((h) => /audience/i.test(h));
  const formatsIdx = header.findIndex((h) => /format/i.test(h));
  const dateIdx = header.findIndex((h) => /scheduled|date/i.test(h));

  const items: QueueItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const topic = topicIdx >= 0 ? (cells[topicIdx] ?? "").trim() : "";
    if (!topic) continue;
    items.push({
      topic,
      language: langIdx >= 0 ? (cells[langIdx] ?? "").trim() || DEFAULT_LANGUAGE : DEFAULT_LANGUAGE,
      audience: audienceIdx >= 0 ? (cells[audienceIdx] ?? "").trim() || DEFAULT_AUDIENCE : DEFAULT_AUDIENCE,
      formats: formatsIdx >= 0 ? (cells[formatsIdx] ?? "").trim() || DEFAULT_FORMATS : DEFAULT_FORMATS,
      scheduledDate: dateIdx >= 0 ? (cells[dateIdx] ?? "").trim() : DEFAULT_SCHEDULED,
      status: "wait",
    });
  }
  return items;
}

/** Parse a single CSV line (handles quoted fields with commas). */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === "," && !inQuotes) || (c === "\t" && !inQuotes)) {
      out.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  out.push(current.trim());
  return out;
}

/**
 * Parse pasted topic list (one per line). Assigns default Language, Audience, Formats, Scheduled Date.
 */
export function parseTopicListToQueue(
  text: string,
  defaults?: Partial<Pick<QueueItem, "language" | "audience" | "formats" | "scheduledDate">>
): QueueItem[] {
  const d = {
    language: defaults?.language ?? DEFAULT_LANGUAGE,
    audience: defaults?.audience ?? DEFAULT_AUDIENCE,
    formats: defaults?.formats ?? DEFAULT_FORMATS,
    scheduledDate: defaults?.scheduledDate ?? DEFAULT_SCHEDULED,
  };
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((topic) => ({
      topic,
      language: d.language,
      audience: d.audience,
      formats: d.formats,
      scheduledDate: d.scheduledDate,
      status: "wait" as const,
    }));
}

/** CSV template header row for download. */
export function getCsvTemplateHeader(): string {
  return CSV_HEADERS.join(",");
}

/** One example row for template. */
export function getCsvTemplateRow(): string {
  return [
    "Day 1: TyG vs ₹500 Insulin Test",
    "en",
    "general",
    "blog",
    "",
  ].join(",");
}

/**
 * Parse batch upload: File (CSV) or string (CSV text or newline-separated topic list).
 * Validates required field: Topic. Returns array of BatchTopic (QueueItem).
 */
export async function parseBatchUpload(file: File | string): Promise<BatchTopic[]> {
  const text = typeof file === "string" ? file : await readFileAsText(file);
  const trimmed = text.trim();
  if (!trimmed) return [];

  const lines = trimmed.split(/\r?\n/).filter(Boolean);
  const firstLine = lines[0] ?? "";
  const looksLikeCsv =
    lines.length >= 2 &&
    (/topic/i.test(firstLine) && (/language/i.test(firstLine) || /,/.test(firstLine)));

  if (looksLikeCsv) {
    return parseCsvToQueue(trimmed).filter((row) => row.topic.length > 0);
  }
  return parseTopicListToQueue(trimmed);
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "UTF-8");
  });
}
