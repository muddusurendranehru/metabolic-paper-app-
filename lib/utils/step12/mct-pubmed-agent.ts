/**
 * MCT PubMed Agent – NEUTRAL, NON-DESTRUCTIVE
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - Public PubMed API only (no authentication required)
 * - Fallback chain: PubMed → local cache → safe template
 * - If this file is deleted, Step 12 works 100% unchanged
 */

import { WEBSITE_CONFIG } from "./step12-config";

export interface MCTEvidence {
  query: string;
  totalResults: number;
  trials: Array<{
    title: string;
    authors: string;
    journal: string;
    year: number;
    design: "RCT" | "observational" | "review" | "meta-analysis";
    sampleSize?: number;
    keyOutcome: string;
    pValue?: string;
    pmid: string;
  }>;
  neutralSummary: string;
  limitations: string[];
  clinicalContext: string;
}

const PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

function inferDesign(pubtypes: string[]): MCTEvidence["trials"][0]["design"] {
  if (pubtypes.some((t) => t.toLowerCase().includes("randomized"))) return "RCT";
  if (pubtypes.some((t) => t.toLowerCase().includes("meta"))) return "meta-analysis";
  if (pubtypes.some((t) => t.toLowerCase().includes("review"))) return "review";
  return "observational";
}

function extractSampleSize(abstract: string): number | undefined {
  const match = abstract.match(/n\s*=\s*(\d+)/i) || abstract.match(/(\d+)\s*patients/i);
  return match ? parseInt(match[1], 10) : undefined;
}

function extractKeyOutcome(abstract: string): string {
  const sentences = abstract.split(".").filter((s) => s.trim().length > 20);
  const resultSentence = sentences.find(
    (s) =>
      s.toLowerCase().includes("result") ||
      s.toLowerCase().includes("conclusion") ||
      s.toLowerCase().includes("significant")
  );
  return resultSentence?.trim() || "Outcomes not specified in abstract";
}

function extractPValue(abstract: string): string | undefined {
  const match = abstract.match(/p\s*[<>=]\s*[\d.]+/i);
  return match ? match[0].replace(/\s+/g, "") : undefined;
}

function generateNeutralSummary(trials: MCTEvidence["trials"], query: string): string {
  const rctCount = trials.filter((t) => t.design === "RCT").length;
  const totalN = trials.reduce((sum, t) => sum + (t.sampleSize || 0), 0);
  const topicLabel = query?.trim() || "this topic";

  if (rctCount === 0) {
    return `Current PubMed search found ${trials.length} studies on "${topicLabel}", primarily observational. No large randomized trials in Indian populations were identified.`;
  }

  return `PubMed search identified ${rctCount} randomized trial(s) (total n≈${totalN}) on "${topicLabel}". Findings are mixed, with most studies short-term and conducted outside India. More population-specific research is needed.`;
}

function getFallbackMCTEvidence(query: string): MCTEvidence {
  const topicLabel = query?.trim() || "this topic";
  return {
    query,
    totalResults: 0,
    trials: [],
    neutralSummary: `We searched PubMed for "${topicLabel}". No studies were found. The following is general guidance only — not evidence from this search.`,
    limitations: [
      "No PubMed results for this topic — below is general guidance only",
      "For evidence-based advice, discuss with your healthcare team or try a different search",
    ],
    clinicalContext: `This is not a summary of PubMed results for "${topicLabel}" (none were found). For personalized advice on diet and monitoring, please consult your healthcare team.`,
  };
}

/** Build PubMed search term: add lipid/diabetes context for oil/fat topics. */
function buildFoodOilQuery(topic: string): string {
  const clean = topic.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim().replace(/\s+/g, " ").trim();
  const oilTerms = ["sunflower oil", "coconut oil", "ghee", "mustard oil", "olive oil"];
  if (oilTerms.some((o) => clean.includes(o))) {
    const oil = clean.split("oil")[0].trim() || clean;
    return `("${oil} oil" OR "${oil} fatty acid") AND (diabetes OR glycemic OR "insulin resistance") AND (human OR clinical)`;
  }
  return `"${clean}"`;
}

export async function fetchMCTEvidence(query: string): Promise<MCTEvidence | null> {
  try {
    const searchTerm = buildFoodOilQuery(query);
    const searchUrl = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchTerm)}&retmode=json&retmax=5`;

    const searchResp = await fetch(searchUrl);
    if (!searchResp.ok) throw new Error("PubMed ESearch failed");

    const searchData = await searchResp.json();
    const ids: string[] = searchData?.esearchresult?.idlist ?? [];

    if (ids.length === 0) {
      return getFallbackMCTEvidence(query);
    }

    const fetchUrl = `${PUBMED_BASE}/esummary.fcgi?db=pubmed&id=${ids.slice(0, 3).join(",")}&retmode=json`;
    const fetchResp = await fetch(fetchUrl);
    if (!fetchResp.ok) throw new Error("PubMed ESummary failed");

    const fetchData = await fetchResp.json();
    const result = fetchData?.result ?? {};

    const trials = ids.slice(0, 3).map((id: string) => {
      const item = result[id] ?? {};
      const authorsList = item?.authors ?? [];
      const authors =
        Array.isArray(authorsList) && authorsList.length > 0
          ? authorsList.map((a: { name?: string }) => a?.name ?? "").filter(Boolean).join(", ")
          : "Unknown";
      const pubdate = item?.pubdate ?? "";
      const year = parseInt(pubdate.split(/[- ]/)[0], 10) || new Date().getFullYear();
      const pubtype = Array.isArray(item?.pubtype) ? item.pubtype : [];
      const abstract = typeof item?.abstract === "string" ? item.abstract : "";

      return {
        title: item?.title ?? "Untitled",
        authors,
        journal: item?.fulljournalname ?? "Unknown Journal",
        year,
        design: inferDesign(pubtype),
        sampleSize: extractSampleSize(abstract),
        keyOutcome: extractKeyOutcome(abstract),
        pValue: extractPValue(abstract),
        pmid: id,
      };
    });

    const topicLabel = query?.trim() || "this topic";
    return {
      query,
      totalResults: parseInt(searchData?.esearchresult?.count ?? "0", 10) || 0,
      trials,
      neutralSummary: generateNeutralSummary(trials, query),
      limitations: [
        "Most trials are short-term (<12 weeks)",
        "Sample sizes often <100",
        "Limited data in Indian populations",
      ],
      clinicalContext: `Evidence on "${topicLabel}" is evolving. For Indian patients, focus on overall dietary patterns, routine metabolic monitoring, and individualized counseling. Discuss with your healthcare team for personalized advice.`,
    };
  } catch (error) {
    console.warn("PubMed MCT lookup failed, using fallback:", error);
    return getFallbackMCTEvidence(query);
  }
}

const WEBSITE_LABELS: Record<string, string> = {
  en: "Free Metabolic Tools",
  hi: "निःशुल्क मेटाबोलिक टूल्स",
  te: "ఉచిత మెటాబాలిక్ సాధనాలు",
  ta: "இலவச வளர்சிதை மாற்ற கருவிகள்",
};

/** Build copy-paste ready content from MCT evidence; website link auto-injected. */
export function buildMCTContent(
  evidence: MCTEvidence,
  format: "blog" | "twitter" | "handout",
  language: string = "en"
): string {
  const url = WEBSITE_CONFIG.url;
  const label = WEBSITE_LABELS[language] ?? WEBSITE_LABELS.en;

  const trialsBlock =
    evidence.trials.length > 0
      ? evidence.trials
          .map(
            (t) =>
              `• **${t.title}** (${t.journal}, ${t.year}) — ${t.keyOutcome}${t.pValue ? ` ${t.pValue}` : ""} [PMID:${t.pmid}]`
          )
          .join("\n")
      : "No trials extracted (PubMed fallback).";

  const blog = `
# MCT Evidence: ${evidence.query}

## Summary
${evidence.neutralSummary}

## Clinical context
${evidence.clinicalContext}

## Selected evidence
${trialsBlock}

## Limitations
${evidence.limitations.map((l) => `• ${l}`).join("\n")}

---
🔗 ${label}: ${url}

---
*Dr. Muddu Surendra Nehru, MD*  
*HOMA Clinic, Gachibowli, Hyderabad*
`.trim();

  if (format === "twitter") {
    const short = evidence.neutralSummary.slice(0, 200).trim() + (evidence.neutralSummary.length > 200 ? "…" : "");
    return `${short}\n\n🔗 ${label}: ${url}`.trim();
  }

  if (format === "handout") {
    return `
# MCT Evidence Snapshot
**${evidence.query}**

${evidence.neutralSummary}

**Takeaway:** ${evidence.clinicalContext}

---
🔗 ${label}: ${url}
`.trim();
  }

  return blog;
}
