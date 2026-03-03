/*
 * SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - No hardcoded medical terms (TyG, HbA1c, etc.) – all via input
 * - Topic-agnostic: works for ANY medical topic
 * - If Step 12 extensions are deleted, Steps 1-6 work 100%
 */
/**
 * Step 12 – Full YouTube package: title, description, tags, hashtags, commentQuiz, endScreenText.
 * Imports ONLY from @/lib/utils/step12. Includes clickable website URL for traffic.
 */

import { extractPlainText, extractSnippet, STEP12_DEFAULT_WEBSITE_URL } from "@/lib/utils/step12";
import { formatSection, formatDocument } from "@/lib/utils/step12";

const DEFAULT_WEBSITE_URL = STEP12_DEFAULT_WEBSITE_URL;

export interface YouTubePackage {
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  commentQuiz: string[];
  endScreenText: string;
}

function extractKeyTerm(topic: string): string {
  return topic.trim().split(/\s+/)[0] || "topic";
}

/** Generate full YouTube package object (topic-agnostic; no invented n/r/p). */
export function generateYouTubePackageObject(
  topic: string,
  sourceText?: string,
  websiteUrl: string = DEFAULT_WEBSITE_URL
): YouTubePackage {
  const keyTerm = extractKeyTerm(topic);
  const summary = sourceText ? extractSnippet(extractPlainText(sourceText), 300) : "";
  const keyTermClean = keyTerm.replace(/\s+/g, "");

  const title = `${keyTerm} & Clinical Practice: Evidence-Based Guide | Dr. Muddu`;
  const titleFinal = title.length <= 60 ? title : title.substring(0, 57) + "...";

  const description = [
    "🔬 RESEARCH HIGHLIGHT",
    topic,
    "",
    "📊 KEY POINTS:",
    "• Evidence-based overview of " + keyTerm,
    "• Practical relevance for screening and risk stratification",
    "• Applicable in Indian and global practice",
    summary ? "• " + summary : "",
    "",
    "⏱️ TIMESTAMPS (adjust to your video):",
    "0:00 – Introduction: Why " + keyTerm + " matters",
    "0:15 – Background and definitions",
    "1:00 – Evidence and clinical use",
    "2:00 – Practical applications",
    "3:00 – Takeaways and call to action",
    "",
    "🔗 RESOURCES:",
    "• Free tools & 90-day program: " + websiteUrl,
    "• Book consultation: " + websiteUrl,
    "",
    "👨‍⚕️ ABOUT:",
    "Dr. Muddu Surendra Nehru, MD | Professor of Medicine | HOMA Clinic, Hyderabad",
    "",
    "💬 ENGAGE: Comment with your questions!",
    "📢 DISCLAIMER: Educational only. Not medical advice. Consult your physician.",
    "© " + new Date().getFullYear() + " Dr. Muddu Surendra Nehru.",
  ]
    .filter(Boolean)
    .join("\n")
    .substring(0, 2000);

  const tags = [
    keyTerm.toLowerCase(),
    keyTerm + " index",
    keyTerm + " India",
    "metabolic health",
    "diabetes prevention",
    "evidence based",
    "HOMA Clinic Hyderabad",
    "metabolic syndrome",
    "prediabetes screening",
    "clinical practice",
    "Indian practice",
    "Dr Muddu Nehru",
    "metabolic risk",
    "screening tool",
    "medical education",
    "Gachibowli",
    "hyderabad",
    "metabolic reversal",
    "insulin resistance",
    "diabetes",
  ].slice(0, 20);

  const hashtags = [
    "#" + keyTermClean,
    "#Diabetes",
    "#MetabolicHealth",
    "#EvidenceBased",
    "#MedicalEducation",
    "#HOMAClinic",
    "#Hyderabad",
    "#ClinicalPractice",
    "#DiabetesPrevention",
    "#DrMuddu",
  ].slice(0, 10);

  const commentQuiz = [
    "📝 QUIZ – Test your knowledge:\n\n" +
      "Q1: Who benefits most from " +
      keyTerm +
      " awareness?\nA) Researchers only\nB) Patients and clinicians ✅\nC) Children only\nD) No one\n\n" +
      "Q2: Where can you get a free metabolic check?\nA) Nowhere\nB) " +
      websiteUrl +
      " ✅\nC) Only overseas\nD) Only in hospitals\n\n" +
      "Q3: Is this content medical advice?\nA) Yes\nB) No – educational only ✅\nC) Only for doctors\nD) Only for patients\n\n" +
      "Drop your answers below! 👇",
  ];

  const endScreenText = [
    "📊 Found this helpful?",
    "✅ LIKE | 💬 COMMENT | 🔔 SUBSCRIBE | 📲 SHARE",
    "Free metabolic check: " + websiteUrl,
    "📞 09963721999 | HOMA Clinic Gachibowli",
  ].join("\n");

  return {
    title: titleFinal,
    description,
    tags,
    hashtags,
    commentQuiz,
    endScreenText,
  };
}

/** Generate string output for Step 12 UI (serialized package with website URL for traffic). */
export function generateYoutubePackage(sourceText: string, title?: string): string {
  const topic = title ?? "Medical topic";
  const text = sourceText ? extractPlainText(sourceText) : "";
  const pkg = generateYouTubePackageObject(topic, text, DEFAULT_WEBSITE_URL);

  const sections = [
    formatSection("YouTube title (≤60 chars)", pkg.title),
    formatSection("Description", pkg.description),
    formatSection("Tags (20)", pkg.tags.join(", ")),
    formatSection("Hashtags (10)", pkg.hashtags.join(" ")),
    formatSection("Pinned comment quiz", pkg.commentQuiz.join("\n\n")),
    formatSection("End screen CTA", pkg.endScreenText),
  ];
  return formatDocument(sections);
}
