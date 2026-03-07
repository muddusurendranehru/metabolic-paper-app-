/**
 * MCT Trial Agent – PubMed-backed, isolated, delete-proof.
 *
 * SAFETY GUARANTEE:
 * - ISOLATED: Lives ONLY in lib/utils/step12/mct-agent.ts
 * - NO IMPORTS from app/research/steps/* (only step12-config for link)
 * - NO PATIENT DATA: Only public PubMed API calls
 * - FALLBACK CHAIN: PubMed → Local cache → Safe template
 * - DELETE-PROOF: Remove this file + its export → Step 12 works 100%
 * - WEBSITE LINK: Auto-injected in ALL outputs
 */

import { WEBSITE_CONFIG } from "./step12-config";

const PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, { content: string; ts: number }>();

export interface MctTrialResult {
  pmid: string;
  title: string;
  snippet?: string;
  year?: string;
}

/** Public PubMed API – no auth, no patient data. */
async function fetchFromPubMed(query: string): Promise<MctTrialResult[] | null> {
  try {
    const term = encodeURIComponent(`MCT ${query}`.trim());
    const searchUrl = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${term}&retmax=5&retmode=json`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const idlist: string[] = searchData?.esearchresult?.idlist ?? [];
    if (idlist.length === 0) return [];

    const ids = idlist.slice(0, 5).join(",");
    const summaryUrl = `${PUBMED_BASE}/esummary.fcgi?db=pubmed&id=${ids}&retmode=json`;
    const summaryRes = await fetch(summaryUrl);
    if (!summaryRes.ok) return idlist.map((pmid) => ({ pmid, title: `PMID ${pmid}` }));

    const summaryData = await summaryRes.json();
    const result: MctTrialResult[] = idlist.map((pmid) => {
      const doc = summaryData?.result?.[pmid];
      const title = doc?.title ?? `PMID ${pmid}`;
      const snippet = doc?.snippet ?? undefined;
      const pubdate = doc?.pubdate ?? "";
      const year = (pubdate.match(/\d{4}/) ?? [])[0];
      return { pmid, title, snippet, year };
    });
    return result;
  } catch (error) {
    console.warn("MCT agent: PubMed fetch failed", error);
    return null;
  }
}

function safeTemplate(query: string): string {
  const url = WEBSITE_CONFIG.url;
  return `
# MCT / ${query}: Evidence Summary

## Introduction
Evidence on MCT (medium-chain triglycerides) and related trials continues to evolve. This summary is for general awareness only and does not replace clinical judgment.

## What We Know
- Systematic reviews and trials on MCT are available in PubMed.
- Outcomes often relate to metabolic parameters; individual response varies.
- Consult your physician or dietitian for personalized advice.

## Next Steps
- Use routine metabolic tools and follow-up with your care team.
- For free metabolic risk tools: ${url}

---
🔗 Free Metabolic Tools: ${url}

---
*Dr. Muddu Surendra Nehru, MD*  
*HOMA Clinic, Gachibowli, Hyderabad*
`.trim();
}

function buildContentFromTrials(query: string, trials: MctTrialResult[], language: string): string {
  const url = WEBSITE_CONFIG.url;
  const lang = language === "hi" || language === "te" || language === "ta" ? language : "en";
  const labels: Record<string, string> = {
    en: "Free Metabolic Tools",
    hi: "निःशुल्क मेटाबोलिक टूल्स",
    te: "ఉచిత మెటాబాలిక్ సాధనాలు",
    ta: "இலவச வளர்சிதை மாற்ற கருவிகள்",
  };
  const label = labels[lang] ?? labels.en;

  const list = trials
    .map((t) => `- **${t.title}** (PMID: ${t.pmid}${t.year ? `, ${t.year}` : ""})${t.snippet ? ` — ${t.snippet}` : ""}`)
    .join("\n");

  return `
# MCT / ${query}: Trial & Evidence Snapshot

## Introduction
Below are selected PubMed results for MCT-related research. This is for awareness only; always consult your physician for personalized advice.

## Selected Evidence
${list}

## Practical Takeaway
Use evidence to inform shared decision-making with your care team. For free metabolic tools: ${url}

---
🔗 ${label}: ${url}

---
*Dr. Muddu Surendra Nehru, MD*  
*HOMA Clinic, Gachibowli, Hyderabad*
`.trim();
}

/**
 * Get MCT/trial content: PubMed → cache → safe template. Website link in every path.
 */
export async function getMctContent(
  query: string,
  options: { language?: string } = {}
): Promise<string> {
  const key = `mct:${query.trim().toLowerCase()}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.content;

  const trials = await fetchFromPubMed(query);
  const language = options.language ?? "en";

  let content: string;
  if (trials && trials.length > 0) {
    content = buildContentFromTrials(query, trials, language);
  } else {
    content = safeTemplate(query);
  }

  cache.set(key, { content, ts: Date.now() });
  return content;
}
