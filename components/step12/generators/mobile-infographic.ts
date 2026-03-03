/*
 * SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - No hardcoded medical terms (TyG, HbA1c, etc.) – all via input
 * - Topic-agnostic: works for ANY medical topic
 * - If Step 12 extensions are deleted, Steps 1-6 work 100%
 */
/**
 * Step 12 – mobile infographic prompt. Imports ONLY from @/lib/utils/step12.
 * Portrait 1080x1920 (9:16), mobile-first. Topic-agnostic.
 * Uses pasted/source text when available so the prompt reflects real content (e.g. eggs, diabetes).
 */

import type { Step12Input } from "@/lib/utils/step12";
import { extractPlainText, extractSnippet, STEP12_DEFAULT_WEBSITE_URL, STEP12_DEFAULT_CLINIC } from "@/lib/utils/step12";

type MobileInfographicInput = Step12Input & {
  authorName?: string;
  clinic?: string;
  websiteUrl?: string;
};

function getSourceText(input: MobileInfographicInput): string {
  const raw =
    input.sourceType === "from-scratch"
      ? input.topic
      : (input.pastedText ?? input.topic ?? "");
  return extractPlainText(raw) || input.topic || "";
}

function getProblemStatement(topic: string): string {
  return "Many people misunderstand " + topic + ".";
}
function getScienceSummary(topic: string): string {
  return "Current evidence suggests " + topic + " plays a role in metabolic health.";
}
function getSolutionStatement(topic: string): string {
  return "Here's how to approach " + topic + " safely.";
}

function problemFromSource(sourceText: string, topic: string): string {
  if (!sourceText || sourceText.length < 60) return getProblemStatement(topic);
  const snippet = extractSnippet(sourceText, 200);
  return snippet.length >= 30 ? (snippet.endsWith(".") ? snippet : snippet + ".") : getProblemStatement(topic);
}

function scienceFromSource(sourceText: string, topic: string): string {
  if (!sourceText || sourceText.length < 80) return getScienceSummary(topic);
  const start = sourceText.length > 250 ? 200 : 0;
  const snippet = sourceText.slice(start, start + 400).trim();
  const use = snippet.length > 50 ? extractSnippet(snippet, 350) : getScienceSummary(topic);
  return use || getScienceSummary(topic);
}

function solutionFromSource(sourceText: string, topic: string): string {
  if (!sourceText || sourceText.length < 80) return getSolutionStatement(topic);
  const tail = sourceText.slice(-500).trim();
  const snippet = extractSnippet(tail, 280);
  return snippet.length >= 30 ? (snippet.endsWith(".") ? snippet : snippet + ".") : getSolutionStatement(topic);
}

/** Extract 2–4 short key points from the middle of the source for KEY FACTS cards. */
function keyFactsFromSource(sourceText: string, topic: string): string[] {
  if (!sourceText || sourceText.length < 100) return [getScienceSummary(topic)];
  const mid = sourceText.slice(100, sourceText.length - 100).trim();
  const sentences = mid.split(/(?<=[.!?])\s+/).filter(Boolean);
  const facts = sentences.slice(0, 4).map((s) => extractSnippet(s, 120));
  return facts.length > 0 ? facts : [getScienceSummary(topic)];
}

export function generateMobileInfographicPrompt(input: MobileInfographicInput): string {
  const topic = input.topic || "Medical topic";
  const sourceText = getSourceText(input);
  const author = input.authorName ?? "Dr. Muddu Surendra Nehru, MD";
  const clinic = input.clinic ?? STEP12_DEFAULT_CLINIC;
  const url = input.websiteUrl ?? STEP12_DEFAULT_WEBSITE_URL;
  const displayUrl = url.replace(/^https?:\/\//, "") || "homaclinic.in";

  const problem = problemFromSource(sourceText, topic).substring(0, 120);
  const science = scienceFromSource(sourceText, topic);
  const solution = solutionFromSource(sourceText, topic);
  const keyFacts = keyFactsFromSource(sourceText, topic);

  const keyFactsBlurb =
    keyFacts.length === 1
      ? JSON.stringify(keyFacts[0])
      : keyFacts.map((f, i) => `Point ${i + 1}: ${JSON.stringify(f)}`).join(". ");

  const parts = [
    'Create a vertical mobile infographic (1080x1920px, 9:16 aspect ratio) about "' + topic + '".',
    "",
    "LAYOUT (Top to Bottom):",
    "1. HEADER (15% height): Bold title \"" + topic + "\", subtitle \"Evidence-Based Guide\", background medical blue gradient (#1E40AF to #3B82F6), white text, Montserrat Bold font.",
    "2. PROBLEM SECTION (20% height): Icon warning/alert. Text: " + JSON.stringify(problem) + ". Background light yellow (#FEF3C7). Dark text for readability.",
    "3. KEY FACTS (35% height): 3-4 bullet points with icons in rounded cards (white, shadow). " + keyFactsBlurb + ". (condensed, one idea per card).",
    "4. SOLUTION/ACTION (20% height): Checklist format. Green background (#D1FAE5). Text: " + JSON.stringify(solution) + ". Include Dosage/Timing/Monitoring if applicable.",
    "5. FOOTER (10% height): " + JSON.stringify(author) + ", " + JSON.stringify(clinic) + ", Website: " + JSON.stringify(displayUrl) + ". Small text, professional.",
    "",
    "DESIGN SPECS: Orientation PORTRAIT (vertical 9:16). Resolution 1080x1920 pixels. Color scheme Medical blue (#1E40AF), green (#10B981), yellow (#F59E0B). Fonts Montserrat (headers), Open Sans (body). Generous white space. Icons flat, modern, medical. NO landscape. Text min 16px. High contrast. STYLE: Professional medical infographic, clean, modern, trustworthy. MOBILE-OPTIMIZED: All text readable on phone without zooming.",
  ];
  return parts.join("\n");
}
