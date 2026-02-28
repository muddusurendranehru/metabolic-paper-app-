/**
 * Step 9: Medical Education – MCQ bank and Gamma slides.
 * Input: Published paper details. No patientData. No imports from step-1 to step-6.
 */

export type MCQCategory = "Basic" | "Application" | "Analysis" | "Clinical" | "Interpretation";

export interface MCQItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  category: MCQCategory;
}

export interface Step9PaperMeta {
  title: string;
  abstract: string;
  keyFinding: string;
  rValue: string;
  pValue: string;
  n: string;
  journal: string;
  location: string;
}

export const DEFAULT_STEP9_META: Step9PaperMeta = {
  title: "TyG Index and HbA1c for ADA 2026 Diabetes Risk Stratification",
  abstract: "Objective: To evaluate TyG index and HbA1c for diabetes risk stratification. Methods: Cross-sectional study at HOMA Clinic. Results: n=75, mean TyG 9.08, mean HbA1c 6.92. Correlation r=0.46, p<0.001. Conclusion: TyG-HbA1c supports risk stratification.",
  keyFinding: "TyG index correlated with HbA1c (r=0.46, p<0.001). Five clinical bands: Normal, Prediabetes, Good, Poor, Alert.",
  rValue: "0.46",
  pValue: "0.001",
  n: "75",
  journal: "IJCR / JCDR 2026",
  location: "HOMA Clinic, Hyderabad",
};

/** Generate 10 MCQs: 2 per category (Basic, Application, Analysis, Clinical, Interpretation). */
export function generateMCQBank(meta: Step9PaperMeta): MCQItem[] {
  const { title, abstract, keyFinding, rValue, pValue, n, journal, location } = meta;
  return [
    // Basic (2)
    {
      category: "Basic",
      question: "What does TyG index stand for?",
      options: ["Triglyceride-Glucose index", "Tyrosine-Glucagon index", "Total-Glycemic index", "Thyroid-Glucose index"],
      correctIndex: 0,
      explanation: "TyG = Triglyceride-Glucose index, calculated from fasting TG and glucose.",
    },
    {
      category: "Basic",
      question: "What was the primary outcome in this study?",
      options: ["TyG index", "HbA1c", "Correlation between TyG and HbA1c", "Waist circumference only"],
      correctIndex: 2,
      explanation: "The study evaluated the correlation between TyG index and HbA1c.",
    },
    // Application (2)
    {
      category: "Application",
      question: "How is TyG index calculated?",
      options: ["TG × glucose", "ln(TG × glucose / 2)", "TG + glucose", "HbA1c × TG"],
      correctIndex: 1,
      explanation: "TyG = ln(fasting triglycerides × fasting glucose / 2).",
    },
    {
      category: "Application",
      question: "What sample size (n) was reported in this paper?",
      options: ["60", "64", n, "100"],
      correctIndex: 2,
      explanation: `This study included n = ${n} patients with complete TyG and HbA1c.`,
    },
    // Analysis (2)
    {
      category: "Analysis",
      question: "What correlation (r) was reported between TyG and HbA1c?",
      options: ["r = 0.12", `r = ${rValue}`, "r = 0.80", "r = 0.05"],
      correctIndex: 1,
      explanation: `Pearson correlation r = ${rValue}, p < ${pValue} (significant positive correlation).`,
    },
    {
      category: "Analysis",
      question: "Which clinical HbA1c bands were used for risk stratification?",
      options: ["ADA only", "Dr. Muddu bands: Normal, Prediabetes, Good, Poor, Alert", "WHO only", "Single cutoff ≥7%"],
      correctIndex: 1,
      explanation: "Dr. Muddu clinical bands: Normal <6.0%, Prediabetes 6.1–6.5%, Good 6.6–7.0%, Poor 7.1–8.0%, Alert >8.1%.",
    },
    // Clinical (2)
    {
      category: "Clinical",
      question: "What is the main clinical implication of this study?",
      options: ["TyG replaces HbA1c", "TyG can support diabetes risk screening using routine fasting labs", "HbA1c is obsolete", "Only useful in research"],
      correctIndex: 1,
      explanation: keyFinding,
    },
    {
      category: "Clinical",
      question: "Where was this study conducted?",
      options: [location, "Multiple centers", "National survey", "International cohort"],
      correctIndex: 0,
      explanation: `Single-center study at ${location}.`,
    },
    // Interpretation (2)
    {
      category: "Interpretation",
      question: "How would you interpret r = 0.46 and p < 0.001?",
      options: ["No association", "Moderate positive correlation, highly significant", "Strong negative correlation", "Weak, not significant"],
      correctIndex: 1,
      explanation: "Moderate positive correlation; p < 0.001 indicates high statistical significance.",
    },
    {
      category: "Interpretation",
      question: "What should clinicians do with these findings?",
      options: ["Ignore TyG", "Consider TyG alongside HbA1c for metabolic risk stratification in resource-limited settings", "Replace all HbA1c tests with TyG", "Use only in research"],
      correctIndex: 1,
      explanation: "TyG is a practical, cost-effective adjunct to HbA1c for screening.",
    },
  ];
}

/** Generate 5-slide Markdown for Gamma.app. */
export function generateGammaSlidesMarkdown(meta: Step9PaperMeta): string {
  const { title, abstract, keyFinding, rValue, pValue, n, journal, location } = meta;
  return `# ${title}

---
## Slide 1: Title
**${title}**
${journal} | n = ${n} | ${location}

---
## Slide 2: Background
- TyG index = ln(TG × glucose / 2)
- HbA1c = gold standard for glycemic control
- Need: simple, cost-effective risk stratification in Indian adults

---
## Slide 3: Methods & Sample
- Cross-sectional study
- Setting: ${location}
- Inclusion: Adults with TyG and HbA1c
- n = ${n} patients

---
## Slide 4: Key Results
- **Correlation:** TyG–HbA1c r = ${rValue}, p < ${pValue}
- **Clinical bands:** Normal, Prediabetes, Good, Poor, Alert
- ${keyFinding}

---
## Slide 5: Conclusion & Takeaway
- TyG correlates significantly with HbA1c
- Practical screening tool from routine fasting labs
- Implications for metabolic risk stratification in resource-limited settings
`;
}

/** CME 10-slide template placeholders. All local state; no patientData. */
export interface Step9CMEMeta {
  topicTitle: string;
  authorName: string;
  credentials: string;
  clinicName: string;
  location: string;
  date: string;
  keyTerm: string;
  clinicalImplication: string;
  intervention: string;
  assessmentParameter1: string;
  assessmentParameter2: string;
  labTest1: string;
  labTest2: string;
  labTest3: string;
  keyIndex: string;
  formula: string;
  normalRange: string;
  elevatedThreshold: string;
  clinicalMeaning: string;
  riskLevel1: string;
  range1: string;
  action1: string;
  riskLevel2: string;
  range2: string;
  action2: string;
  riskLevel3: string;
  range3: string;
  action3: string;
  dietRecommendation: string;
  exerciseRecommendation: string;
  weightLossTarget: string;
  drug1: string;
  indication1: string;
  drug2: string;
  indication2: string;
  drug3: string;
  indication3: string;
  age: string;
  sex: string;
  keyParameter1: string;
  value1: string;
  keyParameter2: string;
  value2: string;
  keyTakeaway1: string;
  keyTakeaway2: string;
  websiteUrl: string;
  clinicInfo: string;
}

export const DEFAULT_CME_META: Step9CMEMeta = {
  topicTitle: "TyG Index and HbA1c for Diabetes Risk Stratification",
  authorName: "Dr. Muddu Surendra Nehru",
  credentials: "M.D., Professor of Medicine",
  clinicName: "HOMA Clinic",
  location: "Hyderabad",
  date: new Date().toISOString().slice(0, 10),
  keyTerm: "TyG index",
  clinicalImplication: "insulin resistance and metabolic risk",
  intervention: "TyG-HbA1c risk bands",
  assessmentParameter1: "Waist circumference",
  assessmentParameter2: "Age, Sex, Family History",
  labTest1: "Fasting Blood Sugar",
  labTest2: "Lipid Profile",
  labTest3: "HbA1c, Fasting Insulin",
  keyIndex: "TyG",
  formula: "ln(TG × glucose / 2)",
  normalRange: "< 8.5",
  elevatedThreshold: "≥ 8.5",
  clinicalMeaning: "higher metabolic risk",
  riskLevel1: "Normal",
  range1: "TyG < 8.5",
  action1: "Lifestyle advice, annual follow-up",
  riskLevel2: "Elevated",
  range2: "TyG 8.5–9.5",
  action2: "Intensify lifestyle, consider HbA1c",
  riskLevel3: "High",
  range3: "TyG > 9.5",
  action3: "HbA1c, pharmacologic if indicated",
  dietRecommendation: "Low GI, portion control, reduce refined carbs",
  exerciseRecommendation: "150 min/week moderate activity",
  weightLossTarget: "5–10% if overweight",
  drug1: "Metformin",
  indication1: "Prediabetes / high risk",
  drug2: "SGLT2i",
  indication2: "Cardiorenal protection when indicated",
  drug3: "GLP-1 RA",
  indication3: "Weight + glycemic control when indicated",
  age: "45",
  sex: "M",
  keyParameter1: "TyG",
  value1: "9.2",
  keyParameter2: "HbA1c",
  value2: "6.8%",
  keyTakeaway1: "TyG from routine fasting labs supports risk stratification.",
  keyTakeaway2: "Combine TyG with HbA1c for clinical bands and treatment decisions.",
  websiteUrl: "www.homahealthcarecenter.in",
  clinicInfo: "HOMA Clinic, Hyderabad | 09963721999",
};

/** Generate 10-slide CME Markdown from template. */
export function generateCMESlidesMarkdown(cme: Step9CMEMeta): string {
  return `# ${cme.topicTitle}
${cme.authorName} | ${cme.clinicName}
Date: ${cme.date} | CME Credit: 1 Hour

## Slide 1: Title
- "${cme.topicTitle}"
- ${cme.authorName}, ${cme.credentials}
- ${cme.clinicName}, ${cme.location}
- [Visual: Clinic logo + topic icon]

## Slide 2: Learning Objectives
- Define ${cme.keyTerm} and normal range
- Interpret elevated ${cme.keyTerm} as ${cme.clinicalImplication}
- Apply ${cme.intervention} in clinical risk stratification
- Prescribe lifestyle + pharmacologic interventions

## Slide 3: Step 1 – Patient Assessment
- ${cme.assessmentParameter1} (e.g., Waist circumference)
- ${cme.assessmentParameter2} (e.g., Age, Sex, Family History)
- [Visual: Assessment checklist template]

## Slide 4: Step 2 – Key Lab Tests
- ${cme.labTest1} (e.g., Fasting Blood Sugar)
- ${cme.labTest2} (e.g., Lipid Profile)
- ${cme.labTest3} (e.g., HbA1c, Fasting Insulin)
- [Visual: Lab order form template]

## Slide 5: Step 3 – ${cme.keyIndex} Calculator (Live Demo)
- Formula: ${cme.formula}
- Normal: ${cme.normalRange} | Elevated: ${cme.elevatedThreshold} = ${cme.clinicalMeaning}
- [Interactive: Embed calculator link]
- [Visual: Calculation example with patient data]

## Slide 6: Step 5 – Interpretation & Risk Stratification
- ${cme.riskLevel1}: ${cme.range1} → ${cme.action1}
- ${cme.riskLevel2}: ${cme.range2} → ${cme.action2}
- ${cme.riskLevel3}: ${cme.range3} → ${cme.action3}
- [Visual: Risk pyramid chart]

## Slide 7: Step 6a – Lifestyle Modification
- Diet: ${cme.dietRecommendation}
- Exercise: ${cme.exerciseRecommendation}
- Weight loss: ${cme.weightLossTarget}
- Sleep, stress management
- [Visual: Lifestyle prescription pad]

## Slide 8: Step 6b – Pharmacologic Options
- ${cme.drug1}: ${cme.indication1}
- ${cme.drug2}: ${cme.indication2}
- ${cme.drug3}: ${cme.indication3}
- [Visual: Treatment algorithm flowchart]

## Slide 9: Case Study (Anonymized)
- Patient: ${cme.age}${cme.sex}, ${cme.keyParameter1} ${cme.value1}, ${cme.keyParameter2} ${cme.value2}
- Assessment → Labs → ${cme.keyIndex} calc → Risk → Treatment
- [Visual: Case timeline]

## Slide 10: Key Takeaways + Resources
- ${cme.keyTakeaway1}
- ${cme.keyTakeaway2}
- Free calculator: ${cme.websiteUrl}
- Download patient handouts
- CME quiz link
- Contact: ${cme.clinicInfo}
`;
}
