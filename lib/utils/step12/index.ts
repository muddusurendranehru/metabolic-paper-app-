/**
 * Step 12 – public API. Step 12 imports ONLY from here (lib/utils/step12/).
 * Never import from app/research/steps/* or other lib/utils in Step 12 code.
 */

export { DEFAULT_STEP12_STATE, DEFAULT_NEUTRAL_INPUT, DEFAULT_STEP12_INPUT, formatStep12Label, STEP12_DEFAULT_WEBSITE_URL, STEP12_DEFAULT_CLINIC, type Step12State } from "./step12-config";
export { generateNeutralContent } from "./step12-generator";
export type {
  NeutralContentInput,
  NeutralContentOutput,
  Step12Input,
  Step12SourceType,
  Step12TargetFormat,
  Step12Audience,
  Step12Tone,
} from "./step12-types";
export { extractPlainText, extractSnippet } from "./text-extractor";
export { formatSection, formatBullets, formatDocument } from "./content-formatter";
