/**
 * Step 12 – Neutral Medical Content Generator.
 * ISOLATED: Only lib/utils/step12/. No imports from research steps or other lib/utils.
 */

import type { NeutralContentInput, NeutralContentOutput } from "./step12-types";

function trim(s: string, max: number): string {
  if (!s || s.length <= max) return s;
  return s.slice(0, max - 3).trim() + "…";
}

/**
 * Generate neutral medical content (summary, bullets, CTA) from user input.
 * Topic-agnostic; no hardcoded medical terms; template-based.
 */
export function generateNeutralContent(input: NeutralContentInput): NeutralContentOutput {
  const title = (input.topicTitle || "").trim();
  const finding = (input.keyFinding || "").trim();
  const audience = (input.audience || "clinicians").trim();
  const n = input.n?.trim();
  const setting = (input.setting || "clinical setting").trim();

  const summary = [
    title ? `This brief summarizes evidence on ${trim(title, 80)}.` : "Summary of the topic.",
    finding ? trim(finding, 200) : "",
    n ? `Based on a sample of n = ${n} in ${setting}.` : setting ? `Setting: ${setting}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const bullets: string[] = [];
  if (title) bullets.push(`Topic: ${trim(title, 60)}`);
  if (finding) bullets.push(`Key finding: ${trim(finding, 80)}`);
  if (n) bullets.push(`Sample size: n = ${n}`);
  if (setting) bullets.push(`Setting: ${trim(setting, 50)}`);
  if (audience) bullets.push(`Relevant for: ${audience}`);
  if (bullets.length === 0) bullets.push("Add topic and key finding above, then Generate.");

  const cta = `Discuss applicability with your team. For ${audience || "clinicians"}, consider local guidelines.`;

  return { summary, bullets, cta };
}
