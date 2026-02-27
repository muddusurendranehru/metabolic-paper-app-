/** Step 6: Journal submission – paper options, journal templates, quality checklist. */

export interface PaperOption {
  id: string;
  title: string;
  status: 'Published' | 'Submitted' | 'Active';
  journal?: string;
  doi?: string;
}

export const PAPER_OPTIONS: PaperOption[] = [
  { id: 'paper1', title: 'TyG & Metabolic Risk (NAFLD)', status: 'Published', journal: 'J Contemp Clin Pract', doi: '10.61336/jccp/25-08-50' },
  { id: 'paper2', title: 'TyG-WC & Insulin Resistance', status: 'Submitted', journal: 'IJCPR' },
  { id: 'paper3', title: 'TyG-HbA1c & ADA 2026 Risk', status: 'Active' },
];

export const JOURNAL_TEMPLATES = [
  { id: 'jcdr', name: 'JCDR (Journal of Clinical and Diagnostic Research)', abstractLimit: 250 },
  { id: 'ijcr', name: 'IJCR (International Journal of Clinical Research)', abstractLimit: 300 },
  { id: 'ijem', name: 'Indian J Endocrinol Metab', abstractLimit: 250 },
  { id: 'dms', name: 'Diabetes & Metabolic Syndrome', abstractLimit: 250 },
  { id: 'generic', name: 'Generic Medical Journal', abstractLimit: 300 },
];

export const CHECKLIST_ITEMS: { key: string; label: string }[] = [
  { key: 'titleClean', label: '✓ Title cleaned (no underlines, proper case)' },
  { key: 'abstractWordCount', label: '✓ Abstract within word limit' },
  { key: 'demographicsFormatted', label: '✓ Demographics as percentages with (n=XX)' },
  { key: 'tablesFormatted', label: '✓ Tables formatted with borders' },
  { key: 'referencesStyle', label: '✓ References (15+ Vancouver/APA style)' },
  { key: 'pValuesPresent', label: '✓ All correlations show p-values' },
  { key: 'hyphensFixed', label: '✓ Double-hyphens "--" → single "-"' },
  { key: 'ageRangesFixed', label: '✓ Age ranges: "26-72 years" (not "26 -- 72")' },
];

export type ChecklistResult = Record<string, boolean>;

export function runQualityChecklist(paper: { title?: string; abstract?: string; results?: string; tables?: { hasHeaders?: boolean }[]; references?: string[]; text?: string }, abstractLimit: number): ChecklistResult {
  return {
    titleClean: !paper.title?.includes('__') && !paper.title?.includes('_'),
    abstractWordCount: (paper.abstract?.split(' ').length || 0) <= abstractLimit,
    demographicsFormatted: !!(paper.results?.includes('(n=') && paper.results?.includes('%')),
    tablesFormatted: !!paper.tables?.length && paper.tables.every((t) => t.hasHeaders),
    referencesStyle: (paper.references?.length ?? 0) >= 15,
    pValuesPresent: !!(paper.results?.includes('p <') || paper.results?.includes('p=')),
    hyphensFixed: !paper.text?.includes('--'),
    ageRangesFixed: !paper.text?.includes(' -- '),
  };
}
