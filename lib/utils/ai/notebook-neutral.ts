/**
 * Neutral Content (Notebook) – clinical education, PubMed-style ONLY.
 * ISOLATED: No patient claims, no testimonials, no identifiers.
 * Language: 70% English, 30% Telugu (Hyderabad style).
 * SAFETY: NEVER mix this output with patient review / testimonial content.
 */

export interface NeutralNotebookInput {
  topic: string;
  /** Optional: max 2–3 sentences for evidence block */
  evidenceHint?: string;
}

/**
 * Generate neutral, evidence-aware script for clinical education only.
 * Tone: "Evidence is evolving". No patient claims, no remission/success stories.
 */
export function generateNeutralNotebookScript(input: NeutralNotebookInput): string {
  const topic = (input.topic || "this topic").trim();
  const hint = (input.evidenceHint || "").trim();

  const evidenceLine = hint
    ? `Current evidence: ${hint} Interpret with caution; discuss with your physician.`
    : `Evidence on ${topic} is evolving. Focus on routine monitoring and personalized counseling with your healthcare team.`;

  return `[Neutral clinical content – ${topic}]
⚠ Do NOT use with patient testimonials. For clinical education only.

HOOK:
"TyG index and metabolic health—today we look at ${topic} from an evidence perspective only."

EVIDENCE (70% English, 30% Telugu style):
"${evidenceLine} // Anna, no patient claims here—only what studies suggest so far. Consult your doctor."

CTA:
"Free tools at HOMA Clinic website. For information only—not medical advice."

---
Neutral content | No patient claims | Evidence-evolving language only.`.trim();
}
