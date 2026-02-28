/** Step 8: Social media content – paper metadata and template generators. Patient names never revealed. */

import { redactPatientIdentifiersFromText } from "@/lib/utils/anonymize";

export interface Step8PaperMeta {
  title: string;
  abstract: string;
  keyFinding: string;
  rValue: string;
  pValue: string;
  n: string;
  location: string;
  journal: string;
  doi: string;
  design: string;
}

export const DEFAULT_META: Step8PaperMeta = {
  title: 'TyG Index and HbA1c for ADA 2026 Diabetes Risk Stratification',
  abstract: 'Objective: To evaluate TyG index and HbA1c for diabetes risk stratification. Methods: Cross-sectional study at HOMA Clinic. Results: n=74, mean TyG 9.02, mean HbA1c 6.9. Correlation r=0.46, p<0.001. Conclusion: TyG-HbA1c supports risk stratification.',
  keyFinding: 'TyG index correlated with HbA1c (r=0.46, p<0.001). Five clinical bands: Normal 35%, Prediabetes 29.7%, Good 9.5%, Poor 8.1%, Alert 17.6%.',
  rValue: '0.46',
  pValue: '0.001',
  n: '74',
  location: 'HOMA Clinic, Hyderabad',
  journal: 'IJCR 2026',
  doi: '10.61336/jccp/25-08-50',
  design: 'Cross-sectional',
};

function shortenTitle(title: string, maxChars: number = 200): string {
  if (title.length <= maxChars) return title;
  return title.slice(0, maxChars - 3) + '...';
}

export function generateTwitterThread(meta: Step8PaperMeta): string[] {
  const keyFindingSafe = redactPatientIdentifiersFromText(meta.keyFinding);
  const t = shortenTitle(meta.title, 200);
  const tweets = [
    `🆕 NEW PUBLICATION ALERT!\n${t}\nPublished: ${meta.journal}\nn = ${meta.n} patients | ${meta.location}\nThread 👇 #TyG #Diabetes #MetabolicHealth`,
    `❌ Problem: Traditional diabetes risk tests can be expensive and slow.\nCurrent gap: We needed a simple, cost-effective marker for Indian clinics.`,
    `🔬 What we did:\n• Study: ${meta.design} study\n• Setting: ${meta.location}\n• Measured: TyG index vs HbA1c, 5 clinical risk bands`,
    `📊 KEY FINDING:\n${keyFindingSafe}\np < ${meta.pValue} ✅ Highly significant!\nClinical relevance: TyG from routine fasting labs can support diabetes risk screening.`,
    `💡 What this means:\nDoctors can use TyG + HbA1c for risk stratification with no extra cost.\n📄 Full paper: ${meta.doi}\nQuestions? Comment below!\n#Diabetes #Metabolism #IndianResearch`,
  ];
  return tweets;
}

export function generateLinkedInPost(meta: Step8PaperMeta): string {
  return `Excited to share our latest research published in ${meta.journal}!

**${meta.title}**

**Background:**
Metabolic screening in resource-limited settings needs simple, cost-effective tools. The TyG index (triglycerides + glucose) offers a practical alternative to more expensive tests.

**Study Design:**
We analyzed ${meta.n} patients at ${meta.location}. ${meta.design} design. TyG index and HbA1c were measured; ADA 2026 risk bands applied.

**Key Findings:**
✅ ${redactPatientIdentifiersFromText(meta.keyFinding)}
✅ TyG-HbA1c correlation r = ${meta.rValue}, p < ${meta.pValue}
✅ Practical implications for routine metabolic screening in Indian healthcare

**Why This Matters:**
TyG index uses only routine fasting labs—no extra cost. Clinicians can stratify diabetes risk and target lifestyle intervention earlier.

**Grateful to:** My patients who participated, HOMA Clinic, and co-authors.

**Read the full paper:** ${meta.doi}

#MedicalResearch #Diabetes #TyGIndex #MetabolicHealth #IndianHealthcare`;
}

export function generateYouTubeScript(meta: Step8PaperMeta): string {
  return `[0-5s] HOOK:
Did you know a simple blood test can predict diabetes risk?

[5-15s] PROBLEM:
Traditional tests are expensive. Insulin testing costs ₹500+. But we found a FREE alternative!

[15-35s] SCIENCE:
We studied ${meta.n} patients in ${meta.location}.
TyG index (triglycerides + glucose) vs HbA1c: Strong correlation r = ${meta.rValue}! p < ${meta.pValue}
5 clinical bands: Normal → Alert.

[35-50s] SOLUTION:
Now doctors can screen insulin resistance with routine tests. No extra cost. Immediate results.

[50-60s] CTA:
Check your metabolic health at HOMA Clinic. Paper link in description. Subscribe for more metabolic health tips!`;
}

export function generateInfographicPrompts(meta: Step8PaperMeta): {
  canva: string;
  midjourney: string;
  dallE: string;
} {
  return {
    canva: `Create medical infographic. Title: "${shortenTitle(meta.title, 60)}". Layout: Vertical 1080x1350px. Sections: 1) Header: HOMA Clinic + NEW RESEARCH. 2) Key Finding: "${redactPatientIdentifiersFromText(meta.keyFinding).slice(0, 80)}..." r=${meta.rValue} p<${meta.pValue}. 3) Bar chart: 5 HbA1c bands. Colors: Green→Yellow→Blue→Orange→Red. 4) Sample: n=${meta.n} | ${meta.location}. 5) Footer: ${meta.journal} | ${meta.doi}. Style: Modern medical, clean. Fonts: Montserrat, Open Sans.`,
    midjourney: `/imagine a medical research infographic showing correlation between TyG index and HbA1c, modern minimalist design, bar charts in teal and coral, Indian patient data visualization, professional healthcare aesthetic, clean white background, medical icons, 16:9 --v 6 --style raw`,
    dallE: `Design a square social media graphic (1080x1080px) for a medical research publication. Show correlation between TyG index and HbA1c with r=${meta.rValue} prominently displayed. Title "TyG vs HbA1c: Indian Study", sample size n=${meta.n}, HOMA Clinic branding. Medical blue and white, modern professional style, suitable for LinkedIn/Instagram.`,
  };
}
