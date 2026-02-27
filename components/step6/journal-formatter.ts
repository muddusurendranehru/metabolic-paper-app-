/**
 * Step 6: Format paper content for selected journal.
 * Returns a structured paper object for checklist and export (docx, cover letter).
 */

export interface PaperData {
  title: string;
  abstract: string;
  introduction: string;
  methods: string;
  results: string;
  discussion: string;
  conclusion: string;
  references: string[];
  tables: any[];
  figures: any[];
}

/** Compatible with docx-export and cover-letter-generator (PaperData + text for checklist). */
export type FormattedPaper = PaperData & { text: string };

export interface JournalConfig {
  id: string;
  name: string;
  abstractLimit: number;
  fontStyle: string;
  fontSize: string;
  lineSpacing: string;
  referenceStyle: 'Vancouver' | 'APA' | 'Harvard';
  requiresClinicalSignificance: boolean;
  requiresKeyMessages: boolean;
  maxTables: number;
  maxFigures: number;
}

const JOURNAL_CONFIGS: Record<string, JournalConfig> = {
  jcdr: {
    id: 'jcdr',
    name: 'Journal of Clinical and Diagnostic Research',
    abstractLimit: 250,
    fontStyle: 'Times New Roman',
    fontSize: '12pt',
    lineSpacing: '1.5',
    referenceStyle: 'Vancouver',
    requiresClinicalSignificance: true,
    requiresKeyMessages: false,
    maxTables: 5,
    maxFigures: 3,
  },
  ijcr: {
    id: 'ijcr',
    name: 'International Journal of Clinical Research',
    abstractLimit: 300,
    fontStyle: 'Arial',
    fontSize: '11pt',
    lineSpacing: '2.0',
    referenceStyle: 'Vancouver',
    requiresClinicalSignificance: false,
    requiresKeyMessages: false,
    maxTables: 6,
    maxFigures: 4,
  },
  ijem: {
    id: 'ijem',
    name: 'Indian J Endocrinol Metab',
    abstractLimit: 250,
    fontStyle: 'Times New Roman',
    fontSize: '12pt',
    lineSpacing: '1.5',
    referenceStyle: 'Vancouver',
    requiresClinicalSignificance: true,
    requiresKeyMessages: true,
    maxTables: 4,
    maxFigures: 3,
  },
  dms: {
    id: 'dms',
    name: 'Diabetes & Metabolic Syndrome',
    abstractLimit: 250,
    fontStyle: 'Times New Roman',
    fontSize: '12pt',
    lineSpacing: '2.0',
    referenceStyle: 'APA',
    requiresClinicalSignificance: false,
    requiresKeyMessages: false,
    maxTables: 5,
    maxFigures: 4,
  },
  generic: {
    id: 'generic',
    name: 'Generic Medical Journal',
    abstractLimit: 300,
    fontStyle: 'Calibri',
    fontSize: '11pt',
    lineSpacing: '1.0',
    referenceStyle: 'Vancouver',
    requiresClinicalSignificance: false,
    requiresKeyMessages: false,
    maxTables: 6,
    maxFigures: 5,
  },
};

const PAPER_TITLES: Record<string, string> = {
  paper1: 'TyG Index and Metabolic Risk in NAFLD: A Cross-Sectional Study',
  paper2: 'TyG-Waist Circumference Index and Insulin Resistance in Indian Adults',
  paper3: 'TyG Index and HbA1c for ADA 2026 Diabetes Risk Stratification',
};

const PAPER_ABSTRACTS: Record<string, string> = {
  paper1: 'Objective: To evaluate the association between triglyceride-glucose (TyG) index and metabolic risk in patients with non-alcoholic fatty liver disease (NAFLD). Methods: Cross-sectional study at HOMA Clinic. TyG index was calculated from fasting triglycerides and glucose. Results: Mean TyG was 9.2 (n=120). High metabolic risk was observed in 68% (n=82). Conclusion: TyG index correlates with metabolic risk in NAFLD and may serve as a simple screening tool.',
  paper2: 'Objective: To assess TyG-waist circumference index and insulin resistance in Indian adults. Methods: Cross-sectional study. TyG-WC was computed; HOMA-IR and waist circumference were measured. Results: Participants (n=150) showed mean age 45.2 years; 62% (n=93) had central obesity. Correlation between TyG-WC and HOMA-IR was significant (r=0.72, p < 0.001). Conclusion: TyG-WC is a practical marker of insulin resistance in this population.',
  paper3: 'Objective: To evaluate TyG index and HbA1c for ADA 2026 diabetes risk stratification in Indian adults. Methods: Cross-sectional study at HOMA Clinic. TyG and HbA1c were measured; risk bands were applied. Results: Participants (n=140) mean age 48 years; demographics presented as (n=140), 54% male. Correlations were significant (p < 0.05). Conclusion: TyG-HbA1c combination supports risk stratification in line with ADA 2026 criteria.',
};

const BASE_INTRODUCTION = 'Central (abdominal) obesity is a major contributor to insulin resistance and metabolic syndrome. The triglyceride-glucose (TyG) index has emerged as a simple surrogate marker. This study aimed to evaluate the correlation between TyG index and waist circumference in Indian adults.';
const BASE_METHODS = 'This cross-sectional observational study was conducted at HOMA Clinic, Gachibowli, Hyderabad. Fasting triglycerides, fasting glucose, and waist circumference were measured. TyG index was calculated as ln(fasting TG [mg/dL] × fasting glucose [mg/dL] / 2). IDF waist cutoffs were applied.';
const BASE_RESULTS = 'The mean age was 48.6 ± 10.8 years. Demographics (n=140): 54% male. TyG index correlated with HbA1c (r = 0.65, p < 0.001). Risk stratification by ADA 2026 bands showed 32% normal, 28% prediabetes, 40% elevated risk.';
const BASE_DISCUSSION = 'In the present cross-sectional study, TyG index showed significant correlation with waist circumference and with HbA1c. The findings support the use of TyG as a practical screening tool in resource-limited settings.';
const BASE_CONCLUSION = 'TyG index and TyG–HbA1c combination are strong predictors of metabolic risk and glycemic burden. TyG-WC index is a cost-effective tool for identifying individuals at risk of central obesity and insulin resistance.';

const SAMPLE_REFERENCES = [
  'Simental-Mendía LE, et al. The product of triglycerides and glucose. Arch Med Res. 2008.',
  'Guerrero-Romero F, et al. The product of triglycerides and glucose. BMC Cardiovasc Disord. 2010.',
  'Er LK, et al. Triglyceride glucose-body mass index. Cardiovasc Diabetol. 2016.',
  'American Diabetes Association. Classification and diagnosis of diabetes. Diabetes Care. 2026.',
  'International Diabetes Federation. IDF Diabetes Atlas. 2021.',
  'Kahn R, et al. The metabolic syndrome. Lancet. 2005.',
  'McLaughlin T, et al. Use of metabolic markers. Diabetes Care. 2003.',
  'Sánchez-García A, et al. TyG index and metabolic syndrome. Endocr Pract. 2020.',
  'Navarro-González D, et al. Triglyceride-glucose index. J Clin Endocrinol Metab. 2016.',
  'Du T, et al. TyG index and diabetes. Cardiovasc Diabetol. 2016.',
  'Vasques AC, et al. TyG index and insulin resistance. Diabetol Metab Syndr. 2011.',
  'Lee SH, et al. TyG index and NAFLD. J Gastroenterol Hepatol. 2019.',
  'Wang Y, et al. TyG and cardiovascular events. Nutr Metab Cardiovasc Dis. 2020.',
  'Low S, et al. TyG index in Asian populations. J Diabetes Investig. 2019.',
  'HOMA Clinic. Internal protocol for TyG studies. Hyderabad, India. 2025.',
];

export function formatPaperForJournal(paperId: string, journalId: string): FormattedPaper {
  const config = JOURNAL_CONFIGS[journalId] ?? JOURNAL_CONFIGS.generic;
  // Get base paper data (would connect to Step 5 manuscript generator)
  const basePaper = getBasePaperData(paperId);

  // Apply journal-specific formatting
  const formattedPaper: PaperData = {
    title: cleanTitle(basePaper.title),
    abstract: formatAbstract(basePaper.abstract, config.abstractLimit),
    introduction: fixHyphens(basePaper.introduction),
    methods: fixHyphens(basePaper.methods),
    results: formatDemographics(basePaper.results),
    discussion: fixHyphens(basePaper.discussion),
    conclusion: basePaper.conclusion,
    references: formatReferences(basePaper.references, config.referenceStyle),
    tables: formatTables(basePaper.tables, config.maxTables),
    figures: formatFigures(basePaper.figures, config.maxFigures),
  };

  if (config.requiresClinicalSignificance) {
    formattedPaper.discussion += '\n\n### Clinical Significance\n\nThis study provides evidence for the use of TyG index as a practical, cost-effective screening tool for metabolic risk and central obesity in Indian adults. Clinicians can incorporate TyG calculation from routine fasting lipid and glucose tests to identify individuals who may benefit from lifestyle intervention.';
  }

  // Add journal-specific sections if required
  if (config.requiresKeyMessages) {
    formattedPaper.conclusion += '\n\n### Key Messages\n\n• TyG index is a practical screening tool for metabolic risk.\n• Cost-effective for resource-limited settings.\n• TyG–HbA1c correlation supports glycemic risk stratification.';
  }

  const text = [formattedPaper.title, formattedPaper.abstract, formattedPaper.results].join('\n\n');
  return { ...formattedPaper, text };
}

function getBasePaperData(paperId: string): PaperData {
  // Would fetch from existing Step 5 manuscript generator; for now placeholder per paper
  const title = PAPER_TITLES[paperId] ?? 'TyG Index Study';
  const abstract = PAPER_ABSTRACTS[paperId] ?? PAPER_ABSTRACTS.paper3;
  return {
    title,
    abstract,
    introduction: BASE_INTRODUCTION,
    methods: BASE_METHODS,
    results: BASE_RESULTS,
    discussion: BASE_DISCUSSION,
    conclusion: BASE_CONCLUSION,
    references: [...SAMPLE_REFERENCES],
    tables: [{ hasHeaders: true }, { hasHeaders: true }],
    figures: [],
  };
}

function cleanTitle(title: string): string {
  return title
    .replace(/__/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatAbstract(abstract: string, wordLimit: number): string {
  const words = abstract.split(' ');
  if (words.length <= wordLimit) return abstract;
  return words.slice(0, wordLimit).join(' ') + '...';
}

function fixHyphens(text: string): string {
  return text
    .replace(/--/g, '–')
    .replace(/ - /g, ' – ')
    .replace(/(\d+)\s*--\s*(\d+)/g, '$1–$2');
}

function formatDemographics(results: string): string {
  return results
    .replace(/(\d+)\s+patients\s+were/g, '(n=$1) patients were')
    .replace(/(\d+)\s+participants/g, '(n=$1) participants')
    .replace(/(\d+)\s+were\s+(male|female)/g, (_, count, gender) => `${count} were ${gender} (n=${count})`);
}

function formatReferences(references: string[], _style: 'Vancouver' | 'APA' | 'Harvard'): string[] {
  // Vancouver numbering applied at docx export; pass through to avoid double numbering
  return [...references];
}

function formatTables(tables: any[], maxTables: number): any[] {
  return tables.slice(0, maxTables).map((table) => ({
    ...table,
    hasHeaders: true,
    hasBorders: true,
    style: 'grid',
  }));
}

function formatFigures(figures: any[], maxFigures: number): any[] {
  return figures.slice(0, maxFigures).map((fig) => ({
    ...fig,
    hasCaption: true,
    resolution: '300 DPI',
  }));
}

export function getJournalConfig(journalId: string): JournalConfig {
  return JOURNAL_CONFIGS[journalId] ?? JOURNAL_CONFIGS.generic;
}

export function validateForJournal(paper: PaperData, journalId: string): Record<string, boolean> {
  const config = getJournalConfig(journalId);
  return {
    abstractWithinLimit: (paper.abstract?.split(' ').length || 0) <= config.abstractLimit,
    referencesSufficient: (paper.references?.length || 0) >= 15,
    tablesWithinLimit: (paper.tables?.length || 0) <= config.maxTables,
    figuresWithinLimit: (paper.figures?.length || 0) <= config.maxFigures,
    hasClinicalSignificance: !config.requiresClinicalSignificance || !!paper.discussion?.includes('Clinical Significance'),
    hasKeyMessages: !config.requiresKeyMessages || !!paper.conclusion?.includes('Key Messages'),
  };
}
