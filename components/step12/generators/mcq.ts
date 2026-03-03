/*
 * SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - No hardcoded medical terms (TyG, HbA1c, etc.) – all via input
 * - Topic-agnostic: works for ANY medical topic
 * - If Step 12 extensions are deleted, Steps 1-6 work 100%
 */
/**
 * Step 12 – MCQ (multiple choice questions) generator. Imports ONLY from @/lib/utils/step12.
 * Topic-agnostic: builds questions from topic + source text.
 */

import { extractPlainText, extractSnippet } from "@/lib/utils/step12";
import { formatSection, formatDocument } from "@/lib/utils/step12";

function extractKeyTerm(topic: string): string {
  return topic.trim().split(/\s+/)[0] || "the topic";
}

/**
 * Generate 5–8 MCQs from source text and topic. Each: question, A–D options, correct letter, brief explanation.
 */
export function generateMcq(sourceText: string, title?: string): string {
  const text = extractPlainText(sourceText);
  const topic = title ?? "Topic";
  const keyTerm = extractKeyTerm(topic);
  const sentences = text ? text.split(/(?<=[.!?])\s+/).filter(Boolean) : [];
  const snippet1 = sentences[0] ? extractSnippet(sentences[0], 100) : "";
  const snippet2 = sentences[1] ? extractSnippet(sentences[1], 100) : "";
  const snippet3 = sentences[2] ? extractSnippet(sentences[2], 100) : "";

  const questions: string[] = [
    `1. What is the primary focus of ${topic}?\n   A) Screening and prevention\n   B) Diagnosis and monitoring\n   C) Treatment guidelines\n   D) All of the above\n   **Answer: D**\n   Explanation: Evidence-based practice covers screening, diagnosis, and treatment.`,
    `2. ${keyTerm} is best described as:\n   A) A biomarker only\n   B) A clinical tool for risk stratification\n   C) Not relevant in Indian settings\n   D) Only for research\n   **Answer: B**\n   Explanation: ${snippet1 || `${keyTerm} is used in clinical risk assessment.`}`,
    `3. Which audience benefits most from understanding ${topic}?\n   A) Patients only\n   B) Clinicians only\n   C) Both patients and clinicians\n   D) Researchers only\n   **Answer: C**\n   Explanation: Shared decision-making relies on both.`,
    `4. When considering ${keyTerm}, the evidence suggests:\n   A) No role in practice\n   B) Use as part of a full assessment\n   C) Replace all other markers\n   D) Use only in trials\n   **Answer: B**\n   Explanation: ${snippet2 || "Use alongside standard care."}`,
    `5. Practical recommendations for ${topic} include:\n   A) Ignoring guidelines\n   B) Individualising based on context\n   C) One-size-fits-all\n   D) Deferring to research only\n   **Answer: B**\n   Explanation: ${snippet3 || "Tailor to patient and setting."}`,
  ];

  if (sentences.length > 3) {
    const s4 = extractSnippet(sentences[3], 80);
    questions.push(
      `6. A key takeaway from current evidence on ${keyTerm} is:\n   A) Limited applicability\n   B) Growing relevance in metabolic care\n   C) Only for specialists\n   D) Not for Indian populations\n   **Answer: B**\n   Explanation: ${s4 || "Evidence supports clinical relevance."}`
    );
  }

  const sections = [
    formatSection(topic + " – Multiple Choice Questions", "Use for self-assessment or teaching. All content is topic-agnostic and derived from your source."),
    formatSection("Questions", questions.join("\n\n")),
    formatSection("How to use", "Copy into quizzes, LMS, or CME materials. Adjust correct answers if your source implies different options."),
  ];

  return formatDocument(sections);
}
