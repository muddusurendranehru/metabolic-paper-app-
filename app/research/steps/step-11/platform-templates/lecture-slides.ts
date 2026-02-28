/**
 * 10-slide lecture deck generator (Gamma/PPT). Topic-agnostic.
 * No imports from step-1 to step-6.
 */

import type { TopicInput } from "../topic-schema";

function shorten(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 3) + "...";
}

export function generateLectureSlides(input: TopicInput): string {
  const date = new Date().toISOString().slice(0, 10);
  return `# ${input.topicName}
${input.authorName} | ${input.clinicName}
Date: ${date} | CME Credit: 1 Hour

## Slide 1: Title
- "${input.topicName}"
- ${input.authorName}
- ${input.clinicName}, ${input.location}
- [Visual: Clinic logo + topic icon]

## Slide 2: Learning Objectives
- Define key terms and normal range for this topic
- Interpret main metrics (${input.rValue || "r"} ${input.pValue || "p"} ${input.n ? `n = ${input.n}` : "n"}) in context
- Apply findings in clinical risk stratification
- Prescribe lifestyle + pharmacologic interventions as appropriate

## Slide 3: Step 1 – Patient Assessment
- [Assessment parameter 1 – user-defined]
- [Assessment parameter 2 – user-defined]
- [Visual: Assessment checklist template]

## Slide 4: Step 2 – Key Lab Tests
- [Lab test 1 – user-defined]
- [Lab test 2 – user-defined]
- [Lab test 3 – user-defined]
- [Visual: Lab order form template]

## Slide 5: Key Results & Calculator
- Key finding: ${input.keyFindings}
- ${input.rValue ? `r = ${input.rValue}` : ""} ${input.pValue ? `p < ${input.pValue}` : ""} ${input.n ? `n = ${input.n}` : ""} ${input.effectSize ? `Effect: ${input.effectSize}` : ""}
- [Interactive: Embed calculator link if applicable]
- [Visual: Calculation example]

## Slide 6: Interpretation & Risk Stratification
- [Risk level 1]: [range 1] → [action 1]
- [Risk level 2]: [range 2] → [action 2]
- [Risk level 3]: [range 3] → [action 3]
- [Visual: Risk pyramid chart]

## Slide 7: Lifestyle Modification
- Diet, exercise, weight, sleep, stress
- [Visual: Lifestyle prescription pad]

## Slide 8: Pharmacologic Options
- [Drug 1]: [indication 1]
- [Drug 2]: [indication 2]
- [Drug 3]: [indication 3]
- [Visual: Treatment algorithm]

## Slide 9: Case Study (Anonymized)
- Patient: [age][sex], [parameter 1] [value 1], [parameter 2] [value 2]
- Assessment → Labs → Results → Risk → Treatment
- [Visual: Case timeline]

## Slide 10: Key Takeaways + Resources
- ${shorten(input.keyFindings, 120)}
- Target audience: ${input.targetAudience} | Platform: ${input.platformFocus}
- Contact: ${input.clinicName}, ${input.location}
`;
}
