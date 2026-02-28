/**
 * Step 12 – config and helpers.
 * ISOLATED: This folder (lib/utils/step12/) is the ONLY allowed import source for Step 12.
 * Step 12 NEVER imports from app/research/steps/* or other lib/utils.
 * No patientData; no shared state with steps 1–11.
 */

import type { NeutralContentInput, Step12Input } from "./step12-types";

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

/** Default CTA URL for generated content – HOMA Clinic / Dr. Muddu. People need to visit. */
export const STEP12_DEFAULT_WEBSITE_URL =
  "https://dr-muddus-mvp-miracle-value-proposition-2l36.onrender.com";

export const STEP12_DEFAULT_CLINIC = "HOMA Clinic | Dr. Muddu Surendra Nehru MD";

export const DEFAULT_STEP12_INPUT: Step12Input = {
  topic: "",
  sourceType: "paste",
  targetFormats: ["blog"],
  audience: "general",
  tone: "professional",
};
