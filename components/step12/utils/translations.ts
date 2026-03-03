/**
 * Step 12 – multi-language translations. Re-exports universal dictionary from lib.
 * Imports ONLY from @/lib/utils/step12. No patientData; no steps 1–6.
 * Supports en, hi, te, ta, kn, ml, bn, mr for ANY topic.
 */

import type { Step12Language } from "@/lib/utils/step12";
import {
  getUniversalTranslation,
  UNIVERSAL_TRANSLATIONS,
  type SupportedLanguage,
} from "@/lib/utils/step12";

export type TranslationKey = keyof (typeof UNIVERSAL_TRANSLATIONS)["en"];

/** Get translated string for a key. Falls back to English, then key. Use for all 8 languages. */
export function getTranslation(lang: Step12Language, key: string): string {
  return getUniversalTranslation(lang as SupportedLanguage, key);
}

/** Typed translation helper for use in generators. */
export function t(lang: Step12Language, key: TranslationKey): string {
  return getUniversalTranslation(lang as SupportedLanguage, key);
}

export { UNIVERSAL_TRANSLATIONS as TRANSLATIONS };
