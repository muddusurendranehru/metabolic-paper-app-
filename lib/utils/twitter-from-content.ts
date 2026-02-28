/**
 * Generate Twitter thread from ContentAmplificationInput. Returns Tweet[].
 * Topic-agnostic. No step-1–step-6 imports. No patientData. Additive only.
 */

import type { ContentAmplificationInput } from "./content-amplification-schema";

export interface Tweet {
  text: string;
  mediaUrl?: string;
}

/** Extended input for optional figure/DOI (still compatible with ContentAmplificationInput). */
export type TwitterThreadInput = Partial<ContentAmplificationInput> & {
  figureUrl?: string;
  doiLink?: string;
  expensiveTest?: string;
  currentLimitation?: string;
  practicalTakeaway?: string;
};

/**
 * Generate a 5-tweet thread from ContentAmplificationInput.
 * Returns Tweet[] with text and optional mediaUrl.
 */
export function generateTwitterThread(input: TwitterThreadInput): Tweet[] {
  const topicTitle = input.topicTitle ?? "";
  const titleShort = topicTitle.length > 200 ? topicTitle.substring(0, 197) + "…" : topicTitle;
  const n = input.sampleSize ?? 0;
  const clinicalArea = input.clinicalArea ?? "Research";
  const tag = clinicalArea.replace(/\s+/g, "") || "MedicalResearch";
  const clinicName = input.clinicName ?? "Clinic setting";
  const intervention = input.intervention ?? "intervention";
  const outcome = input.outcome ?? "outcome";
  const keyFinding = input.keyFinding ?? "";
  const sr = input.statisticalResult;
  const metricStr = sr ? `${sr.metric.toUpperCase()} = ${sr.value}, p=${sr.pValue}` : "";
  const pNote = sr && sr.pValue < 0.001 ? " <0.001 ✅" : "";
  const practicalTakeaway = input.practicalTakeaway ?? input.keyFinding?.slice(0, 150) ?? "See key finding above.";
  const doiLink = input.doiLink ?? input.websiteUrl ?? "—";
  const expensiveTest = input.expensiveTest ?? "specialized testing";
  const currentLimitation = input.currentLimitation ?? "limited access in resource-constrained settings";
  const topicCategory = input.topicCategory ?? "other";

  const tweets: Tweet[] = [
    {
      text: `🚨 NEW RESEARCH: ${titleShort}\nn=${n} patients | ${clinicalArea}\nThread 🧵 #MedicalResearch #${tag}`,
      ...(input.figureUrl ? { mediaUrl: input.figureUrl } : {}),
    },
    {
      text: `❌ Problem: ${input.patientPopulation || "Patients"} often lack access to ${expensiveTest}.\nCurrent gap: ${currentLimitation}`,
    },
    {
      text: `✅ What we did:\n• Study: Cross-sectional | n=${n}\n• Setting: ${clinicName}\n• Measured: ${intervention} vs ${outcome}`,
    },
    {
      text: `💡 KEY FINDING:\n${keyFinding}\n${metricStr}${pNote}\n[Figure embedded]`,
    },
    {
      text: `🎯 What this means for practice:\n${practicalTakeaway}\nFull paper: ${doiLink}\nQuestions? Comment below!\n#${topicCategory} #IndianHealthcare`,
    },
  ];

  return tweets;
}
