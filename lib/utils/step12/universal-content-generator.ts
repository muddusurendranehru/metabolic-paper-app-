/**
 * Step 12 – universal content generator. ANY topic, ANY supported language.
 * ISOLATED: Only imports from this folder (step12). No patientData; no steps 1–6.
 */

import { injectWebsiteLink } from "./link-injector";
import { WEBSITE_CONFIG } from "./step12-config";
import type { Step12Language } from "./step12-types";
import { getUniversalTranslation, type SupportedLanguage } from "./universal-translations";

export interface UniversalContentInput {
  topic: string;
  sourceText?: string;
  language: SupportedLanguage;
  contentType: "blog" | "social" | "handout" | "video-script" | "faq";
  audience: "patients" | "doctors" | "students" | "general";
  tone: "professional" | "friendly" | "educational" | "urgent";
  wordCount?: number;
}

export function generateUniversalContent(input: UniversalContentInput): string {
  const { contentType } = input;
  const t = (key: string) => getUniversalTranslation(input.language, key);
  const keyTerms = extractKeyTerms(input.topic);

  let content = "";
  switch (contentType) {
    case "blog":
      content = generateBlogContent(input, t, keyTerms);
      break;
    case "social":
      content = generateSocialContent(input, t, keyTerms);
      break;
    case "handout":
      content = generateHandoutContent(input, t, keyTerms);
      break;
    case "video-script":
      content = generateVideoScriptContent(input, t, keyTerms);
      break;
    case "faq":
      content = generateFAQContent(input, t, keyTerms);
      break;
  }

  return injectWebsiteLink(content, input.language as Step12Language);
}

function extractKeyTerms(topic: string): string[] {
  const stopWords = ["of", "in", "for", "and", "the", "a", "an", "on", "with", "to"];
  const words = topic.split(/\s+/);
  return words.filter((w) => !stopWords.includes(w.toLowerCase()));
}

function generateBlogContent(
  input: UniversalContentInput,
  t: (key: string) => string,
  keyTerms: string[]
): string {
  const { topic, sourceText, audience } = input;
  const primaryTerm = keyTerms[0] || topic.split(" ")[0] || "this topic";

  const intro = getIntroduction(topic, primaryTerm, audience, input.language);
  const background = getBackground(topic, primaryTerm, sourceText);
  const keyPoints = getKeyPoints(topic, primaryTerm);
  const practicalTips = getPracticalTips(topic, primaryTerm, audience);
  const clinicalImplications = getClinicalImplications(topic, primaryTerm);
  const conclusion = getConclusion(topic, primaryTerm);

  return `
# ${topic}

## ${t("introduction")}
${intro}

## ${t("background")}
${background}

## ${t("keyPoints")}
${keyPoints}

## ${t("practicalTips")}
${practicalTips}

## ${t("clinicalImplications")}
${clinicalImplications}

## ${t("conclusion")}
${conclusion}

---
*${t("learnMore")}: ${WEBSITE_CONFIG.url}*
`.trim();
}

function getIntroduction(
  topic: string,
  primaryTerm: string,
  audience: string,
  language: string
): string {
  const en = `${primaryTerm} is an important topic in metabolic health. This article explores the evidence and practical applications for ${audience === "patients" ? "you" : "clinical practice"}.`;
  const intros: Record<string, string> = {
    en,
    hi: `${primaryTerm} चयापचय स्वास्थ्य में एक महत्वपूर्ण विषय है। यह लेख ${audience === "patients" ? "आपके" : "नैदानिक अभ्यास"} के लिए साक्ष्य और व्यावहारिक अनुप्रयोगों का पता लगाता है।`,
    te: `${primaryTerm} మెటాబాలిక్ ఆరోగ్యంలో ఒక ముఖ్యమైన అంశం. ఈ వ్యాసం ${audience === "patients" ? "మీ" : "క్లినికల్ ప్రాక్టీస్"} కోసం ఆధారాలు మరియు ఆచరణాత్మక అనువర్తనాలను పరిశోధిస్తుంది.`,
    ta: `${primaryTerm} வளர்சிதை மாற்ற ஆரோக்கியத்தில் ஒரு முக்கியமான தலைப்பு. இந்த கட்டுரை ${audience === "patients" ? "உங்கள்" : "மருத்துவ நடைமுறை"}க்கான ஆதாரங்கள் மற்றும் நடைமுறை பயன்பாடுகளை ஆராய்கிறது.`,
  };
  return intros[language] ?? en;
}

function getBackground(topic: string, primaryTerm: string, sourceText?: string): string {
  if (sourceText && sourceText.length > 100) {
    return sourceText.substring(0, 400).trim() + (sourceText.length > 400 ? "…" : "");
  }
  return `${primaryTerm} has gained attention in recent years for its role in metabolic health and disease prevention. Evidence supports its relevance in clinical and lifestyle interventions.`;
}

function getKeyPoints(topic: string, primaryTerm: string): string {
  return `
1. ${primaryTerm} plays a significant role in metabolic health.
2. Evidence supports its clinical relevance.
3. Practical applications for daily practice.
4. Cost-effective and accessible approach.
5. Requires individualized assessment.
`.trim();
}

function getPracticalTips(topic: string, primaryTerm: string, audience: string): string {
  return `
• Understand the basics of ${primaryTerm}.
• Apply evidence-based guidelines.
• Monitor outcomes regularly.
• Consult specialists when needed.
• Educate ${audience === "patients" ? "yourself" : "patients/colleagues"} about benefits.
`.trim();
}

function getClinicalImplications(topic: string, primaryTerm: string): string {
  return `The understanding and application of ${primaryTerm} can significantly improve patient outcomes and clinical decision-making in metabolic health.`;
}

function getConclusion(topic: string, primaryTerm: string): string {
  return `${primaryTerm} represents an important consideration in metabolic health. Further research and clinical experience will continue to refine our understanding and applications.`;
}

function generateSocialContent(
  input: UniversalContentInput,
  t: (key: string) => string,
  keyTerms: string[]
): string {
  const { topic, sourceText } = input;
  const primaryTerm = keyTerms[0] || topic.split(" ")[0] || topic;
  const snippet = sourceText && sourceText.length > 50 ? sourceText.substring(0, 200) + "…" : "";
  return `
${t("newPublication")}

${topic}

${t("keyFinding")} ${primaryTerm} and metabolic health – evidence-based overview.

${t("whatThisMeans")} ${snippet || `Practical insights for ${primaryTerm} in clinical and daily practice.`}

${t("thread")} 👇

🔗 ${t("freeTools")}: ${WEBSITE_CONFIG.url}
`.trim();
}

function generateHandoutContent(
  input: UniversalContentInput,
  t: (key: string) => string,
  keyTerms: string[]
): string {
  const { topic, audience } = input;
  const primaryTerm = keyTerms[0] || topic.split(" ")[0] || topic;
  return `
# ${topic}
**HOMA Clinic, Hyderabad**

## ${t("keyPoints")}
1. ${primaryTerm} – evidence-based overview.
2. Practical tips for ${audience === "patients" ? "you" : "clinical practice"}.
3. When to consult your doctor.
4. Resources and further reading.

## ${t("practicalTips")}
• Follow evidence-based guidelines.
• Regular monitoring as advised.
• ${t("consultDoctor")} for personalized care.

---
${t("learnMore")}: ${WEBSITE_CONFIG.url}
`.trim();
}

function generateVideoScriptContent(
  input: UniversalContentInput,
  t: (key: string) => string,
  keyTerms: string[]
): string {
  const { topic } = input;
  const primaryTerm = keyTerms[0] || topic.split(" ")[0] || topic;
  return `
[0:00–0:15] HOOK: ${topic} – what you need to know.
[0:15–0:45] ${t("introduction")}: ${primaryTerm} and metabolic health.
[0:45–1:15] ${t("keyPoints")}: Evidence and practical takeaways.
[1:15–1:45] ${t("conclusion")}: Summary and next steps.
[1:45–2:00] CTA: ${t("learnMore")} – ${WEBSITE_CONFIG.url}
`.trim();
}

function generateFAQContent(
  input: UniversalContentInput,
  t: (key: string) => string,
  keyTerms: string[]
): string {
  const { topic } = input;
  const primaryTerm = keyTerms[0] || topic.split(" ")[0] || topic;
  return `
# ${topic} – ${t("keyPoints")}

**Q1:** What is ${primaryTerm}?
**A:** ${primaryTerm} is relevant to metabolic health and clinical practice. Evidence supports its role in assessment and prevention.

**Q2:** ${t("whatThisMeans")}
**A:** Practical applications for daily practice and when to seek specialist advice.

**Q3:** Where can I learn more?
**A:** ${t("freeTools")}: ${WEBSITE_CONFIG.url}
`.trim();
}
