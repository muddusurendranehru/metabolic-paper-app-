/**
 * Generate lecture slides from ContentAmplificationInput using placeholder replacement.
 * Topic-agnostic. No step-1–step-6 imports. No patientData. Additive only.
 */

import type { ContentAmplificationInput, StatisticalResult } from "./content-amplification-schema";
import type { TopicCategory } from "./content-amplification-schema";

export interface Slide {
  title: string;
  content: string;
}

const LECTURE_TEMPLATE = `# {{topicTitle}}
{{authorName}} | {{clinicName}}
Date: {{date}} | CME Credit: 1 Hour

## Slide 1: Title
- "{{topicTitle}}"
- {{authorName}}, {{credentials}}
- {{clinicName}}, {{location}}
- [Visual: Clinic logo + topic icon]

## Slide 2: Learning Objectives
- Define {{keyTerm}} and normal range
- Interpret elevated {{keyTerm}} as {{clinicalImplication}}
- Apply {{intervention}} in clinical risk stratification
- Prescribe lifestyle + pharmacologic interventions

## Slide 3: Step 1 – Patient Assessment
- {{assessmentParameter1}} (e.g., Waist circumference)
- {{assessmentParameter2}} (e.g., Age, Sex, Family History)
- [Visual: Assessment checklist template]

## Slide 4: Step 2 – Key Lab Tests
- {{labTest1}} (e.g., Fasting Blood Sugar)
- {{labTest2}} (e.g., Lipid Profile)
- {{labTest3}} (e.g., HbA1c, Fasting Insulin)
- [Visual: Lab order form template]

## Slide 5: Step 3 – {{keyIndex}} Calculator (Live Demo)
- Formula: {{formula}}
- Normal: {{normalRange}} | Elevated: {{elevatedThreshold}} = {{clinicalMeaning}}
- [Interactive: Embed calculator link]
- [Visual: Calculation example with patient data]

## Slide 6: Step 5 – Interpretation & Risk Stratification
- {{riskLevel1}}: {{range1}} → {{action1}}
- {{riskLevel2}}: {{range2}} → {{action2}}
- {{riskLevel3}}: {{range3}} → {{action3}}
- [Visual: Risk pyramid chart]

## Slide 7: Step 6a – Lifestyle Modification
- Diet: {{dietRecommendation}}
- Exercise: {{exerciseRecommendation}}
- Weight loss: {{weightLossTarget}}
- Sleep, stress management
- [Visual: Lifestyle prescription pad]

## Slide 8: Step 6b – Pharmacologic Options
- {{drug1}}: {{indication1}}
- {{drug2}}: {{indication2}}
- {{drug3}}: {{indication3}}
- [Visual: Treatment algorithm flowchart]

## Slide 9: Case Study (Anonymized)
- Patient: {{age}}{{sex}}, {{keyParameter1}} {{value1}}, {{keyParameter2}} {{value2}}
- Assessment → Labs → {{keyIndex}} calc → Risk → Treatment
- [Visual: Case timeline]

## Slide 10: Key Takeaways + Resources
- {{keyTakeaway1}}
- {{keyTakeaway2}}
- Free calculator: {{websiteUrl}}
- Download patient handouts
- CME quiz link
- Contact: {{clinicInfo}}`;

/** Extract key term from topic title (e.g. "Pioglitazone in PCOS" → "Pioglitazone"). */
export function extractKeyTerm(title: string): string {
  if (!title?.trim()) return "key term";
  const first = title.trim().split(/\s+/)[0];
  return first || "key term";
}

/** Get formula string by topic category. */
export function getFormulaForTopic(category: TopicCategory): string {
  const formulas: Record<TopicCategory, string> = {
    biomarker: "ln[(TG × FBS) / 2]",
    drug: "Dose = weight × factor",
    lifestyle: "Calories = BMR × ActivityFactor",
    diagnostic: "Sensitivity = TP / (TP + FN)",
    other: "Formula depends on topic",
  };
  return formulas[category] ?? formulas.other;
}

/** Get normal range by topic category. */
export function getNormalRange(category: TopicCategory): string {
  const ranges: Record<TopicCategory, string> = {
    biomarker: "< 8.5",
    drug: "Per guideline",
    lifestyle: "Within target",
    diagnostic: "Reference range",
    other: "See topic",
  };
  return ranges[category] ?? "—";
}

/** Get elevated threshold by topic category. */
export function getElevatedThreshold(category: TopicCategory): string {
  const thresholds: Record<TopicCategory, string> = {
    biomarker: "≥ 8.5",
    drug: "Above target",
    lifestyle: "Exceeded",
    diagnostic: "Abnormal",
    other: "—",
  };
  return thresholds[category] ?? "—";
}

/** Get clinical meaning from statistical result. */
export function getClinicalMeaning(sr: StatisticalResult | undefined): string {
  if (!sr) return "clinical significance";
  if (sr.metric === "correlation") return "association with outcome";
  if (sr.metric === "mean-diff") return "treatment effect";
  if (sr.metric === "odds-ratio") return "odds of outcome";
  if (sr.metric === "hazard-ratio") return "risk over time";
  return "clinical significance";
}

/** Build replacement map from ContentAmplificationInput + helpers. */
function getReplacements(input: Partial<ContentAmplificationInput>): Record<string, string> {
  const category = input.topicCategory ?? "other";
  const sr = input.statisticalResult;
  const keyTerm = extractKeyTerm(input.topicTitle ?? "");
  const [clinicName = "", location = "Hyderabad"] = (input.clinicName ?? "").split(",").map((s) => s.trim());
  return {
    topicTitle: input.topicTitle ?? "",
    authorName: input.authorName ?? "Author",
    credentials: "MD",
    clinicName: clinicName || "Clinic",
    location: location || "—",
    date: new Date().toISOString().slice(0, 10),
    keyTerm,
    clinicalImplication: input.keyFinding?.slice(0, 80) ?? "clinical implication",
    intervention: input.intervention || "intervention",
    assessmentParameter1: "Assessment parameter 1",
    assessmentParameter2: "Age, Sex, Family History",
    labTest1: "Lab test 1",
    labTest2: "Lab test 2",
    labTest3: "Lab test 3",
    keyIndex: keyTerm || "Index",
    formula: getFormulaForTopic(category),
    normalRange: getNormalRange(category),
    elevatedThreshold: getElevatedThreshold(category),
    clinicalMeaning: getClinicalMeaning(sr),
    riskLevel1: "Low",
    range1: "—",
    action1: "Lifestyle, follow-up",
    riskLevel2: "Moderate",
    range2: "—",
    action2: "Intensify, consider treatment",
    riskLevel3: "High",
    range3: "—",
    action3: "Treatment, close follow-up",
    dietRecommendation: "Per guidelines",
    exerciseRecommendation: "Per guidelines",
    weightLossTarget: "As indicated",
    drug1: "Option 1",
    indication1: "As per indication",
    drug2: "Option 2",
    indication2: "As per indication",
    drug3: "Option 3",
    indication3: "As per indication",
    age: "—",
    sex: "—",
    keyParameter1: keyTerm,
    value1: "—",
    keyParameter2: "Outcome",
    value2: "—",
    keyTakeaway1: input.keyFinding?.slice(0, 120) ?? "Key takeaway 1",
    keyTakeaway2: input.outcome?.slice(0, 120) ?? "Key takeaway 2",
    websiteUrl: input.websiteUrl ?? "—",
    clinicInfo: input.clinicName ?? "—",
  };
}

/** Replace all {{placeholder}} in template with values from map. */
function replacePlaceholders(template: string, map: Record<string, string>): string {
  let out = template;
  for (const [key, value] of Object.entries(map)) {
    out = out.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return out;
}

/** Parse markdown with ## Slide N: titles into Slide[]. */
function parseSlides(rendered: string): Slide[] {
  const slides: Slide[] = [];
  const parts = rendered.split(/\n## Slide \d+:/);
  const header = parts[0].trim();
  if (header) slides.push({ title: "Header", content: header });
  for (let i = 1; i < parts.length; i++) {
    const block = parts[i].trim();
    const firstLine = block.indexOf("\n");
    const title = firstLine > 0 ? block.slice(0, firstLine).trim() : block;
    const content = firstLine > 0 ? block.slice(firstLine).trim() : "";
    slides.push({ title: title || `Slide ${i}`, content });
  }
  return slides.length > 0 ? slides : [{ title: "Slides", content: rendered }];
}

/**
 * Generate lecture slides from ContentAmplificationInput.
 * Uses template placeholders and helpers; returns structured Slide[].
 */
export function generateLectureSlides(input: ContentAmplificationInput | Partial<ContentAmplificationInput>): Slide[] {
  const map = getReplacements(input);
  const rendered = replacePlaceholders(LECTURE_TEMPLATE, map);
  return parseSlides(rendered);
}

/** Return the same content as a single markdown string (for Copy / PDF). */
export function generateLectureSlidesMarkdown(input: ContentAmplificationInput | Partial<ContentAmplificationInput>): string {
  const map = getReplacements(input);
  return replacePlaceholders(LECTURE_TEMPLATE, map);
}
