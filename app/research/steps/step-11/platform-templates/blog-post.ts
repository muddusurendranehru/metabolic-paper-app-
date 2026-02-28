/**
 * SEO-friendly blog post generator. Topic-agnostic.
 * No imports from step-1 to step-6.
 */

import type { TopicInput } from "../topic-schema";

export function generateBlogPost(input: TopicInput): string {
  const meta = [
    input.journalOrSource ? `Published: ${input.journalOrSource}` : "",
    input.n ? `n = ${input.n}` : "",
    input.rValue ? `r = ${input.rValue}` : "",
    input.pValue ? `p < ${input.pValue}` : "",
    input.effectSize ? input.effectSize : "",
  ].filter(Boolean).join(" | ");

  return `${meta ? `${meta}\n\n` : ""}# ${input.topicName}

## Key findings
${input.keyFindings}

## Evidence
${input.n ? `- Sample size: n = ${input.n}` : ""}
${input.rValue ? `- Correlation/effect: r = ${input.rValue}` : ""}
${input.pValue ? `- Significance: p < ${input.pValue}` : ""}
${input.effectSize ? `- Effect: ${input.effectSize}` : ""}

## Audience & setting
- **Audience:** ${input.targetAudience}
- **Setting:** ${input.location}
- **Source:** ${input.clinicName}

---
*${input.authorName}, ${input.clinicName}*`;
}
