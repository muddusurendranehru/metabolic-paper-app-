/**
 * Step 12 – types only. Isolated in lib/utils/step12/.
 * No imports from app/research/steps/* or other lib/utils.
 */

export interface NeutralContentInput {
  topicTitle: string;
  keyFinding: string;
  audience: string;
  n?: string;
  setting?: string;
}

export interface NeutralContentOutput {
  summary: string;
  bullets: string[];
  cta: string;
}

/** Topic-agnostic Step 12 input – user provides; NO research data. */
export type Step12SourceType = "upload" | "paste" | "from-scratch";

export type Step12TargetFormat =
  | "blog"
  | "twitter"
  | "linkedin"
  | "handout"
  | "youtube"
  | "faq"
  | "whatsapp"
  | "hypernatural"
  | "infographic";

export type Step12Audience = "patients" | "doctors" | "students" | "general";

export type Step12Tone = "professional" | "friendly" | "educational" | "urgent";

export interface Step12Input {
  topic: string;
  sourceType: Step12SourceType;
  uploadedFile?: File;
  pastedText?: string;
  targetFormats: Step12TargetFormat[];
  audience: Step12Audience;
  tone: Step12Tone;
}
