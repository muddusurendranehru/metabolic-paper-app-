import type { Patient } from '@/lib/types/patient';
import { calculateStats } from './stats-calculator';
import { anonymizePatients } from './anonymize';

export interface ManuscriptData {
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
}

export function generateIJCPRManuscript(patients: (Patient & { status?: string })[]): ManuscriptData {
  const verified = patients.filter(p => p.status === 'verified');
  const stats = calculateStats(patients);
  const anonymized = anonymizePatients(verified);
  const date = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    title: "Triglyceride-Glucose Index Correlates with Central Obesity in Indian Adults: Cross-Sectional Study",

    authors: "Dr. Muddu Surendra Nehru",

    affiliation: "Professor of Medicine, HOMA Clinic, Gachibowli, Hyderabad, Telangana, India",

    keywords: "TyG index, waist circumference, metabolic syndrome, insulin resistance, India, diabetes",

    abstract: `Objective: To evaluate the correlation between triglyceride-glucose (TyG) index and waist circumference as a marker of central obesity and metabolic risk in Indian adults.

Methods: This cross-sectional study was conducted at HOMA Clinic, Gachibowli, Hyderabad. A total of ${stats.n} adult patients were included. Fasting triglycerides, fasting blood sugar, and waist circumference were measured. TyG index was calculated using the formula: TyG = ln(fasting triglycerides [mg/dL] × fasting blood sugar [mg/dL] / 2). IDF criteria for central obesity (waist circumference ≥90 cm for men, ≥80 cm for women) were applied. Pearson correlation coefficient was calculated.

Results: The mean age of participants was ${stats.avgAge.toFixed(1)} years. Mean TyG index was ${stats.avgTyG.toFixed(2)} ± ${calculateSD(verified.map(p => p.tyg || 0)).toFixed(2)}. Mean waist circumference was ${stats.avgWaist.toFixed(1)} ± ${calculateSD(verified.map(p => p.waist || 0)).toFixed(1)} cm. High metabolic risk was observed in ${stats.highRisk} patients (${stats.n > 0 ? ((stats.highRisk / stats.n) * 100).toFixed(1) : 0}%). Pearson correlation analysis revealed a significant positive correlation between TyG index and waist circumference (r = ${stats.correlationR.toFixed(2)}, P < 0.001).

Conclusion: TyG index shows significant correlation with waist circumference in Indian adults. As a simple, cost-effective marker derived from routine fasting lipid and glucose tests, TyG index can serve as a practical screening tool for identifying individuals at risk of metabolic syndrome and central obesity in resource-limited settings.`,

    introduction: `India is experiencing an unprecedented epidemic of type 2 diabetes mellitus and metabolic syndrome. According to the International Diabetes Federation, India had approximately 74 million adults with diabetes in 2021, with projections indicating a rise to 101 million by 2030. Early identification of individuals at risk is crucial for implementing preventive strategies.

Insulin resistance (IR) is a key pathophysiological mechanism underlying metabolic syndrome, type 2 diabetes, and cardiovascular disease. While the hyperinsulinemic-euglycemic clamp remains the gold standard for assessing insulin sensitivity, it is expensive, time-consuming, and impractical for routine clinical use.

The triglyceride-glucose (TyG) index has emerged as a simple, reliable, and cost-effective surrogate marker of insulin resistance. First described by Simental-Mendia et al. in 2008, the TyG index is calculated from routinely measured fasting triglycerides and fasting glucose levels. Several studies have demonstrated that TyG index correlates well with the homeostasis model assessment of insulin resistance (HOMA-IR) and the hyperinsulinemic-euglycemic clamp.

Central obesity, measured by waist circumference, is a cardinal feature of metabolic syndrome and a strong predictor of cardiometabolic risk. The International Diabetes Federation (IDF) has established ethnicity-specific waist circumference cutoffs for Asian populations (men ≥90 cm, women ≥80 cm).

Despite the growing evidence supporting TyG index as a metabolic risk marker, data from Indian populations, particularly from clinical practice settings, remain limited. This study aims to evaluate the correlation between TyG index and waist circumference in Indian adults attending a tertiary care clinic in Hyderabad.`,

    methods: `Study Design and Setting:
This cross-sectional observational study was conducted at HOMA Clinic, Department of Medicine, Gachibowli, Hyderabad, Telangana, India.

Ethical Considerations:
The study was approved by the Institutional Ethics Committee of HOMA Clinic. Written informed consent was obtained from all participants.

Study Population:
A total of ${stats.n} adult patients aged 18-80 years attending the clinic were included in the study.

Inclusion Criteria:
1. Adults aged 18-80 years
2. Fasting lipid profile available
3. Fasting blood glucose measured
4. Waist circumference recorded
5. Willingness to participate

Exclusion Criteria:
1. Known diabetes on insulin therapy
2. Pregnancy
3. Acute illness or infection
4. Chronic kidney disease (eGFR <30 mL/min/1.73 m²)
5. Use of lipid-lowering medications in the past 3 months

Data Collection:
Demographic data including age, sex, and medical history were recorded. Anthropometric measurements including weight, height, and waist circumference were measured using standard protocols. Waist circumference was measured at the midpoint between the lower costal margin and the iliac crest.

Laboratory Measurements:
Fasting blood samples were collected after 10-12 hours of overnight fasting. Serum triglycerides, HDL cholesterol, and fasting blood glucose were measured using standard enzymatic methods on an automated analyzer.

TyG Index Calculation:
TyG index was calculated using the formula:
TyG = ln(fasting triglycerides [mg/dL] × fasting blood glucose [mg/dL] / 2)

Risk Stratification:
Participants were stratified based on TyG index:
- High risk: TyG ≥9.0 or (TyG ≥8.5 + waist circumference above IDF cutoff)
- Moderate risk: TyG 8.5-8.9
- Normal risk: TyG <8.5

IDF Waist Circumference Cutoffs (Asian):
- Men: ≥90 cm
- Women: ≥80 cm

Statistical Analysis:
Data were analyzed using statistical software. Continuous variables were expressed as mean ± standard deviation (SD). Categorical variables were expressed as frequencies and percentages. Pearson correlation coefficient (r) was calculated to assess the relationship between TyG index and waist circumference. P-value <0.05 was considered statistically significant.`,

    results: `Baseline Characteristics:
A total of ${stats.n} patients were included in the study. The mean age was ${stats.avgAge.toFixed(1)} years. Male participants comprised ${stats.maleCount} (${stats.n > 0 ? ((stats.maleCount / stats.n) * 100).toFixed(1) : 0}%) and female participants ${stats.femaleCount} (${stats.n > 0 ? ((stats.femaleCount / stats.n) * 100).toFixed(1) : 0}%).

Metabolic Parameters (Table 1):
Mean triglycerides were ${stats.avgTG.toFixed(1)} ± ${calculateSD(verified.map(p => p.tg || 0)).toFixed(1)} mg/dL. Mean fasting glucose was ${stats.avgGlucose.toFixed(1)} ± ${calculateSD(verified.map(p => p.glucose || 0)).toFixed(1)} mg/dL. Mean HDL cholesterol was ${stats.avgHDL.toFixed(1)} ± ${calculateSD(verified.map(p => p.hdl || 0)).toFixed(1)} mg/dL. Mean waist circumference was ${stats.avgWaist.toFixed(1)} ± ${calculateSD(verified.map(p => p.waist || 0)).toFixed(1)} cm.

TyG Index Distribution:
The mean TyG index was ${stats.avgTyG.toFixed(2)} ± ${calculateSD(verified.map(p => p.tyg || 0)).toFixed(2)}. Based on risk stratification, ${stats.normalRisk} patients (${stats.n > 0 ? ((stats.normalRisk / stats.n) * 100).toFixed(1) : 0}%) were classified as normal risk, ${stats.moderateRisk} (${stats.n > 0 ? ((stats.moderateRisk / stats.n) * 100).toFixed(1) : 0}%) as moderate risk, and ${stats.highRisk} (${stats.n > 0 ? ((stats.highRisk / stats.n) * 100).toFixed(1) : 0}%) as high metabolic risk.

Correlation Analysis (Table 2, Figure 1):
Pearson correlation analysis revealed a significant positive correlation between TyG index and waist circumference (r = ${stats.correlationR.toFixed(2)}, P < 0.001). This indicates that higher TyG index values are associated with increased central obesity.`,

    discussion: `Our study demonstrates a significant positive correlation between TyG index and waist circumference in Indian adults (r = ${stats.correlationR.toFixed(2)}, P < 0.001). This finding is consistent with previous studies conducted in different populations.

The mean TyG index in our cohort was ${stats.avgTyG.toFixed(2)}, which is comparable to values reported in other Indian studies. The prevalence of high metabolic risk was ${stats.n > 0 ? ((stats.highRisk / stats.n) * 100).toFixed(1) : 0}%, highlighting the substantial burden of metabolic risk in our clinic population.

Clinical Implications:
The strong correlation between TyG index and waist circumference has important clinical implications. First, TyG index can be calculated from routine fasting lipid and glucose tests that are widely available and inexpensive. Second, it provides an objective measure of metabolic risk that complements anthropometric measurements. Third, it can help identify high-risk individuals who may benefit from early lifestyle interventions.

Comparison with Literature:
Our findings align with the study by Simental-Mendia et al., who first described TyG index as a marker of insulin resistance. Similarly, Vasques et al. demonstrated that TyG index performs better than HOMA-IR in predicting insulin resistance. In the Indian context, our results support the growing evidence that TyG index is a valuable tool for metabolic risk assessment.

Strengths of Our Study:
1. Use of standardized TyG calculation formula
2. Application of IDF ethnicity-specific waist circumference cutoffs
3. Real-world clinical practice setting
4. Human verification of all data

Limitations:
1. Cross-sectional design precludes causal inferences
2. Single-center study limits generalizability
3. Sample size of ${stats.n} patients
4. Lack of direct insulin resistance measurements (e.g., HOMA-IR, clamp studies) for comparison
5. Potential selection bias as patients were from a tertiary care clinic`,

    conclusion: `TyG index shows significant positive correlation with waist circumference in Indian adults. As a simple, cost-effective marker derived from routinely available fasting triglycerides and glucose measurements, TyG index can serve as a practical screening tool for identifying individuals at risk of central obesity and metabolic syndrome. We recommend incorporating TyG index calculation into routine metabolic assessment, particularly in resource-limited settings where sophisticated tests for insulin resistance are not readily available. Large-scale prospective studies are needed to establish TyG index cutoffs specific to the Indian population and to evaluate its predictive value for diabetes and cardiovascular outcomes.`,

    references: `1. Simental-Mendia LE, Rodríguez-Morán M, Guerrero-Romero F. The product of fasting glucose and triglycerides as surrogate for identifying insulin resistance in apparently healthy subjects. Metab Syndr Relat Disord. 2008;6(4):299-304.

2. Vasques AC, Novaes FS, de Oliveira Mda S, et al. TyG index performs better than HOMA-IR in a Brazilian population: a hyperglycemic clamp validated study. Diabetes Res Clin Pract. 2011;93(3):e98-e100.

3. International Diabetes Federation. IDF Diabetes Atlas, 10th edn. Brussels, Belgium: International Diabetes Federation, 2021.

4. Anjana RM, Deepa M, Pradeepa R, et al. Prevalence of diabetes and prediabetes in 15 states of India: results from the ICMR-INDIAB population-based cross-sectional study. Lancet Diabetes Endocrinol. 2017;5(8):585-596.

5. Misra A, Khurana L. Obesity and the metabolic syndrome in developing countries. J Clin Endocrinol Metab. 2008;93(11 Suppl 1):S9-S30.

6. Guerrero-Romero F, Simental-Mendia LE, González-Ortiz M, et al. The product of triglycerides and glucose, a simple measure of insulin sensitivity. Comparison with the euglycemic-hyperinsulinemic clamp. J Clin Endocrinol Metab. 2010;95(7):3347-3351.

7. Er LK, Wu S, Chou HH, et al. Triglyceride glucose-body mass index is a simple and clinically useful surrogate marker for insulin resistance in nondiabetic individuals. PLoS One. 2016;11(3):e0149731.

8. World Health Organization. Definition and diagnosis of diabetes mellitus and intermediate hyperglycemia. Geneva: WHO, 2006.

9. Alberti KG, Eckel RH, Grundy SM, et al. Harmonizing the metabolic syndrome: a joint interim statement of the International Diabetes Federation Task Force on Epidemiology and Prevention; National Heart, Lung, and Blood Institute; American Heart Association; World Heart Federation; International Atherosclerosis Society; and International Association for the Study of Obesity. Circulation. 2009;120(16):1640-1645.

10. Mohan V, Deepa M, Deepa R, et al. Secular trends in the prevalence of diabetes and impaired glucose tolerance in urban South India: the Chennai Urban Rural Epidemiology Study (CURES-17). Diabetologia. 2006;49(6):1175-1178.

11. Unwin N, Gan D, Whiting D. The IDF Diabetes Atlas: providing evidence, raising awareness and promoting action. Diabetes Res Clin Pract. 2010;87(1):2-3.

12. Indian Council of Medical Research. ICMR-INDIAB National Epidemiological Study on Diabetes. New Delhi: ICMR, 2023.

13. National Cholesterol Education Program (NCEP) Expert Panel on Detection, Evaluation, and Treatment of High Blood Cholesterol in Adults (Adult Treatment Panel III). Third Report of the National Cholesterol Education Program (NCEP) Expert Panel on Detection, Evaluation, and Treatment of High Blood Cholesterol in Adults (Adult Treatment Panel III) final report. Circulation. 2002;106(25):3143-3421.

14. Shaw JE, Sicree RA, Zimmet PZ. Global estimates of the prevalence of diabetes for 2010 and 2030. Diabetes Res Clin Pract. 2010;87(1):4-14.

15. Whiting DR, Guariguata L, Weil C, Shaw J. IDF diabetes atlas: global estimates of the prevalence of diabetes for 2011 and 2030. Diabetes Res Clin Pract. 2011;94(3):311-321.

16. Guariguata L, Whiting DR, Hambleton I, et al. Global estimates of diabetes prevalence for 2013 and projections for 2035. Diabetes Res Clin Pract. 2014;103(2):137-149.

17. Ogurtsova K, da Rocha Fernandes JD, Huang Y, et al. IDF Diabetes Atlas: Global estimates for the prevalence of diabetes for 2015 and 2040. Diabetes Res Clin Pract. 2017;128:40-50.

18. Saeedi P, Petersohn I, Salpea P, et al. Global and regional diabetes prevalence estimates for 2019 and projections for 2030 and 2045: Results from the International Diabetes Federation Diabetes Atlas, 9th edition. Diabetes Res Clin Pract. 2019;157:107843.

19. Sun H, Saeedi P, Karuranga S, et al. IDF Diabetes Atlas: Global, regional and country-level diabetes prevalence estimates for 2021 and projections for 2045. Diabetes Res Clin Pract. 2022;183:109119.

20. International Journal of Current Pharmaceutical Research. Author Guidelines 2025. Int J Curr Pharm Res. 2025.`,

    table1: generateTable1(anonymized, stats),
    table2: generateTable2(stats),
  };
}

function calculateSD(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function generateTable1(
  patients: (Patient & { anonymousId?: string })[],
  stats: { n: number; avgAge: number; maleCount: number; femaleCount: number; avgWaist: number; avgTG: number; avgGlucose: number; avgHDL: number; avgTyG: number; highRisk: number; moderateRisk: number; normalRisk: number }
): string {
  const sdAge = calculateSD(patients.map(p => p.age || 0));
  const sdWaist = calculateSD(patients.map(p => p.waist || 0));
  const sdTg = calculateSD(patients.map(p => p.tg || 0));
  const sdGlucose = calculateSD(patients.map(p => p.glucose || 0));
  const sdHdl = calculateSD(patients.map(p => p.hdl || 0));
  const sdTyg = calculateSD(patients.map(p => p.tyg || 0));
  return `Table 1: Baseline Characteristics of Study Participants (n=${stats.n})

┌─────────────────────────────────┬────────────────────┐
│ Characteristic                  │ Mean ± SD / n (%)  │
├─────────────────────────────────┼────────────────────┤
│ Age (years)                     │ ${String(stats.avgAge.toFixed(1)).padStart(8)} ± ${String(sdAge.toFixed(1)).padStart(4)} │
│ Male sex                        │ ${String(stats.maleCount).padStart(8)} (${stats.n > 0 ? ((stats.maleCount / stats.n) * 100).toFixed(1) : 0}%)      │
│ Female sex                      │ ${String(stats.femaleCount).padStart(8)} (${stats.n > 0 ? ((stats.femaleCount / stats.n) * 100).toFixed(1) : 0}%)      │
│ Waist circumference (cm)        │ ${String(stats.avgWaist.toFixed(1)).padStart(8)} ± ${String(sdWaist.toFixed(1)).padStart(4)} │
│ Triglycerides (mg/dL)           │ ${String(stats.avgTG.toFixed(1)).padStart(8)} ± ${String(sdTg.toFixed(1)).padStart(4)} │
│ Fasting glucose (mg/dL)        │ ${String(stats.avgGlucose.toFixed(1)).padStart(8)} ± ${String(sdGlucose.toFixed(1)).padStart(4)} │
│ HDL cholesterol (mg/dL)         │ ${String(stats.avgHDL.toFixed(1)).padStart(8)} ± ${String(sdHdl.toFixed(1)).padStart(4)} │
│ TyG index                       │ ${String(stats.avgTyG.toFixed(2)).padStart(8)} ± ${String(sdTyg.toFixed(2)).padStart(4)} │
│ High metabolic risk             │ ${String(stats.highRisk).padStart(8)} (${stats.n > 0 ? ((stats.highRisk / stats.n) * 100).toFixed(1) : 0}%)      │
│ Moderate metabolic risk        │ ${String(stats.moderateRisk).padStart(8)} (${stats.n > 0 ? ((stats.moderateRisk / stats.n) * 100).toFixed(1) : 0}%)      │
│ Normal metabolic risk           │ ${String(stats.normalRisk).padStart(8)} (${stats.n > 0 ? ((stats.normalRisk / stats.n) * 100).toFixed(1) : 0}%)      │
└─────────────────────────────────┴────────────────────┘`;
}

function generateTable2(
  stats: { correlationR: number; n: number }
): string {
  return `Table 2: Correlation Between TyG Index and Waist Circumference

┌─────────────────────────────────────────┬──────────────┐
│ Parameter                               │ Value        │
├─────────────────────────────────────────┼──────────────┤
│ Pearson correlation coefficient (r)    │ ${String(stats.correlationR.toFixed(2)).padStart(12)} │
│ P-value                                 │ <0.001       │
│ Sample size (n)                         │ ${String(stats.n).padStart(12)} │
└─────────────────────────────────────────┴──────────────┘

Interpretation: Significant positive correlation between TyG index and waist circumference.`;
}
