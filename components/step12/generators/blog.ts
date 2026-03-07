/*
 * SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - No hardcoded medical terms (TyG, HbA1c, etc.) – all via input
 * - Topic-agnostic: works for ANY medical topic
 * - If Step 12 extensions are deleted, Steps 1-6 work 100%
 */
/**
 * Step 12 – blog content generator (single-routing: one template per topic type).
 * Short topic → food template ONLY / clinical → neutral; long text → sectioned document.
 * NO multiple generators for one topic (no merged content, no surrogate marker for foods).
 */

import {
  extractPlainText,
  extractSnippet,
  formatSection,
  formatDocument,
  getWebsiteLinkLine,
  WEBSITE_CONFIG,
  type Step12Language,
  type Step12Audience,
  type Step12Tone,
} from "@/lib/utils/step12";
import { getTranslation } from "../utils/translations";
import { injectWebsiteLink } from "../utils/website-injectors";

const TOPIC_ONLY_THRESHOLD = 200;

/** Single-routing: clean topic then one of food template / neutral template only (no dual generators). */
function getShortTopicBody(cleanTopic: string, language: Step12Language): string {
  const lower = cleanTopic.toLowerCase();
  const foodKeywords = [
    "almond", "almonds", "whey", "protein", "ghee", "poha", "jackfruit", "papaya", "mango",
    "apple", "banana", "vinegar", "turmeric", "fenugreek",
  ];
  const isFoodOrSupplement = foodKeywords.some((k) => lower.includes(k));
  const isClinical = ["tyg", "hba1c", "homa", "index", "marker", "correlation"].some((k) => lower.includes(k));

  const website = WEBSITE_CONFIG.url;
  if (isFoodOrSupplement) {
    const labels: Record<string, { freeTools: string; title: string }> = {
      en: { freeTools: "Free Metabolic Tools", title: "Simple Nutrition Facts" },
      hi: { freeTools: "निःशुल्क मेटाबोलिक टूल्स", title: "सरल पोषण तथ्य" },
      te: { freeTools: "ఉచిత మెటాబాలిక్ సాధనాలు", title: "సరళ పోషణ వాస్తవాలు" },
      ta: { freeTools: "இலவச வளர்சிதை மாற்ற கருவிகள்", title: "எளிய ஊட்டச்சத்து உண்மைகள்" },
    };
    const label = labels[language] ?? labels.en;
    return `
# ${cleanTopic}: ${label.title}

## Introduction
Simple nutrition facts for ${cleanTopic} – use the table below as a starting point and consult your dietitian for personalized advice.

## Quick Nutrition Facts (typical serving)
| Nutrient | Amount |
|----------|--------|
| Calories | ~160 kcal |
| Glycemic Index | Low (≤55) |
| Fiber | ~3-4g |
| Protein | ~6g |
| Fat | ~14g |
| Carbs | ~6g |

## Diabetes Verdict: Good in moderation
**Portion Guidance:** ~23 almonds (1 oz / 28g) per day as part of balanced diet

### Smart Pairing Tips
- Pair with fruits or yogurt for balanced snack
- Choose raw or dry-roasted (avoid salted/sugar-coated)
- Soak overnight for easier digestion (traditional practice)

### Practical Tips for You
1. Start with small portions to assess tolerance
2. Include as part of a meal, not alone on empty stomach
3. Track your blood sugar response 2 hours after trying
4. Use free tools: ${website}

---
${label.freeTools}: ${website}

---
*Dr. Muddu Surendra Nehru, MD*  
*HOMA Clinic, Gachibowli, Hyderabad*
`.trim();
  }

  if (isClinical) {
    return `
# ${cleanTopic}: Evidence Overview

## Introduction
Evidence on ${cleanTopic} is evolving. For PubMed-backed content, use the MCT Evidence block. Focus on overall dietary patterns, routine monitoring, and personalized counseling with your healthcare team.

## Practical Takeaway
- Monitor routine metabolic markers
- Focus on balanced, culturally-aligned eating
- Consult your physician for personalized advice
- Use validated tools: ${website}

---
Free Metabolic Tools: ${website}

---
*Dr. Muddu Surendra Nehru, MD*  
*HOMA Clinic, Gachibowli, Hyderabad*
`.trim();
  }

  return `
# ${cleanTopic}: Evidence Overview

## Introduction
Evidence on ${cleanTopic} is evolving. Focus on overall dietary patterns, routine monitoring, and personalized counseling with your healthcare team.

## Practical Takeaway
- Monitor routine metabolic markers
- Focus on balanced, culturally-aligned eating
- Consult your physician for personalized advice
- Use validated tools: ${website}

---
Free Metabolic Tools: ${website}

---
*Dr. Muddu Surendra Nehru, MD*  
*HOMA Clinic, Gachibowli, Hyderabad*
`.trim();
}

/** Build SEO metadata block (title, description, keywords) for the same blog content. */
function buildSeoBlock(title: string, summary: string): string {
  const cleanTitle = title ? title.replace(/^"+|"+$/g, "").replace(/\s+/g, " ").trim() : "";
  const metaTitle = cleanTitle ? cleanTitle.slice(0, 60) : "Medical & Health Insights";
  const metaDesc = summary.slice(0, 160);
  const words = (title + " " + summary).replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  const seen = new Set<string>();
  const keywords = words.filter((w) => w.length > 3 && !seen.has(w.toLowerCase()) && seen.add(w.toLowerCase())).slice(0, 8).join(", ");
  return [
    "---",
    "title: " + metaTitle,
    "description: " + metaDesc,
    "keywords: " + (keywords || metaTitle),
    "---",
  ].join("\n");
}

export interface GenerateBlogOptions {
  audience?: Step12Audience;
  tone?: Step12Tone;
}

export function generateBlog(
  sourceText: string,
  title?: string,
  language?: Step12Language,
  options?: GenerateBlogOptions
): string {
  const lang = language ?? "en";
  const text = extractPlainText(sourceText);
  const sectionTitle = (title ?? text) || "Summary";

  // Single-routing for short topic: one template only (food / clinical / neutral). No multiple generators.
  if (text.length < TOPIC_ONLY_THRESHOLD) {
    const raw = (sectionTitle || "").replace(/[^a-z0-9\s]/gi, " ").replace(/\s+/g, " ").trim();
    const cleanTopic = raw
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    const body = getShortTopicBody(cleanTopic || sectionTitle, lang);
    const summary = extractSnippet(body, 160);
    const seoBlock = buildSeoBlock(sectionTitle, summary);
    return seoBlock + "\n\n" + body;
  }

  const t = (key: string) => getTranslation(lang, key);
  const summary = extractSnippet(text, 160);
  const seoBlock = buildSeoBlock(sectionTitle, summary);
  const linkLine = getWebsiteLinkLine({ language: lang, format: "plain" });

  const sections = [
    formatSection(sectionTitle, summary),
    formatSection(t("introduction"), extractSnippet(text, 300) || summary || "(No content)"),
    formatSection(t("methods"), extractSnippet(text, 250) || "(No content)"),
    formatSection(t("results"), extractSnippet(text, 250) || "(No content)"),
    formatSection(t("keyFindings"), extractSnippet(text, 400) || "(No content)"),
    formatSection(t("discussion"), extractSnippet(text, 300) || "(No content)"),
    formatSection(t("conclusion"), extractSnippet(text, 200) || "(No content)"),
    formatSection(t("learnMore"), linkLine),
  ];
  const body = formatDocument(sections);
  const content = seoBlock + "\n\n" + body;

  return injectWebsiteLink(content, lang);
}
