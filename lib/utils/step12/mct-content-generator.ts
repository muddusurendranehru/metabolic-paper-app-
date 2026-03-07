/**
 * Step 12 – MCT content generator. Uses mct-pubmed-agent only; no steps 1–6, no patientData.
 * Additive only: optional entry point when user selects "MCT Evidence" mode.
 */

import { injectWebsiteLink } from "./link-injector";
import { fetchMCTEvidence, type MCTEvidence } from "./mct-pubmed-agent";
import { WEBSITE_CONFIG } from "./step12-config";
import type { Step12Language } from "./step12-types";

export interface MCTContentInput {
  topic: string;
  language: "en" | "hi" | "te" | "ta";
  audience: "patients" | "doctors" | "general";
  outputFormat: "blog" | "twitter" | "instagram" | "handout";
}

export async function generateMCTContent(input: MCTContentInput): Promise<string> {
  const evidence = await fetchMCTEvidence(input.topic);
  const topicLabel = input.topic?.trim() || "this topic";
  const evidenceOrFallback: MCTEvidence = evidence ?? {
    query: input.topic,
    totalResults: 0,
    trials: [],
    neutralSummary: `Evidence on "${topicLabel}" is evolving. Current guidelines emphasize individualized dietary counseling and routine monitoring of metabolic parameters where relevant.`,
    limitations: ["Limited high-quality trials", "Most data from non-Indian populations", "Short follow-up durations"],
    clinicalContext: `For Indian patients asking about "${topicLabel}", focus on overall dietary patterns, portion control, and regular monitoring of glucose, lipids, and waist circumference where applicable. Discuss with your healthcare team for personalized advice.`,
  };
  const content = buildMCTContent(input, evidenceOrFallback);
  return injectWebsiteLink(content, input.language as Step12Language);
}

function getLanguageLabels(lang: string): { freeTools: string } {
  const map: Record<string, { freeTools: string }> = {
    en: { freeTools: "Free Metabolic Tools" },
    hi: { freeTools: "निःशुल्क मेटाबोलिक टूल्स" },
    te: { freeTools: "ఉచిత మెటాబాలిక్ సాధనాలు" },
    ta: { freeTools: "இலவச வளர்சிதை மாற்ற கருவிகள்" },
  };
  return map[lang] ?? map.en;
}

function buildMCTContent(input: MCTContentInput, evidence: MCTEvidence): string {
  const { topic, language, audience, outputFormat } = input;
  const labels = getLanguageLabels(language);
  const url = WEBSITE_CONFIG.url;

  if (outputFormat === "blog") {
    return `
# ${topic}: What Does PubMed Evidence Say?

## Introduction
${evidence.neutralSummary}

## Recent PubMed Findings
${
  evidence.trials.length > 0
    ? evidence.trials
        .map(
          (t) => `
### ${t.title}
• **Design**: ${t.design} | **Year**: ${t.year} | **Sample**: n=${t.sampleSize ?? "N/A"}
• **Key Outcome**: ${t.keyOutcome}
• **PMID**: [${t.pmid}](https://pubmed.ncbi.nlm.nih.gov/${t.pmid}/)
`
        )
        .join("\n")
    : "No recent randomized trials identified in this PubMed search. Observational data and expert opinion guide current practice."
}

## Limitations to Consider
${evidence.limitations.map((l) => `• ${l}`).join("\n")}

## Practical Context for ${audience === "patients" ? "You" : "Clinical Practice"} in India
${evidence.clinicalContext}

## Neutral Takeaway
Evidence on "${topic}" is evolving. For metabolic health, focus on:
• Routine monitoring of glucose, lipids, and waist circumference where relevant
• Balanced dietary patterns aligned with cultural preferences
• Individualized counseling with your healthcare team
• Use of validated tools: ${url}

---
🔗 ${labels.freeTools}: ${url}

---
*Dr. Muddu Surendra Nehru, MD*  
*HOMA Clinic, Gachibowli, Hyderabad*
`.trim();
  }

  if (outputFormat === "twitter") {
    const line1 = `🔬 PubMed Check: ${topic}`;
    const line2 = evidence.neutralSummary;
    const line3 =
      evidence.trials.length > 0
        ? evidence.trials
            .slice(0, 2)
            .map(
              (t) =>
                `• ${t.design} (n=${t.sampleSize ?? "?"}, ${t.year}): ${t.keyOutcome.substring(0, 80)}${t.keyOutcome.length > 80 ? "…" : ""}`
            )
            .join("\n")
        : "";
    const line4 = "⚠️ Limitations: Small samples, short duration, limited Indian data.";
    const line5 = "💡 Practical: Focus on overall diet pattern + routine monitoring.";
    const line6 = `🔗 ${labels.freeTools}: ${url}`;
    const line7 = "#EvidenceBased #IndianHealthcare #PubMed";
    const full = [line1, line2, line3, line4, line5, line6, line7].filter(Boolean).join("\n\n");
    return full.substring(0, 280);
  }

  if (outputFormat === "instagram") {
    const intro = `🔬 ${topic}\n\n${evidence.neutralSummary}`;
    const takeaway = `\n\n💡 ${evidence.clinicalContext}`;
    const cta = `\n\n🔗 ${labels.freeTools}: ${url}`;
    return (intro + takeaway + cta).substring(0, 2200);
  }

  if (outputFormat === "handout") {
    return `
# ${topic}: PubMed Evidence Snapshot

## Summary
${evidence.neutralSummary}

## Practical context (India)
${evidence.clinicalContext}

## Limitations
${evidence.limitations.map((l) => `• ${l}`).join("\n")}

---
🔗 ${labels.freeTools}: ${url}

---
*Dr. Muddu Surendra Nehru, MD* | *HOMA Clinic, Gachibowli, Hyderabad*
`.trim();
  }

  return `PubMed evidence content for ${outputFormat} on ${topic}`;
}
