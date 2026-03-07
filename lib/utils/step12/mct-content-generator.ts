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
    neutralSummary: `We searched PubMed for "${topicLabel}". No studies were found. The following is general guidance only — not evidence from this search.`,
    limitations: [
      "No PubMed results for this topic — below is general guidance only",
      "For evidence-based advice, discuss with your healthcare team or try a different search",
    ],
    clinicalContext: `This is not a summary of PubMed results for "${topicLabel}" (none were found). For personalized advice on diet and monitoring, please consult your healthcare team.`,
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
    const hasFindings = evidence.trials.length > 0;
    const findingsSection = hasFindings
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
      : "**No studies were found in PubMed for this topic.** The text below is general guidance only, not evidence from this search.";
    const takeawaySection = hasFindings
      ? `Evidence from this PubMed search is limited. For metabolic health, focus on routine monitoring, balanced diet, and counseling with your healthcare team. Use of validated tools: ${url}`
      : `We did not find PubMed studies for "${topic}". For evidence-based advice, try a different search or discuss with your healthcare team. Validated tools: ${url}`;

    return `
# ${topic}: What Does PubMed Evidence Say?

## Introduction
${evidence.neutralSummary}

## Recent PubMed Findings
${findingsSection}

## Limitations to Consider
${evidence.limitations.map((l) => `• ${l}`).join("\n")}

## Practical Context for ${audience === "patients" ? "You" : "Clinical Practice"} in India
${evidence.clinicalContext}

## Neutral Takeaway
${takeawaySection}

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
        : "No studies found for this topic — general guidance only.";
    const line4 = evidence.trials.length > 0 ? "⚠️ Limitations: Small samples, short duration, limited Indian data." : "⚠️ Not evidence from PubMed for this search.";
    const line5 = "💡 Discuss with your healthcare team for personalized advice.";
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
# ${topic}: PubMed Search Result

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
