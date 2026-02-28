/**
 * Step 11: Universal Content Amplification – TOPIC-AGNOSTIC.
 * Template only: no hardcoded TyG, HbA1c, waist, etc. User inputs drive all content.
 * No imports from step-1 to step-6. No patientData.
 * Patient names are never revealed: keyFindings is redacted before use in any output.
 */

import { redactPatientIdentifiersFromText } from "@/lib/utils/anonymize";

export type TargetAudience = "doctors" | "patients" | "students";
export type PlatformFocus = "Twitter" | "YouTube" | "Lecture" | "Blog";

export interface Step11TopicInput {
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

export const DEFAULT_STEP11_INPUT: Step11TopicInput = {
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

function shorten(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 3) + "...";
}

/** Redact keyFindings so patient names are never included in output. */
function safeFindings(input: Step11TopicInput): string {
  return redactPatientIdentifiersFromText(input.keyFindings);
}

/** Twitter thread (5 tweets) – same structure, content from input only. No patient names. */
export function generateTwitterAmplification(input: Step11TopicInput): string[] {
  const findings = safeFindings(input);
  const t = shorten(input.topicName, 200);
  const tag = input.topicName.slice(0, 20).replace(/\s+/g, "");
  return [
    `🆕 NEW: ${t}\n${input.journalOrSource || "Research"} | n = ${input.n || "—"} | ${input.location}\nThread 👇`,
    `❌ Problem / gap addressed:\n${shorten(findings, 280)}`,
    `🔬 What we did:\n• Setting: ${input.location}\n• Key metrics: ${input.rValue ? `r = ${input.rValue}` : ""} ${input.pValue ? `p < ${input.pValue}` : ""} ${input.n ? `n = ${input.n}` : ""} ${input.effectSize ? `Effect: ${input.effectSize}` : ""}`.trim(),
    `📊 KEY FINDING:\n${findings}`,
    `💡 Implications for ${input.targetAudience}.\nFull details: ${input.journalOrSource || "—"}\n#${tag || "Research"}`,
  ];
}

/** YouTube Shorts script – same format, content from input. No patient names. */
export function generateYouTubeAmplification(input: Step11TopicInput): string {
  const findings = safeFindings(input);
  return `[0-15s] HOOK: ${shorten(input.topicName, 80)}

[15-30s] KEY FINDING: ${shorten(findings, 120)}

[30-45s] NUMBERS: ${input.n ? `n = ${input.n}` : ""} ${input.rValue ? `r = ${input.rValue}` : ""} ${input.pValue ? `p < ${input.pValue}` : ""} ${input.effectSize ? `Effect: ${input.effectSize}` : ""}

[45-60s] CTA: For ${input.targetAudience}. ${input.clinicName}, ${input.location}.`;
}

/** Blog / LinkedIn summary – same structure. No patient names. */
export function generateBlogAmplification(input: Step11TopicInput): string {
  const findings = safeFindings(input);
  return `${input.journalOrSource ? `Published: ${input.journalOrSource}\n\n` : ""}**${input.topicName}**

**Key findings:**\n${findings}

**Evidence:** ${input.n ? `n = ${input.n}` : ""} ${input.rValue ? `r = ${input.rValue}` : ""} ${input.pValue ? `p < ${input.pValue}` : ""} ${input.effectSize ? `| ${input.effectSize}` : ""}

**Audience:** ${input.targetAudience} | **Setting:** ${input.location}

— ${input.authorName}, ${input.clinicName}`;
}

/** CME-style 10-slide Markdown – placeholders filled only from input. No patient names. */
export function generateCMEAmplification(input: Step11TopicInput): string {
  const findings = safeFindings(input);
  return `# ${input.topicName}
${input.authorName} | ${input.clinicName}
Date: ${new Date().toISOString().slice(0, 10)} | CME Credit: 1 Hour

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
- Key finding: ${findings}
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
- ${shorten(findings, 120)}
- Target audience: ${input.targetAudience} | Platform: ${input.platformFocus}
- Contact: ${input.clinicName}, ${input.location}
`;
}
