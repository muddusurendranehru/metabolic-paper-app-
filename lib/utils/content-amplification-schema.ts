/**
 * Step 11: Universal input schema – topic-agnostic content amplification.
 * Single source of truth for ContentAmplificationInput. No step-1–step-6 imports. No patientData.
 */

export type TopicCategory = "drug" | "biomarker" | "lifestyle" | "diagnostic" | "other";
export type TargetAudience = "doctors" | "patients" | "students" | "mixed";
export type PlatformOption = "twitter" | "linkedin" | "youtube" | "lecture" | "blog" | "mcq";
export type StatisticalMetric = "correlation" | "mean-diff" | "odds-ratio" | "hazard-ratio";

export interface StatisticalResult {
  metric: StatisticalMetric;
  value: number;
  pValue: number;
  confidenceInterval?: string;
}

export interface ContentAmplificationInput {
  topicTitle: string;
  topicCategory: TopicCategory;
  clinicalArea: string;
  sampleSize: number;
  keyFinding: string;
  statisticalResult: StatisticalResult;
  patientPopulation: string;
  intervention: string;
  comparator?: string;
  outcome: string;
  targetAudience: TargetAudience;
  platforms: PlatformOption[];
  clinicName?: string;
  authorName?: string;
  websiteUrl?: string;
}

export const DEFAULT_CONTENT_AMPLIFICATION_INPUT: ContentAmplificationInput = {
  topicTitle: "",
  topicCategory: "other",
  clinicalArea: "",
  sampleSize: 0,
  keyFinding: "",
  statisticalResult: {
    metric: "correlation",
    value: 0,
    pValue: 1,
    confidenceInterval: undefined,
  },
  patientPopulation: "",
  intervention: "",
  comparator: undefined,
  outcome: "",
  targetAudience: "doctors",
  platforms: ["twitter"],
  clinicName: "HOMA Clinic, Hyderabad",
  authorName: "Dr. Muddu Surendra Nehru, MD",
  websiteUrl: undefined,
};

/** Legacy shape used by Step 11 generators (topicName, keyFindings, rValue, pValue, n, etc.). */
export interface LegacyTopicInput {
  topicName: string;
  keyFindings: string;
  rValue: string;
  pValue: string;
  n: string;
  effectSize: string;
  targetAudience: string;
  platformFocus: string;
  authorName: string;
  clinicName: string;
  location: string;
  journalOrSource: string;
}

/** Convert ContentAmplificationInput → legacy shape so existing generators keep working. */
export function toLegacyTopicInput(content: Partial<ContentAmplificationInput>): LegacyTopicInput {
  const sr = content.statisticalResult;
  const aud = content.targetAudience ?? "doctors";
  const firstPlatform = content.platforms?.[0] ?? "twitter";
  const platformFocus = firstPlatform.charAt(0).toUpperCase() + firstPlatform.slice(1);
  return {
    topicName: content.topicTitle ?? "",
    keyFindings: [content.keyFinding, content.patientPopulation, content.intervention, content.outcome].filter(Boolean).join(". ") || "",
    rValue: sr != null ? String(sr.value) : "",
    pValue: sr != null ? String(sr.pValue) : "",
    n: content.sampleSize != null ? String(content.sampleSize) : "",
    effectSize: sr?.confidenceInterval ?? "",
    targetAudience: aud === "mixed" ? "doctors" : aud,
    platformFocus: platformFocus === "Mcq" ? "Blog" : platformFocus,
    authorName: content.authorName ?? DEFAULT_CONTENT_AMPLIFICATION_INPUT.authorName,
    clinicName: content.clinicName ?? DEFAULT_CONTENT_AMPLIFICATION_INPUT.clinicName,
    location: (content.clinicName ?? "").split(",").map((s) => s.trim()).filter(Boolean)[1] ?? "Hyderabad",
    journalOrSource: content.clinicalArea ? `${content.clinicalArea} (n=${content.sampleSize ?? ""})` : "",
  };
}

/** Convert legacy shape → ContentAmplificationInput for editing in universal form. */
export function fromLegacyTopicInput(legacy: Partial<LegacyTopicInput>): Partial<ContentAmplificationInput> {
  const p = parseFloat(legacy.pValue ?? "");
  const r = parseFloat(legacy.rValue ?? "");
  const n = parseInt(legacy.n ?? "0", 10) || 0;
  return {
    topicTitle: legacy.topicName ?? "",
    topicCategory: "other",
    clinicalArea: legacy.journalOrSource ?? "",
    sampleSize: n,
    keyFinding: legacy.keyFindings ?? "",
    statisticalResult: { metric: "correlation", value: r, pValue: isNaN(p) ? 0 : p, confidenceInterval: legacy.effectSize },
    patientPopulation: "",
    intervention: "",
    outcome: "",
    targetAudience: (legacy.targetAudience as ContentAmplificationInput["targetAudience"]) ?? "doctors",
    platforms: legacy.platformFocus ? [legacy.platformFocus.toLowerCase() as PlatformOption] : ["twitter"],
    authorName: legacy.authorName,
    clinicName: legacy.clinicName,
    websiteUrl: undefined,
  };
}
