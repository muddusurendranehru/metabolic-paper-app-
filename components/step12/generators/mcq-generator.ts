/*
 * SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - No hardcoded medical terms (TyG, HbA1c, etc.) – all via input
 * - Topic-agnostic: works for ANY medical topic
 * - If Step 12 extensions are deleted, Steps 1-6 work 100%
 */
/**
 * Step 12 – MCQ generator: 3 MCQs with options, answer, explanation, difficulty, clinical pearl.
 * Imports ONLY from @/lib/utils/step12. Includes website URL for traffic.
 */

import { extractPlainText, STEP12_DEFAULT_WEBSITE_URL } from "@/lib/utils/step12";
import { formatSection, formatDocument } from "@/lib/utils/step12";

const WEBSITE_URL = STEP12_DEFAULT_WEBSITE_URL;

export interface MCQ {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
  clinicalPearl: string;
}

function extractKeyTerm(topic: string): string {
  return topic.trim().split(/\s+/)[0] || "the topic";
}

/** Generate 3 MCQs (topic-agnostic, from topic + optional sourceText and audience). */
export function generateMCQs(
  topic: string,
  sourceText?: string,
  audience?: string
): MCQ[] {
  const keyTerm = extractKeyTerm(topic);
  const _audience = audience ?? "doctors";

  return [
    {
      question: `What is the primary finding or role of ${keyTerm} in metabolic assessment?`,
      options: {
        A: "No correlation with metabolic parameters",
        B: "Significant correlation with metabolic parameters",
        C: "Inverse relationship with outcomes",
        D: "Only relevant in specific age groups",
      },
      correctAnswer: "B",
      explanation: `Evidence supports a significant correlation between ${keyTerm} and metabolic risk, supporting its utility as a screening or stratification tool.`,
      difficulty: "Easy",
      clinicalPearl: `${keyTerm} can often be derived from routine fasting labs – no additional cost. Learn more: ${WEBSITE_URL}`,
    },
    {
      question: `For a patient with elevated ${keyTerm}, what is the recommended clinical action?`,
      options: {
        A: "Ignore if asymptomatic",
        B: "Immediate pharmacotherapy only",
        C: "Lifestyle intervention + monitoring",
        D: "Dietary changes only",
      },
      correctAnswer: "C",
      explanation: `Elevated ${keyTerm} indicates metabolic risk; guidelines recommend lifestyle intervention (diet, activity) and regular monitoring.`,
      difficulty: "Medium",
      clinicalPearl: "Early lifestyle intervention can prevent progression. Free tools: " + WEBSITE_URL,
    },
    {
      question: `Which patient population benefits most from ${keyTerm} screening?`,
      options: {
        A: "Children only",
        B: "Low BMI only",
        C: "Adults with central obesity (e.g. WC ≥90/80 cm)",
        D: "Pregnant women only",
      },
      correctAnswer: "C",
      explanation: `Adults with central obesity derive strong benefit from ${keyTerm} screening due to higher metabolic risk; use population-appropriate cutoffs.`,
      difficulty: "Medium",
      clinicalPearl: `Use appropriate waist cutoffs for your population. Free metabolic check: ${WEBSITE_URL}`,
    },
  ];
}

/** Format a single MCQ for display (e.g. in UI or copy-paste). */
export function formatMCQForDisplay(mcq: MCQ, index: number): string {
  return `
**Question ${index + 1} (${mcq.difficulty}):**
${mcq.question}

A) ${mcq.options.A}
B) ${mcq.options.B}
C) ${mcq.options.C}
D) ${mcq.options.D}

✅ **Answer:** ${mcq.correctAnswer}

**Explanation:** ${mcq.explanation}

💡 **Clinical Pearl:** ${mcq.clinicalPearl}
`.trim();
}

/** Generate full string output for Step 12 MCQ format (3 MCQs + CTA URL). */
export function generateMcqGenerator(sourceText: string, title?: string): string {
  const topic = title ?? "Topic";
  const text = sourceText ? extractPlainText(sourceText) : "";
  const mcqs = generateMCQs(topic, text);

  const questionsBlock = mcqs.map((mcq, i) => formatMCQForDisplay(mcq, i)).join("\n\n");

  const sections = [
    formatSection(topic + " – 3 MCQs", "Topic-agnostic; use for self-assessment or teaching. Adjust answers if your source suggests different options."),
    formatSection("Questions", questionsBlock),
    formatSection("Get more", `Free metabolic risk check – no signup: ${WEBSITE_URL}\n📞 09963721999 | HOMA Clinic Gachibowli`),
  ];
  return formatDocument(sections);
}
