/**
 * Step 9 – MCQ generator for medical education from paper content.
 */

export interface MCQItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface MCQGeneratorOptions {
  title: string;
  abstract: string;
  count?: number;
}

/** Generate placeholder MCQs from paper (stub; integrate with LLM later). */
export function generateMCQs(opts: MCQGeneratorOptions): MCQItem[] {
  const { title, count = 3 } = opts;
  return [
    {
      question: `What is the primary outcome measured in "${title}"?`,
      options: ["TyG index", "HbA1c", "Waist circumference", "All of the above"],
      correctIndex: 3,
      explanation: "The study reports TyG, HbA1c, and waist.",
    },
    {
      question: "Which correlation was reported as significant?",
      options: ["TyG vs waist", "TyG vs HbA1c", "HbA1c vs waist", "None"],
      correctIndex: 1,
    },
    {
      question: "What clinical bands were used for HbA1c?",
      options: ["ADA only", "Dr. Muddu bands (Normal, Prediabetes, Good, Poor, Alert)", "WHO only", "Single cutoff"],
      correctIndex: 1,
    },
  ].slice(0, opts.count ?? 3);
}
