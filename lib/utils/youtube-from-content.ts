/**
 * Generate YouTube Shorts script from ContentAmplificationInput. Returns VideoScript.
 * Topic-agnostic. No step-1–step-6 imports. No patientData. Additive only.
 */

import type { ContentAmplificationInput, StatisticalResult } from "./content-amplification-schema";
import type { TopicCategory } from "./content-amplification-schema";
import { extractKeyTerm, getFormulaForTopic, getNormalRange, getElevatedThreshold } from "./lecture-slides-from-content";

export interface Scene {
  timestamp: string;
  visual: string;
  textOverlay: string;
  voiceover: string;
}

export interface VideoScript {
  duration: string;
  scenes: Scene[];
}

function getHookQuestion(category: TopicCategory): string {
  const hooks: Record<TopicCategory, string> = {
    biomarker: "a simple blood test can predict metabolic risk?",
    drug: "the right dose can change outcomes?",
    lifestyle: "lifestyle changes can reverse risk?",
    diagnostic: "one test can stratify risk?",
    other: "this topic matters for your patients?",
  };
  return hooks[category] ?? hooks.other;
}

function getFreeAlternative(category: TopicCategory): string {
  const alternatives: Record<TopicCategory, string> = {
    biomarker: "we have a free index from routine labs",
    drug: "we have guideline-based options",
    lifestyle: "we have evidence-based lifestyle steps",
    diagnostic: "we have a practical screening approach",
    other: "there is a practical alternative",
  };
  return alternatives[category] ?? alternatives.other;
}

function formatStatResult(sr: StatisticalResult | undefined): string {
  if (!sr) return "—";
  const val = sr.value;
  const p = sr.pValue;
  const pStr = p < 0.001 ? "p<0.001" : `p=${p}`;
  return `${sr.metric} = ${val}, ${pStr}`;
}

function getLocation(input: Partial<ContentAmplificationInput>): string {
  const loc = input.clinicName?.split(",").map((s) => s.trim()).filter(Boolean)[1];
  return loc || input.clinicalArea || "our setting";
}

function getScienceSummary(keyFinding: string | undefined, maxLen: number = 80): string {
  if (!keyFinding?.trim()) return "Key finding from our study";
  return keyFinding.length <= maxLen ? keyFinding : keyFinding.slice(0, maxLen - 3) + "…";
}

/**
 * Generate a 60-second YouTube Shorts script from ContentAmplificationInput.
 */
export function generateYouTubeShortsScript(input: Partial<ContentAmplificationInput>): VideoScript {
  const category = input.topicCategory ?? "other";
  const topicTitle = input.topicTitle ?? "";
  const titleShort = topicTitle.length > 50 ? topicTitle.substring(0, 47) + "…" : topicTitle;
  const formula = getFormulaForTopic(category);
  const normalRange = getNormalRange(category);
  const elevatedThreshold = getElevatedThreshold(category);
  const action = "see your doctor";
  const keyTerm = extractKeyTerm(topicTitle);
  const websiteUrl = input.websiteUrl ?? "our website";
  const n = input.sampleSize ?? 0;
  const sr = input.statisticalResult;
  const statStr = formatStatResult(sr);
  const location = getLocation(input);
  const scienceSummary = getScienceSummary(input.keyFinding);

  return {
    duration: "60_seconds",
    scenes: [
      {
        timestamp: "0-5s",
        visual: "Doctor in clinic holding lab report",
        textOverlay: titleShort || "Topic",
        voiceover: `Did you know ${getHookQuestion(category)}?`,
      },
      {
        timestamp: "5-15s",
        visual: `Animation: ${formula}`,
        textOverlay: `${formula} | Normal: ${normalRange}`,
        voiceover: `Traditional tests are expensive. But ${getFreeAlternative(category)}!`,
      },
      {
        timestamp: "15-35s",
        visual: "Bar chart: risk distribution",
        textOverlay: `Study: n=${n} | ${statStr}`,
        voiceover: `We studied ${n} patients in ${location}. ${scienceSummary}!`,
      },
      {
        timestamp: "35-50s",
        visual: "Checklist: Diet, Exercise, Medications",
        textOverlay: `If ${elevatedThreshold}: ${action}`,
        voiceover: `Calculate your ${keyTerm} at ${websiteUrl}. If ${elevatedThreshold}, see your doctor.`,
      },
      {
        timestamp: "50-60s",
        visual: "QR code + Subscribe button",
        textOverlay: `Free Tool: ${websiteUrl} | Subscribe for More`,
        voiceover: `Subscribe for more ${input.clinicalArea || "clinical"} tips! Paper link in description.`,
      },
    ],
  };
}
