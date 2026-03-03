/**
 * Step 12 – config and helpers.
 * ISOLATED: This folder (lib/utils/step12/) is the ONLY allowed import source for Step 12.
 * Step 12 NEVER imports from app/research/steps/* or other lib/utils.
 * No patientData; no shared state with steps 1–11.
 */

import type { NeutralContentInput, Step12Input, Step12TargetFormat, Step12Language } from "./step12-types";
import type { SupportedLanguage } from "./universal-translations";
import { getLanguageFlag, getLanguageName } from "./universal-translations";

/** Supported languages for Step 12 (universal – any topic). UI button group. */
const STEP12_LANGUAGE_CODES: Step12Language[] = ["en", "hi", "te", "ta", "kn", "ml", "bn", "mr"];
export const STEP12_LANGUAGES: { value: Step12Language; label: string; name: string }[] =
  STEP12_LANGUAGE_CODES.map((value) => ({
    value,
    label: `${getLanguageFlag(value as SupportedLanguage)} ${getLanguageName(value as SupportedLanguage).split(" ")[0]}`,
    name: getLanguageName(value as SupportedLanguage),
  }));

export const STEP12_DEFAULT_LANGUAGE: Step12Language = "en";

/** All Step 12 target format options (Book section + SEO Blog included). */
export const STEP12_TARGET_FORMATS: Step12TargetFormat[] = [
  "blog",
  "twitter",
  "linkedin",
  "handout",
  "youtube",
  "youtube-package",
  "mcq",
  "whatsapp",
  "whatsapp-cta",
  "facebook-post",
  "hypernatural",
  "infographic",
  "book-section",
  "seo-blog",
];

export interface Step12State {
  note: string;
  lastUpdated: string;
}

export const DEFAULT_STEP12_STATE: Step12State = {
  note: "",
  lastUpdated: "",
};

export const DEFAULT_NEUTRAL_INPUT: NeutralContentInput = {
  topicTitle: "",
  keyFinding: "",
  audience: "clinicians",
  n: "",
  setting: "",
};

export function formatStep12Label(): string {
  return "Step 12: Neutral Medical Content Generator";
}

/** Single source of truth for Step 12 website link – MUST appear in every generator output. */
export const STEP12_CONSTANTS = {
  WEBSITE_URL: "https://dr-muddus-mvp-miracle-value-proposition-2l36.onrender.com",
  WEBSITE_LABEL: "Free Metabolic Tools",
  QR_CODE_URL: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=",
  LINK_FORMATS: {
    markdown: (url: string, label?: string) => `[${label ?? "Learn More"}](${url})`,
    twitter: (url: string) => (url.length > 23 ? `${url.substring(0, 20)}...` : url),
    plain: (url: string) => url,
    html: (url: string, label?: string) =>
      `<a href="${url}" target="_blank">${label ?? "Visit Website"}</a>`,
  },
} as const;

/** Default CTA URL for generated content – HOMA Clinic / Dr. Muddu. People need to visit. */
export const STEP12_DEFAULT_WEBSITE_URL = STEP12_CONSTANTS.WEBSITE_URL;

/** Website config for injectors (url, shortUrl, label, qrCode). Single source of truth. */
export const WEBSITE_CONFIG = {
  url: STEP12_CONSTANTS.WEBSITE_URL,
  shortUrl: "dr-muddus-mvp-miracle-value-proposition-2l36.onrender.com",
  label: STEP12_CONSTANTS.WEBSITE_LABEL,
  qrCode: (url: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`,
} as const;

export const STEP12_DEFAULT_CLINIC = "HOMA Clinic | Dr. Muddu Surendra Nehru MD";

export const DEFAULT_STEP12_INPUT: Step12Input = {
  topic: "",
  sourceType: "paste",
  targetFormats: ["blog"],
  audience: "general",
  tone: "professional",
  language: STEP12_DEFAULT_LANGUAGE,
};
