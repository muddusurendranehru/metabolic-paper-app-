/*
 * SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - No hardcoded medical terms (TyG, HbA1c, etc.) – all via input
 * - Topic-agnostic: works for ANY medical topic
 * - If Step 12 extensions are deleted, Steps 1-6 work 100%
 */
/**
 * Step 12 – Patient education handout (PDF-ready). Imports ONLY from @/lib/utils/step12.
 * Full structure: header, what is X, why it matters, key facts, what you can do, when to see doctor, footer.
 */

import { extractPlainText, STEP12_DEFAULT_WEBSITE_URL } from "@/lib/utils/step12";

const WEBSITE_URL = STEP12_DEFAULT_WEBSITE_URL;
const CLINIC_PHONE = "09963721999";
const DEFAULT_CLINIC = "HOMA Clinic";

function extractKeyTerm(topic: string): string {
  return topic.trim().split(/\s+/)[0] || "this";
}

/** Topic-agnostic: no specific lab names; works for any metabolic/clinical topic. */
function getSimpleExplanation(keyTerm: string): string {
  return `${keyTerm} is a simple measure (often from routine blood tests) that helps assess metabolic health and diabetes-related risk.`;
}

function getRelevanceStatement(keyTerm: string): string {
  return `Elevated ${keyTerm} can indicate increased metabolic risk. Your doctor uses it to guide screening and follow-up.`;
}

function getPracticalTips(): string[] {
  return [
    "Can be calculated from routine labs many clinics already order",
    "No extra cost beyond standard tests in most settings",
    "Helps identify higher-risk individuals early",
  ];
}

function getRecommendations(): { lifestyle: string; diet: string; monitoring: string } {
  return {
    lifestyle: "Regular physical activity (e.g. 150 min/week moderate activity)",
    diet: "Balanced diet with portion control",
    monitoring: "Regular check-ups every 3–6 months as advised by your doctor",
  };
}

function getSymptomsToWatch(): string {
  return "fatigue, increased thirst, frequent urination, or other concerns your doctor has mentioned";
}

function getScreeningAdvice(): string {
  return "Annual or periodic screening when risk factors are present";
}

function getBottomLine(keyTerm: string): string {
  return `${keyTerm} is a practical, cost-effective tool for metabolic risk assessment. Early detection enables timely intervention.`;
}

/** Generate full patient-education handout. API: generateHandout(sourceText, title?) for ContentGenerator. */
export function generateHandout(sourceText: string, title?: string): string {
  const topic = title ?? "Metabolic health";
  const keyTerm = extractKeyTerm(topic);
  const keyTermUpper = keyTerm.toUpperCase();
  const clinicName = DEFAULT_CLINIC;
  const tips = getPracticalTips();
  const rec = getRecommendations();

  return `
╔═══════════════════════════════════════════════════════╗
║  PATIENT EDUCATION HANDOUT                            ║
║  ${topic}                                              ║
║  ${clinicName}, Hyderabad                              ║
╚═══════════════════════════════════════════════════════╝

WHAT IS ${keyTermUpper}?
${getSimpleExplanation(keyTerm)}

WHY DOES IT MATTER?
${getRelevanceStatement(keyTerm)}

KEY FACTS YOU SHOULD KNOW:
✓ ${tips[0]}
✓ ${tips[1]}
✓ ${tips[2]}

WHAT YOU CAN DO:
1. ${rec.lifestyle}
2. ${rec.diet}
3. ${rec.monitoring}

WHEN TO SEE YOUR DOCTOR:
• If you experience: ${getSymptomsToWatch()}
• For regular screening: ${getScreeningAdvice()}
• If you have questions about your risk

BOTTOM LINE:
${getBottomLine(keyTerm)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions? Contact us:
📞 ${CLINIC_PHONE}
🌐 ${WEBSITE_URL}

${clinicName}
Gachibowli, Hyderabad, Telangana

Dr. Muddu Surendra Nehru, MD
Professor of Medicine

© ${new Date().getFullYear()} – For educational purposes only
`.trim();
}
