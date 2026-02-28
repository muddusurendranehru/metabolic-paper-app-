/**
 * 10-question CME quiz generator. Topic-agnostic; content from input only.
 * No imports from step-1 to step-6.
 */

import type { TopicInput } from "../topic-schema";

export interface MCQItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  category: string;
}

export function generateMCQBank(input: TopicInput): MCQItem[] {
  const { topicName, keyFindings, rValue, pValue, n, authorName, clinicName, location } = input;
  return [
    { category: "Basic", question: `What is the main topic of this module?`, options: [topicName || "This topic", "Unrelated topic A", "Unrelated topic B", "General review"], correctIndex: 0, explanation: `Focus: ${topicName || "this topic"}.` },
    { category: "Basic", question: `What was the primary outcome or metric reported?`, options: [keyFindings.slice(0, 80) || "Key findings", "Secondary outcome", "Demographics only", "No primary outcome"], correctIndex: 0, explanation: keyFindings.slice(0, 200) },
    { category: "Application", question: `What sample size (n) was used?`, options: [n || "Not reported", "n < 30", "n > 200", "Multi-center only"], correctIndex: 0, explanation: n ? `n = ${n}.` : "Not reported in input." },
    { category: "Application", question: `Where was this work conducted?`, options: [location || "Not specified", "Multiple centers", "International", "Not stated"], correctIndex: 0, explanation: location ? `Setting: ${location}.` : "Not specified." },
    { category: "Analysis", question: `How would you interpret the reported statistical significance?`, options: [pValue ? `p < ${pValue} (significant)` : "Based on study design", "Not significant", "Not reported", "Qualitative only"], correctIndex: 0, explanation: pValue ? `p < ${pValue} suggests statistical significance.` : "Interpret from key findings." },
    { category: "Analysis", question: `What correlation or effect was reported?`, options: [rValue ? `r = ${rValue}` : "See key findings", "No correlation", "Negative only", "Not applicable"], correctIndex: 0, explanation: rValue ? `r = ${rValue}.` : "Check key findings." },
    { category: "Clinical", question: `What is the main clinical implication?`, options: [keyFindings.slice(0, 100) || "See learning objectives", "No clinical use", "Research only", "Pending validation"], correctIndex: 0, explanation: keyFindings },
    { category: "Clinical", question: `Who is the intended audience?`, options: [input.targetAudience, "Patients only", "Researchers only", "Policy only"], correctIndex: 0, explanation: `Target: ${input.targetAudience}.` },
    { category: "Interpretation", question: `How should clinicians use these findings?`, options: ["Apply in context of key findings and audience", "Ignore until replicated", "Use only in trial settings", "Not applicable"], correctIndex: 0, explanation: "Apply in line with key findings and target audience." },
    { category: "Interpretation", question: `Who authored or led this work?`, options: [authorName || "See source", clinicName, "Multiple authors", "Anonymous"], correctIndex: 0, explanation: authorName ? `${authorName}, ${clinicName}.` : clinicName },
  ];
}
