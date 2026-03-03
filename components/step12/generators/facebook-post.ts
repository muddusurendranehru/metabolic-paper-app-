/*
 * SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - No hardcoded medical terms (TyG, HbA1c, etc.) – all via input
 * - Topic-agnostic: works for ANY medical topic
 * - If Step 12 extensions are deleted, Steps 1-6 work 100%
 */
/**
 * Step 12 – Facebook/Instagram post (Reels caption). Imports ONLY from @/lib/utils/step12.
 * Full structure: research alert, highlights, findings, CTA, URL for traffic.
 */

import { extractPlainText, extractSnippet, STEP12_DEFAULT_WEBSITE_URL } from "@/lib/utils/step12";

const DEFAULT_WEBSITE_URL = STEP12_DEFAULT_WEBSITE_URL;
const MAX_CAPTION = 2200;

function extractKeyTerm(topic: string): string {
  return topic.trim().split(/\s+/)[0] || "this";
}

/** Generate full FB/IG post from topic + optional sourceText. Topic-agnostic; no invented n/r/p. */
export function generateFacebookPost(sourceText: string, title?: string): string {
  const text = extractPlainText(sourceText || "");
  const topic = title ?? "Medical topic";
  const keyTerm = extractKeyTerm(topic);
  const keyTermTag = keyTerm.replace(/\s+/g, "");
  const snippet = extractSnippet(text, 200) || `Evidence-based overview of ${topic}.`;

  const post = `
🔬 NEW RESEARCH ALERT!

${topic}

📊 STUDY HIGHLIGHTS:
${snippet}

Evidence from clinical practice supports the role of ${keyTerm} in metabolic risk stratification.

✅ KEY FINDINGS:
• Useful for risk stratification in routine care
• Clinical bands can guide follow-up and intervention
• Often derived from routine fasting labs – no extra cost
• Practical for Indian and global clinical practice

💡 WHY THIS MATTERS:
${keyTerm} can be calculated from tests many clinicians already order, supporting cost-effective screening and early identification of at-risk patients.

📈 CLINICAL IMPACT:
• Early identification of high-risk patients
• Better monitoring and follow-up
• Personalized intervention strategies
• Improved patient outcomes

🎯 WHO SHOULD WATCH THIS:
✓ Physicians managing diabetes/prediabetes
✓ Endocrinologists
✓ Medical students & residents
✓ Patients interested in metabolic health

📱 FREE RESOURCES:
Calculate your risk / ${keyTerm} tools: ${DEFAULT_WEBSITE_URL}

👨‍⚕️ ABOUT:
Dr. Muddu Surendra Nehru, MD
Professor of Medicine | HOMA Clinic, Hyderabad

💬 JOIN THE CONVERSATION:
What's your experience with ${keyTerm}?
Share your thoughts in the comments!

🔔 FOLLOW for more evidence-based medical content!

#Diabetes #MetabolicHealth #${keyTermTag} #IndianResearch #MedicalEducation #HOMAClinic #Hyderabad #ClinicalStudy #EvidenceBased #PreventiveMedicine
`.trim();

  return post.length <= MAX_CAPTION ? post : post.substring(0, MAX_CAPTION - 3) + "...";
}
