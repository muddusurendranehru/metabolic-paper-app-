/**
 * Step 11: Input validation schema – any medical topic.
 * Topic-agnostic: no hardcoded terms. Do not import from step-1 to step-6.
 * Universal schema (ContentAmplificationInput) lives in lib/utils/content-amplification-schema.ts.
 */

import { toLegacyTopicInput, type ContentAmplificationInput } from "@/lib/utils/content-amplification-schema";

export type { ContentAmplificationInput };
export { toLegacyTopicInput, fromLegacyTopicInput } from "@/lib/utils/content-amplification-schema";

export type TargetAudience = "doctors" | "patients" | "students";
export type PlatformFocus = "Twitter" | "YouTube" | "Lecture" | "Blog";

export interface TopicInput {
  topicName: string;
  keyFindings: string;
  rValue: string;
  pValue: string;
  n: string;
  effectSize: string;
  targetAudience: TargetAudience;
  platformFocus: PlatformFocus;
  authorName: string;
  clinicName: string;
  location: string;
  journalOrSource: string;
}

export const DEFAULT_TOPIC_INPUT: TopicInput = {
  topicName: "",
  keyFindings: "",
  rValue: "",
  pValue: "",
  n: "",
  effectSize: "",
  targetAudience: "doctors",
  platformFocus: "Twitter",
  authorName: "Dr. Muddu Surendra Nehru",
  clinicName: "HOMA Clinic",
  location: "Hyderabad",
  journalOrSource: "",
};

const AUDIENCE_VALUES: TargetAudience[] = ["doctors", "patients", "students"];
const PLATFORM_VALUES: PlatformFocus[] = ["Twitter", "YouTube", "Lecture", "Blog"];

/** Validate and coerce topic input. Returns errors keyed by field. */
export function validateTopicInput(input: Partial<TopicInput>): Partial<Record<keyof TopicInput, string>> {
  const errors: Partial<Record<keyof TopicInput, string>> = {};
  if (input.topicName != null && input.topicName.trim().length === 0 && (input.keyFindings?.trim() || input.n?.trim()))
    errors.topicName = "Topic name recommended when providing findings.";
  if (input.targetAudience != null && !AUDIENCE_VALUES.includes(input.targetAudience))
    errors.targetAudience = `Must be one of: ${AUDIENCE_VALUES.join(", ")}`;
  if (input.platformFocus != null && !PLATFORM_VALUES.includes(input.platformFocus))
    errors.platformFocus = `Must be one of: ${PLATFORM_VALUES.join(", ")}`;
  return errors;
}

/** Sanitize string for display (max length). */
export function sanitizeTopicInput(input: Partial<TopicInput>): TopicInput {
  return {
    ...DEFAULT_TOPIC_INPUT,
    ...input,
    topicName: (input.topicName ?? "").slice(0, 500),
    keyFindings: (input.keyFindings ?? "").slice(0, 2000),
    rValue: (input.rValue ?? "").slice(0, 20),
    pValue: (input.pValue ?? "").slice(0, 20),
    n: (input.n ?? "").slice(0, 20),
    effectSize: (input.effectSize ?? "").slice(0, 100),
    authorName: (input.authorName ?? "").slice(0, 200),
    clinicName: (input.clinicName ?? "").slice(0, 200),
    location: (input.location ?? "").slice(0, 200),
    journalOrSource: (input.journalOrSource ?? "").slice(0, 200),
  };
}

/** Convert universal ContentAmplificationInput to TopicInput for existing generators. */
export function contentToTopicInput(content: Partial<ContentAmplificationInput>): TopicInput {
  const legacy = toLegacyTopicInput(content);
  return sanitizeTopicInput(legacy as Partial<TopicInput>);
}
