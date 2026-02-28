/**
 * Social media generators – Twitter / LinkedIn / Instagram. Topic-agnostic.
 * No imports from step-1 to step-6.
 */

import type { TopicInput } from "../topic-schema";

function shorten(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 3) + "...";
}

export function generateTwitterThread(input: TopicInput): string[] {
  const t = shorten(input.topicName, 200);
  const tag = input.topicName.slice(0, 20).replace(/\s+/g, "") || "Research";
  return [
    `🆕 NEW: ${t}\n${input.journalOrSource || "Research"} | n = ${input.n || "—"} | ${input.location}\nThread 👇`,
    `❌ Problem / gap addressed:\n${shorten(input.keyFindings, 280)}`,
    `🔬 What we did:\n• Setting: ${input.location}\n• Key metrics: ${input.rValue ? `r = ${input.rValue}` : ""} ${input.pValue ? `p < ${input.pValue}` : ""} ${input.n ? `n = ${input.n}` : ""} ${input.effectSize ? `Effect: ${input.effectSize}` : ""}`.trim(),
    `📊 KEY FINDING:\n${input.keyFindings}`,
    `💡 Implications for ${input.targetAudience}.\nFull details: ${input.journalOrSource || "—"}\n#${tag}`,
  ];
}

export function generateLinkedInPost(input: TopicInput): string {
  return `${input.journalOrSource ? `Published: ${input.journalOrSource}\n\n` : ""}**${input.topicName}**

**Key findings:**\n${input.keyFindings}

**Evidence:** ${input.n ? `n = ${input.n}` : ""} ${input.rValue ? `r = ${input.rValue}` : ""} ${input.pValue ? `p < ${input.pValue}` : ""} ${input.effectSize ? `| ${input.effectSize}` : ""}

**Audience:** ${input.targetAudience} | **Setting:** ${input.location}

— ${input.authorName}, ${input.clinicName}`;
}

export function generateInstagramCaption(input: TopicInput): string {
  const t = shorten(input.topicName, 100);
  return `${t}\n\n${shorten(input.keyFindings, 200)}\n\n${input.n ? `n = ${input.n}` : ""} ${input.rValue ? `r = ${input.rValue}` : ""} ${input.pValue ? `p < ${input.pValue}` : ""}\n\n#MedicalResearch #${input.targetAudience}`;
}
