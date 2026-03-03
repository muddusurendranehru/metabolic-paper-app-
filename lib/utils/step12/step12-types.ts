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
  | "youtube-package"
  | "mcq"
  | "whatsapp"
  | "whatsapp-cta"
  | "facebook-post"
  | "hypernatural"
  | "infographic"
  | "book-section"
  | "seo-blog";

export type Step12Audience = "patients" | "doctors" | "students" | "general";

export type Step12Tone = "professional" | "friendly" | "educational" | "urgent";

/** Supported UI and label languages for Step 12 generated content (universal, any topic). */
export type Step12Language = "en" | "hi" | "te" | "ta" | "kn" | "ml" | "bn" | "mr";

export interface Step12Input {
  topic: string;
  sourceType: Step12SourceType;
  uploadedFile?: File;
  pastedText?: string;
  targetFormats: Step12TargetFormat[];
  audience: Step12Audience;
  tone: Step12Tone;
  /** Language for labels/CTAs in generated content. Default: en. */
  language?: Step12Language;
}
