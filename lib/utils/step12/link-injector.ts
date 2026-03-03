/**
 * Step 12 – universal website link injection.
 * ISOLATED: Only imports from this folder (step12). No patientData; no steps 1–6.
 * Use to append the required website link to any generator output.
 */

import { STEP12_CONSTANTS } from "./step12-config";
import type { Step12Language } from "./step12-types";
import { UNIVERSAL_TRANSLATIONS } from "./universal-translations";

export interface LinkInjectorOptions {
  /** Language for the link label (e.g. "Free Metabolic Tools" vs Hindi/Telugu). */
  language?: Step12Language;
  /** Output format: plain (default), markdown, or one-line. */
  format?: "plain" | "markdown" | "oneline";
  /** Custom label override; if set, language is ignored for the label. */
  labelOverride?: string;
}

function getDefaultLabel(lang: Step12Language): string {
  const map = UNIVERSAL_TRANSLATIONS[lang] ?? UNIVERSAL_TRANSLATIONS.en;
  return (map as { freeTools?: string; websiteLabel?: string }).freeTools ?? (map as { websiteLabel?: string }).websiteLabel ?? STEP12_CONSTANTS.WEBSITE_LABEL;
}

/**
 * Returns the website link line (label + URL) for the given options.
 * Does not modify content; use appendWebsiteLink to add to output.
 */
export function getWebsiteLinkLine(options: LinkInjectorOptions = {}): string {
  const { language = "en", format = "plain", labelOverride } = options;
  const url = STEP12_CONSTANTS.WEBSITE_URL;
  const label = labelOverride ?? getDefaultLabel(language);
  if (format === "markdown") {
    return STEP12_CONSTANTS.LINK_FORMATS.markdown(url, label);
  }
  if (format === "oneline") {
    return `${label}: ${url}`;
  }
  return `${label}: ${url}`;
}

/**
 * Appends the required Step 12 website link to content.
 * Use for any generator output so every format includes the link.
 */
export function appendWebsiteLink(
  content: string,
  options: LinkInjectorOptions = {}
): string {
  const line = getWebsiteLinkLine(options);
  const trimmed = (content || "").trim();
  if (!trimmed) return line;
  return trimmed + "\n\n" + line;
}

/**
 * Ensures the given content ends with the website URL (plain).
 * If content already contains the URL, returns as-is; otherwise appends the link line.
 */
export function ensureWebsiteLinkInContent(
  content: string,
  options: LinkInjectorOptions = {}
): string {
  const url = STEP12_CONSTANTS.WEBSITE_URL;
  if ((content || "").includes(url)) return content.trim();
  return appendWebsiteLink(content, { ...options, format: "plain" });
}

/**
 * Inject full website footer (author, clinic, link, published) if URL not already in content.
 * Use for universal content generator and any format that needs the standard footer.
 */
export function injectWebsiteLink(content: string, language: Step12Language = "en"): string {
  const url = STEP12_CONSTANTS.WEBSITE_URL;
  if ((content || "").includes(url)) return content.trimEnd();
  const map = (UNIVERSAL_TRANSLATIONS[language] ?? UNIVERSAL_TRANSLATIONS.en) as Record<string, string>;
  const authorName = map.authorName ?? "Dr. Muddu Surendra Nehru, MD";
  const clinicHyderabad = map.clinicHyderabad ?? "HOMA Clinic, Hyderabad";
  const published = map.published ?? "Published";
  const comingSoon = map.comingSoon ?? "Coming soon";
  const markdownLink = getWebsiteLinkLine({ language, format: "markdown" });
  const footer = `

---
*${authorName}*  
*${clinicHyderabad}*  
🔗 ${markdownLink}  
*${published}: ${comingSoon}*
`;
  return content.trimEnd() + footer;
}
