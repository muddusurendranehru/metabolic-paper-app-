/**
 * YouTube script generator – Shorts + long-form. Topic-agnostic.
 * No imports from step-1 to step-6.
 */

import type { TopicInput } from "../topic-schema";

function shorten(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 3) + "...";
}

export function generateShortsScript(input: TopicInput): string {
  return `[0-15s] HOOK: ${shorten(input.topicName, 80)}

[15-30s] KEY FINDING: ${shorten(input.keyFindings, 120)}

[30-45s] NUMBERS: ${input.n ? `n = ${input.n}` : ""} ${input.rValue ? `r = ${input.rValue}` : ""} ${input.pValue ? `p < ${input.pValue}` : ""} ${input.effectSize ? `Effect: ${input.effectSize}` : ""}

[45-60s] CTA: For ${input.targetAudience}. ${input.clinicName}, ${input.location}.`;
}

export function generateLongFormScript(input: TopicInput): string {
  return `# ${input.topicName} – Video Script (Long-form)

## Intro (0:00–1:00)
Today we’re covering: ${input.topicName}.
Key for: ${input.targetAudience}.

## Background (1:00–3:00)
Context and gap in practice.

## Methods & Numbers (3:00–5:00)
${input.n ? `Sample size: n = ${input.n}.` : ""} ${input.rValue ? `Correlation/effect: r = ${input.rValue}.` : ""} ${input.pValue ? `p < ${input.pValue}.` : ""} ${input.effectSize ? `Effect size: ${input.effectSize}.` : ""}

## Key Finding (5:00–7:00)
${input.keyFindings}

## Takeaway & CTA (7:00–8:00)
Implications for ${input.targetAudience}. ${input.clinicName}, ${input.location}.`;
}
