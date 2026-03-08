/*
 * SAFETY GUARANTEE:
 * - NO imports from app/research/steps/step-1 to step-6
 * - NO imports from /ai/notebook/ or /step12/generators/
 * - Completely isolated testimonial module
 * - Generic composite templates only (no real patient data)
 * - If deleted, rest of app works 100%
 */

import {
  TESTIMONIAL_TEMPLATES_30,
  HOMA_45S_HOOK,
  HOMA_45S_CLOSE,
} from "./testimonial-templates-data";

/**
 * Testimonials – patient review scripts ONLY.
 * Use for patient review video / testimonial content generation only.
 */

export interface TestimonialTemplate {
  topic: string;
  hook: string;
  middle: string;
  close: string;
  footer: string;
  middle45s?: string;
}

const FALLBACK_MIDDLE_45S =
  "Na numbers track chesi, follow-up plan follow chesam. // Small changes: walking, diet, TyG tracking. // 2–3 months lo improvement feel ayindi, sugar stable. //";

/** 30 safe templates – data in testimonial-templates-data.ts only */
export const SAFE_TESTIMONIAL_TEMPLATES: TestimonialTemplate[] =
  TESTIMONIAL_TEMPLATES_30 as TestimonialTemplate[];

/**
 * Get all 30 scripts as one text block (one-line hook change per topic). For copy-all use.
 */
export function getAll30ScriptsText(): string {
  return SAFE_TESTIMONIAL_TEMPLATES.map((t, i) => {
    const script = `${t.hook}\n\n${t.middle}\n\n${t.close}\n\n---\n${t.footer}`;
    return `=== Script ${i + 1}: ${t.topic} ===\n\n${script}`;
  }).join("\n\n");
}

/**
 * Get a testimonial template by topic (matches first word of topic if needed).
 */
export function getTestimonialScript(topic: string): TestimonialTemplate | null {
  const t = topic.trim().toLowerCase();
  const found = SAFE_TESTIMONIAL_TEMPLATES.find((template) => {
    const firstWord = template.topic.toLowerCase().split(/\s+/)[0];
    return t.includes(firstWord) || template.topic.toLowerCase().includes(t);
  });
  return found ?? null;
}

/**
 * Get 45s video script for a topic: fixed HOOK + topic-specific MIDDLE (70% English + 30% Telugu) + fixed CLOSE + footer.
 * Use for "Copy full brief" and script textarea when a Quick topic is selected.
 */
export function get45sScriptForTopic(topic: string): string | null {
  const template = getTestimonialScript(topic);
  if (!template) return null;
  const middle = template.middle45s ?? FALLBACK_MIDDLE_45S;
  return `${HOMA_45S_HOOK}\n\n${middle}\n\n${HOMA_45S_CLOSE}\n\n---\n${template.footer}`.trim();
}

export interface TestimonialScriptInput {
  /** Short theme e.g. "weight loss", "TyG follow-up", "diet change" */
  theme: string;
  /** Optional: 30–60 seconds */
  durationSeconds?: number;
  /** Language for labels; script is English + optional Telugu mix */
  language?: "en" | "te" | "hi";
}

/**
 * Build a patient review video script (testimonial style only).
 * Neutral, compliant; no medical advice, no research data.
 */
export function generatePatientReviewScript(input: TestimonialScriptInput): string {
  const theme = (input.theme || "experience").trim();
  const duration = input.durationSeconds ?? 45;
  const lang = input.language ?? "en";

  const cta =
    lang === "te"
      ? "HOMA Clinic visit cheyandi. Details website lo."
      : lang === "hi"
        ? "HOMA Clinic website dekhen."
        : "Visit HOMA Clinic website for more.";

  const script = `[Patient review – ${theme}]

HOOK (0–8s):
"After my check-up, I wanted to share a bit about my ${theme} experience—no medical advice, just my story."

MIDDLE (8–35s):
"Everyone's body is different. For me, following the plan and coming for follow-ups helped. I track my numbers and stay in touch with the clinic. This is not a guarantee for anyone else—just what worked for me."

CLOSE (35–${duration}s):
"Talk to your doctor before any change. ${cta}"

---
HOMA Clinic | Dr. Muddu Surendra Nehru, MD | For information only – not medical advice.`;

  return script.trim();
}
