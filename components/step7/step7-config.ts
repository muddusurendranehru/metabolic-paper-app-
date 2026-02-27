/** Step 7: Quality Assurance – checklist labels and format templates. */

export const FORMAT_TEMPLATES = [
  { id: 'ijcr', name: 'IJCR: Arial 11pt, double-space, 1" margins' },
  { id: 'jcpr', name: 'JCPR: Times New Roman 12pt, 1.5 space' },
  { id: 'vancouver', name: 'Indian Journal Standards (Vancouver references)' },
] as const;

export type PlagiarismStatus = 'pass' | 'review' | 'fail';
export function getPlagiarismStatus(percent: number): PlagiarismStatus {
  if (percent < 15) return 'pass';
  if (percent <= 25) return 'review';
  return 'fail';
}

export const GRAMMAR_MIN_SCORE = 8;
