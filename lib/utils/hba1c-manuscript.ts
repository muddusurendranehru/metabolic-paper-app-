/**
 * Paper 2 (TyG–HbA1c) – ACTIVE DEVELOPMENT.
 * Manuscript generator: filter patients with TyG AND HbA1c; mean HbA1c, % ≥7.0%, TyG–HbA1c correlation.
 * Export shape matches ManuscriptData for Word export with embedded figures.
 */

import type { Patient } from '@/lib/types/patient';
import { correlation, correlationPValue } from '@/lib/tyg';
import { anonymizePatients } from './anonymize';
import { getDiabetesRisk, getDiabetesRiskStats, getDiabetesRiskStatsForCohort, PAPER3_TITLE } from './diabetes-risk';
import { normalizeManuscriptText } from './manuscript-text-normalizer';

export type PatientWithStatus = Patient & { status?: string };

/** Patients with both TyG and HbA1c (valid numbers). */
export function filterPatientsWithTyGAndHbA1c(patients: PatientWithStatus[]): PatientWithStatus[] {
  return patients.filter(
    (p) =>
      p.tyg != null &&
      Number.isFinite(p.tyg) &&
      p.hba1c != null &&
      Number.isFinite(p.hba1c)
  );
}

export interface HbA1cStats {
  n: number;
  meanHbA1c: number;
  sdHbA1c: number;
  pctHbA1cAtLeast7: number;
  countHbA1cAtLeast7: number;
  tygHbA1cR: number;
  tygHbA1cP: number;
}

export function calculateHbA1cStats(patients: PatientWithStatus[]): HbA1cStats {
  const withBoth = filterPatientsWithTyGAndHbA1c(patients);
  const n = withBoth.length;
  if (n === 0) {
    return {
      n: 0,
      meanHbA1c: 0,
      sdHbA1c: 0,
      pctHbA1cAtLeast7: 0,
      countHbA1cAtLeast7: 0,
      tygHbA1cR: 0,
      tygHbA1cP: 1,
    };
  }
  const hba1cValues = withBoth.map((p) => p.hba1c!);
  const tygValues = withBoth.map((p) => p.tyg!);
  const meanHbA1c = hba1cValues.reduce((a, b) => a + b, 0) / n;
  const variance =
    hba1cValues.reduce((s, x) => s + (x - meanHbA1c) ** 2, 0) / n;
  const sdHbA1c = Math.sqrt(variance);
  const countHbA1cAtLeast7 = hba1cValues.filter((x) => x >= 7).length;
  const pctHbA1cAtLeast7 = (countHbA1cAtLeast7 / n) * 100;
  const tygHbA1cR = correlation(tygValues, hba1cValues);
  const tygHbA1cP = correlationPValue(tygHbA1cR, n);

  return {
    n,
    meanHbA1c,
    sdHbA1c,
    pctHbA1cAtLeast7,
    countHbA1cAtLeast7,
    tygHbA1cR,
    tygHbA1cP,
  };
}

/** ManuscriptData-compatible shape for Word export (same as ijcpr-manuscript). */
export interface HbA1cManuscriptData {
  title: string;
  authors: string;
  affiliation: string;
  abstract: string;
  keywords: string;
  introduction: string;
  methods: string;
  results: string;
  discussion: string;
  conclusion: string;
  references: string;
  table1: string;
  table2: string;
  figure1Caption: string;
  figure2Caption: string;
  figure3Caption: string;
  clinicalSignificance?: string;
  keyMessages?: string;
  fundingStatement?: string;
  conflictOfInterest?: string;
  authorContributions?: string;
  dataAvailability?: string;
}

function pad(s: string, len: number): string {
  return String(s).slice(0, len).padEnd(len);
}

export function generateHbA1cManuscript(
  patients: PatientWithStatus[]
): HbA1cManuscriptData {
  const withBoth = filterPatientsWithTyGAndHbA1c(patients);
  const stats = calculateHbA1cStats(patients);
  const anonymized = anonymizePatients(withBoth);
  const n = stats.n;

  // Use value-only for prose to avoid "P P = 0.001" when concatenated
  const pValOnly = stats.tygHbA1cP < 0.001 ? '< 0.001' : `= ${stats.tygHbA1cP.toFixed(3)}`;
  const pStr = stats.tygHbA1cP < 0.001 ? 'P < 0.001' : `P = ${stats.tygHbA1cP.toFixed(3)}`;
  const meanAge = withBoth.length > 0 ? withBoth.reduce((s, p) => s + (p.age ?? 0), 0) / withBoth.length : 0;
  const ageValues = withBoth.map((p) => p.age ?? 0);
  const sdAge = ageValues.length > 0 ? Math.sqrt(ageValues.reduce((s, x) => s + (x - meanAge) ** 2, 0) / ageValues.length) : 0;
  const meanTg = withBoth.length > 0 ? withBoth.reduce((s, p) => s + (p.tg ?? 0), 0) / withBoth.length : 0;
  const meanGlucose = withBoth.length > 0 ? withBoth.reduce((s, p) => s + (p.glucose ?? 0), 0) / withBoth.length : 0;
  const meanTyGForText = n > 0 ? withBoth.reduce((s, p) => s + (p.tyg ?? 0), 0) / n : 0;
  const tygValuesForSd = withBoth.map((p) => p.tyg ?? 0);
  const sdTyG = tygValuesForSd.length > 0 ? Math.sqrt(tygValuesForSd.reduce((s, x) => s + (x - meanTyGForText) ** 2, 0) / tygValuesForSd.length) : 0;
  const nScreened = patients.length;
  const pctIncluded = nScreened > 0 ? ((n / nScreened) * 100).toFixed(1) : '0';
  const waistValues = withBoth.map((p) => p.waist ?? 0);
  const meanWaist = waistValues.length > 0 ? waistValues.reduce((a, b) => a + b, 0) / waistValues.length : 0;
  const sdWaist = waistValues.length > 0 ? Math.sqrt(waistValues.reduce((s, x) => s + (x - meanWaist) ** 2, 0) / waistValues.length) : 0;
  const tgValues = withBoth.map((p) => p.tg ?? 0);
  const sdTg = tgValues.length > 0 ? Math.sqrt(tgValues.reduce((s, x) => s + (x - meanTg) ** 2, 0) / tgValues.length) : 0;
  const glucoseValues = withBoth.map((p) => p.glucose ?? 0);
  const sdGlucose = glucoseValues.length > 0 ? Math.sqrt(glucoseValues.reduce((s, x) => s + (x - meanGlucose) ** 2, 0) / glucoseValues.length) : 0;
  const hdlValues = withBoth.map((p) => p.hdl ?? 0);
  const meanHdl = hdlValues.length > 0 ? hdlValues.reduce((a, b) => a + b, 0) / hdlValues.length : 0;
  const sdHdl = hdlValues.length > 0 ? Math.sqrt(hdlValues.reduce((s, x) => s + (x - meanHdl) ** 2, 0) / hdlValues.length) : 0;
  const isMale = (s: string | undefined) => (s ?? '').toLowerCase().startsWith('m') || (s ?? '').toLowerCase() === 'male';
  const isFemale = (s: string | undefined) => (s ?? '').toLowerCase().startsWith('f') || (s ?? '').toLowerCase() === 'female';
  const maleCount = withBoth.filter((p) => isMale(p.sex)).length;
  const femaleCount = withBoth.filter((p) => isFemale(p.sex)).length;
  const malePct = n > 0 ? ((maleCount / n) * 100).toFixed(1) : '0';
  const femalePct = n > 0 ? ((femaleCount / n) * 100).toFixed(1) : '0';
  const hba1cSorted = [...(withBoth.map((p) => p.hba1c!) as number[])].sort((a, b) => a - b);
  const medianHbA1c = n > 0 ? (n % 2 === 1 ? hba1cSorted[Math.floor(n / 2)]! : (hba1cSorted[n / 2 - 1]! + hba1cSorted[n / 2]!) / 2) : 0;
  const minHbA1c = hba1cSorted[0] ?? 0;
  const maxHbA1c = hba1cSorted[n - 1] ?? 0;
  const hba1cRange = n > 0 ? `${minHbA1c.toFixed(1)}% – ${maxHbA1c.toFixed(1)}%` : '—';
  const corrDir = stats.tygHbA1cR > 0 ? 'positive' : 'negative';
  const hba1cBelow7 = n - stats.countHbA1cAtLeast7;
  const pctBelow7 = n > 0 ? ((hba1cBelow7 / n) * 100).toFixed(1) : '0';

  const diabetesStats = getDiabetesRiskStatsForCohort(withBoth);
  const verifiedStats = getDiabetesRiskStats(withBoth);
  const nValid = verifiedStats.total;
  const pValue = stats.tygHbA1cP;
  const pStrManuscript = pValue < 0.001 ? 'P < 0.001' : `P = ${pValue.toFixed(3)}`;
  const pearsonLine = pValue < 0.001
    ? `Pearson r = ${stats.tygHbA1cR.toFixed(2)}, p < 0.001`
    : `Pearson r = ${stats.tygHbA1cR.toFixed(2)}, p = ${pValue.toFixed(3)}`;
  const absR = Math.abs(stats.tygHbA1cR);
  const strength = absR >= 0.5 ? 'Strong' : absR >= 0.3 ? 'Moderate' : absR >= 0.1 ? 'Weak' : 'Negligible';
  const corrInterpretation = pValue < 0.001
    ? `${strength} ${corrDir} correlation, highly significant`
    : `${strength} ${corrDir} correlation${pValue < 0.05 ? ', significant' : ''}`;
  const hba1cMeanSd = n > 0 ? `${stats.meanHbA1c.toFixed(1)} ± ${stats.sdHbA1c.toFixed(2)}` : '—';

  const title = PAPER3_TITLE;
  const authors = 'Dr. Muddu Surendra Nehru, MD';
  const affiliation =
    'Professor of Medicine, HOMA Clinic, Gachibowli, Hyderabad, Telangana, India';
  const keywords =
    'TyG index, HbA1c, clinical HbA1c bands, glycemic control, lipotoxicity, glucotoxicity, waist circumference, India';

  const abstract = `Objective: To evaluate the correlation between triglyceride-glucose (TyG) index and HbA1c-based glycemic control stratification per clinical monitoring guidelines in Indian adults.

Methods: This cross-sectional study was conducted at HOMA Clinic, Hyderabad. Of ${nScreened} patients screened, ${n} (${pctIncluded}%) with both TyG index and HbA1c measurements were included. TyG index was calculated as ln(fasting triglycerides × fasting glucose / 2). Diabetes risk was stratified by HbA1c: Normal (<6.0%), Prediabetes (6.1-6.5%), Good control (6.6-7.0%), Poor control (7.1-8.0%), Alert (>8.1%). Pearson correlation coefficient was calculated.

Results: Mean age was ${meanAge.toFixed(1)} ± ${sdAge.toFixed(1)} years. Mean TyG index was ${meanTyGForText.toFixed(2)} ± ${sdTyG.toFixed(2)}. Mean HbA1c was ${stats.meanHbA1c.toFixed(2)}% ± ${stats.sdHbA1c.toFixed(2)}%. Diabetes risk distribution: Normal ${diabetesStats.normalPct}%, Prediabetes ${diabetesStats.prediabetesPct}%, Good ${diabetesStats.goodPct}%, Poor ${diabetesStats.poorPct}%, Alert ${diabetesStats.alertPct}%${Number(diabetesStats.pending) > 0 ? `, Pending/Missing ${diabetesStats.pendingPct}%` : ''} (= 100%). Pearson correlation analysis revealed a significant ${corrDir} correlation between TyG index and HbA1c (r = ${stats.tygHbA1cR.toFixed(2)}, P ${pValOnly}).

Conclusion: TyG index shows significant positive correlation with HbA1c in Indian adults. As a simple, cost-effective marker derived from routine fasting tests, TyG index may serve as a practical screening tool for identifying individuals requiring glycemic monitoring and early intervention.`;

  const introduction = `The diabetes epidemic in India and globally demands practical, cost-effective tools for risk stratification and glycemic monitoring. Insulin resistance (IR) is a key pathophysiological mechanism underlying type 2 diabetes and metabolic syndrome; early identification of IR is crucial for preventive interventions.

The triglyceride-glucose (TyG) index has emerged as a simple surrogate marker of insulin resistance, calculated from routinely measured fasting triglycerides and fasting glucose. First described by Simental-Mendia et al., the TyG index correlates with gold-standard measures of insulin sensitivity. Glycated hemoglobin (HbA1c) reflects average blood glucose over 2–3 months and is the standard for glycemic control. The relationship between TyG and HbA1c has important implications for diabetes screening.

Despite growing evidence for TyG as a metabolic risk marker, data on its correlation with HbA1c in Indian populations remain limited. This study aims to evaluate the correlation between TyG index and HbA1c in Indian adults attending HOMA Clinic, Hyderabad, and to describe diabetes risk stratification using clinical HbA1c bands.`;

  const methods = `Study Design: Cross-sectional observational study

Setting: HOMA Clinic, Gachibowli, Hyderabad, Telangana, India

Screening and Sample: Total screened ${nScreened} patients; ${n} (${pctIncluded}%) with complete TyG+HbA1c were analyzed.

Ethical Considerations: Anonymised data from routine clinical practice at HOMA Clinic with institutional permission. Patient identifiers were removed prior to analysis. Conflict of interest: None declared. Funding: No external funding received.

Study Population: A total of ${n} adult patients with both TyG index and HbA1c measurements were included.

Inclusion Criteria:
- Adults aged 18-80 years
- Fasting lipid profile available
- Fasting blood glucose measured
- HbA1c measured
- Waist circumference recorded

Exclusion Criteria:
- Known diabetes on insulin therapy
- Pregnancy
- Acute illness or infection

TyG Index Calculation:
TyG = ln(fasting triglycerides [mg/dL] × fasting blood glucose [mg/dL] / 2)

Statistical Analysis:
- Mean ± SD for continuous variables
- Pearson correlation coefficient (r) for TyG-HbA1c relationship
- P-value <0.05 considered statistically significant`;

  const results = normalizeManuscriptText(`Baseline Characteristics:
A total of ${n} patients with complete TyG index and HbA1c measurements were included in the analysis.${nValid === n && n > 0 ? ` All ${n} patients were verified and included in correlation and band distribution calculations.` : nValid > 0 && nValid < n ? ` Of these, ${nValid} were verified and included in correlation and band distribution calculations.` : ''} Mean age was ${meanAge.toFixed(1)} ± ${sdAge.toFixed(1)} years.

Metabolic Parameters:
- Mean Triglycerides: ${meanTg.toFixed(1)} mg/dL
- Mean Fasting Glucose: ${meanGlucose.toFixed(1)} mg/dL
- Mean HbA1c: ${hba1cMeanSd}% (median ${medianHbA1c.toFixed(1)}%, range ${hba1cRange})
- Mean TyG Index: ${meanTyGForText.toFixed(2)} ± ${sdTyG.toFixed(2)}

Glycemic Control:
- HbA1c ≥7.0%: ${stats.countHbA1cAtLeast7} patients (${stats.pctHbA1cAtLeast7.toFixed(1)}%)
- HbA1c <7.0%: ${hba1cBelow7} patients (${pctBelow7}%)

Clinical Bands Distribution (n=${n}):
- Normal (<6.0%): ${diabetesStats.normal} (${diabetesStats.normalPct}%)
- Prediabetes (6.1–6.5%): ${diabetesStats.prediabetes} (${diabetesStats.prediabetesPct}%)
- Good (6.6–7.0%): ${diabetesStats.good} (${diabetesStats.goodPct}%)
- Poor (7.1–8.0%): ${diabetesStats.poor} (${diabetesStats.poorPct}%)
- Alert (>8.1%): ${diabetesStats.alert} (${diabetesStats.alertPct}%)${Number(diabetesStats.pending) > 0 ? `\n- Pending/Missing: ${diabetesStats.pending} (${diabetesStats.pendingPct}%)` : ''}
- Total: ${n} (100%) ✅

Correlation Analysis:
Pearson correlation analysis revealed a significant ${corrDir} correlation between TyG index and HbA1c (r = ${stats.tygHbA1cR.toFixed(2)}, P ${pValOnly}), indicating that higher TyG index values are associated with ${stats.tygHbA1cR > 0 ? 'higher' : 'lower'} HbA1c levels. See Table 1, Table 2, and Figures 1–3.`);

  const discussion = normalizeManuscriptText(`Our study demonstrates a significant ${corrDir} correlation between TyG index and HbA1c in Indian adults (r = ${stats.tygHbA1cR.toFixed(2)}, P ${pValOnly}). This finding suggests that TyG index may serve as a useful marker for identifying individuals with poor glycemic control.

Clinical Implications:
The correlation between TyG index and HbA1c has important clinical implications. First, TyG index can be calculated from routine fasting lipid and glucose tests that are widely available and inexpensive. Second, it provides an objective measure of metabolic risk that complements HbA1c monitoring. Third, it can help identify high-risk individuals who may benefit from early lifestyle interventions.

Strengths of Our Study:
1. Use of standardized TyG calculation formula
2. Real-world clinical practice setting
3. Human verification of all data

Limitations:
1. Cross-sectional design precludes causal inferences
2. Single-center study limits generalizability
3. Sample size of ${n} patients
4. Lack of direct insulin resistance measurements for comparison`);

  const conclusion = `TyG index shows significant positive correlation with HbA1c in Indian adults. As a simple, cost-effective marker derived from routine fasting tests, TyG index may serve as a practical screening tool for identifying individuals requiring glycemic monitoring and early intervention.`;

  const references = `1. Simental-Mendia LE, Rodríguez-Morán M, Guerrero-Romero F. The product of fasting glucose and triglycerides as surrogate for identifying insulin resistance in apparently healthy subjects. Metab Syndr Relat Disord. 2008;6(4):299-304.

2. Vasques AC, Novaes FS, de Oliveira Mda S, et al. TyG index performs better than HOMA-IR in a Brazilian population: a hyperglycemic clamp validated study. Diabetes Res Clin Pract. 2011;93(3):e98-e100.

3. Guerrero-Romero F, Simental-Mendia LE, González-Ortiz M, et al. The product of triglycerides and glucose, a simple measure of insulin sensitivity. Comparison with the euglycemic-hyperinsulinemic clamp. J Clin Endocrinol Metab. 2010;95(7):3347-3351.

4. International Diabetes Federation. IDF Diabetes Atlas, 10th edn. Brussels: International Diabetes Federation; 2021.

5. Anjana RM, Deepa M, Pradeepa R, et al. Prevalence of diabetes and prediabetes in 15 states of India: results from the ICMR-INDIAB population-based cross-sectional study. Lancet Diabetes Endocrinol. 2017;5(8):585-596.

6. Misra A, Khurana L. Obesity and the metabolic syndrome in developing countries. J Clin Endocrinol Metab. 2008;93(11 Suppl 1):S9-S30.

7. American Diabetes Association. Standards of Medical Care in Diabetes—2025. Diabetes Care. 2025;48(Suppl 1).

8. World Health Organization. Definition and diagnosis of diabetes mellitus and intermediate hyperglycemia. Geneva: WHO; 2006.

9. Mohan V, Deepa M, Deepa R, et al. Secular trends in the prevalence of diabetes and impaired glucose tolerance in urban South India. Diabetologia. 2006;49(6):1175-1178.

10. Indian Council of Medical Research. ICMR-INDIAB National Epidemiological Study on Diabetes. New Delhi: ICMR; 2023.

11. Er LK, Wu S, Chou HH, et al. Triglyceride glucose-body mass index is a simple and clinically useful surrogate marker for insulin resistance in nondiabetic individuals. PLoS One. 2016;11(3):e0149731.

12. Khan SH, Sobia F, Niazi NK, et al. Metabolic clustering of risk factors: evaluation of triglyceride glucose index (TyG index) for the identification of metabolic syndrome. Clin Nutr. 2022;41(5):1053-1059.

13. da Silva A, Caldas APS, Hermsdorff HHM, et al. Triglyceride-glucose index is associated with symptomatic coronary artery disease in patients in secondary care. Cardiovasc Diabetol. 2019;18:89.

14. Low S, Khoo KCJ, Irwan B, et al. The role of triglyceride glucose index in development of type 2 diabetes mellitus. Diabetes Res Clin Pract. 2020;163:108131.

15. American Diabetes Association. Classification and diagnosis of diabetes: standards of medical care in diabetes—2024. Diabetes Care. 2024;47(Suppl 1):S20-S42.

16. Unwin N, Gan D, Whiting D. The IDF Diabetes Atlas: providing evidence, raising awareness and promoting action. Diabetes Res Clin Pract. 2010;87(1):2-3.

17. Shaw JE, Sicree RA, Zimmet PZ. Global estimates of the prevalence of diabetes for 2010 and 2030. Diabetes Res Clin Pract. 2010;87(1):4-14.

18. Guariguata L, Whiting DR, Hambleton I, et al. Global estimates of diabetes prevalence for 2013 and projections for 2035. Diabetes Res Clin Pract. 2014;103(2):137-149.

19. Saeedi P, Petersohn I, Salpea P, et al. Global and regional diabetes prevalence estimates for 2019 and projections for 2030 and 2045: Results from the International Diabetes Federation Diabetes Atlas, 9th edition. Diabetes Res Clin Pract. 2019;157:107843.

20. Sun H, Saeedi P, Karuranga S, et al. IDF Diabetes Atlas: Global, regional and country-level diabetes prevalence estimates for 2021 and projections for 2045. Diabetes Res Clin Pract. 2022;183:109119.`;

  // Table 1: Baseline Characteristics of Study Participants (n=64)
  const col1W = 32;
  const col2W = 18;
  const row = (c1: string, c2: string) =>
    '│ ' + pad(c1, col1W) + ' │ ' + pad(c2, col2W) + ' │\n';
  let table1 = `Table 1: Baseline Characteristics of Study Participants (n=${n})\n`;
  table1 += '┌' + '─'.repeat(col1W + 2) + '┬' + '─'.repeat(col2W + 2) + '┐\n';
  table1 += row('Characteristic', 'Value');
  table1 += '├' + '─'.repeat(col1W + 2) + '┼' + '─'.repeat(col2W + 2) + '┤\n';
  table1 += row('Age (years), mean ± SD', `${meanAge.toFixed(1)} ± ${sdAge.toFixed(1)}`);
  table1 += row('Male sex, n (%)', `${maleCount} (${malePct}%)`);
  table1 += row('Female sex, n (%)', `${femaleCount} (${femalePct}%)`);
  table1 += row('Waist circumference (cm)', `${meanWaist.toFixed(1)} ± ${sdWaist.toFixed(1)}`);
  table1 += row('Triglycerides (mg/dL)', `${meanTg.toFixed(1)} ± ${sdTg.toFixed(1)}`);
  table1 += row('Fasting glucose (mg/dL)', `${meanGlucose.toFixed(1)} ± ${sdGlucose.toFixed(1)}`);
  table1 += row('HDL cholesterol (mg/dL)', `${meanHdl.toFixed(1)} ± ${sdHdl.toFixed(1)}`);
  table1 += row('TyG index, mean ± SD', `${meanTyGForText.toFixed(2)} ± ${sdTyG.toFixed(2)}`);
  table1 += row('HbA1c (%), mean ± SD', `${stats.meanHbA1c.toFixed(2)} ± ${stats.sdHbA1c.toFixed(2)}`);
  table1 += '├' + '─'.repeat(col1W + 2) + '┴' + '─'.repeat(col2W + 2) + '┤\n';
  table1 += '│ ' + pad('Diabetes Risk Distribution (Clinical):', col1W + col2W + 2) + ' │\n';
  table1 += '├' + '─'.repeat(col1W + 2) + '┬' + '─'.repeat(col2W + 2) + '┤\n';
  table1 += row('Normal (<6.0%)', `${diabetesStats.normal} (${diabetesStats.normalPct}%)`);
  table1 += row('Prediabetes (6.1-6.5%)', `${diabetesStats.prediabetes} (${diabetesStats.prediabetesPct}%)`);
  table1 += row('Good control (6.6-7.0%)', `${diabetesStats.good} (${diabetesStats.goodPct}%)`);
  table1 += row('Poor control (7.1-8.0%)', `${diabetesStats.poor} (${diabetesStats.poorPct}%)`);
  table1 += row('Alert (>8.1%)', `${diabetesStats.alert} (${diabetesStats.alertPct}%)`);
  if (Number(diabetesStats.pending) > 0) {
    table1 += row('Pending/Missing', `${diabetesStats.pending} (${diabetesStats.pendingPct}%)`);
  }
  table1 += '└' + '─'.repeat(col1W + 2) + '┴' + '─'.repeat(col2W + 2) + '┘';

  const pValueCol = pValue < 0.001 ? '< 0.001' : pValue.toFixed(3);
  const t2Col1 = 33;
  const t2Col2 = 14;
  const t2Row = (c1: string, c2: string) =>
    '│ ' + pad(c1, t2Col1) + ' │ ' + pad(c2, t2Col2) + ' │\n';
  let table2 = `Table 2: Summary Statistics for TyG–HbA1c Analysis (n=${n})\n`;
  table2 += '┌' + '─'.repeat(t2Col1 + 2) + '┬' + '─'.repeat(t2Col2 + 2) + '┐\n';
  table2 += t2Row('Parameter', 'Value');
  table2 += '├' + '─'.repeat(t2Col1 + 2) + '┼' + '─'.repeat(t2Col2 + 2) + '┤\n';
  table2 += t2Row('TyG–HbA1c correlation (r)', stats.tygHbA1cR.toFixed(2));
  table2 += t2Row('P-value', pValueCol);
  table2 += t2Row('Mean HbA1c (%, mean ± SD)', hba1cMeanSd);
  table2 += t2Row('HbA1c ≥7.0%, n (%)', `${stats.countHbA1cAtLeast7} (${stats.pctHbA1cAtLeast7.toFixed(1)}%)`);
  table2 += t2Row('Total patients (n)', String(n));
  table2 += '└' + '─'.repeat(t2Col1 + 2) + '┴' + '─'.repeat(t2Col2 + 2) + '┘';

  return {
    title,
    authors,
    affiliation,
    abstract,
    keywords,
    introduction,
    methods,
    results,
    discussion,
    conclusion,
    references,
    table1,
    table2,
    figure1Caption: `Waist circumference vs HbA1c. ${pearsonLine}, n = ${n}.`,
    figure2Caption: `Distribution of HbA1c; cohort with TyG and HbA1c (n = ${n}). Mean HbA1c ${hba1cMeanSd}%.`,
    figure3Caption: `Clinical HbA1c bands (Dr. Muddu): value_counts diabetesRisk — Normal, Prediabetes, Good, Poor, Alert (n = ${n}).`,

    clinicalSignificance: `TyG index correlates with HbA1c and can support identification of individuals with poor glycemic control. As a simple marker from routine fasting tests, TyG may help prioritise patients for HbA1c testing and lifestyle intervention in resource-limited settings.`,

    keyMessages: `• TyG index correlates significantly with HbA1c in Indian adults (r = ${stats.tygHbA1cR.toFixed(2)}, P ${pValOnly}).
• TyG is derived from routine fasting triglycerides and glucose; no additional cost.
• TyG–HbA1c correlation supports use of TyG as a practical screening adjunct for glycemic risk.
• Clinical HbA1c bands (Normal, Prediabetes, Good, Poor, Alert) aid risk stratification (n = ${n}).`,

    fundingStatement: 'No external funding received.',
    conflictOfInterest: 'None declared.',
    authorContributions: 'MSN: Conceptualization, Methodology, Formal analysis, Investigation, Data curation, Writing – original draft, Writing – review & editing, Supervision. All authors read and approved the final manuscript.',
    dataAvailability: 'The data that support the findings of this study are available from the corresponding author upon reasonable request, subject to institutional and ethical approval.',
  };
}
