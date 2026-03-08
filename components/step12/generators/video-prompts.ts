/*
 * SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - No hardcoded medical terms (TyG, HbA1c, etc.) – all via input
 * - Topic-agnostic: works for ANY medical topic
 * - If Step 12 extensions are deleted, Steps 1-6 work 100%
 */
/**
 * Step 12 – video prompts (HyperNatural + Grok). Imports ONLY from @/lib/utils/step12 and local generators.
 * Re-exports and thin wrappers for AI video prompt generation.
 */

import type { Step12Input } from "@/lib/utils/step12";
import { generateVideoAssets, generateHyperNaturalPrompt, generateHyperNatural50sScript } from "./video-generator";

/** Input with optional CTA/branding; same as video-generator VideoInput. */
export type VideoPromptInput = Step12Input & { websiteUrl?: string; clinic?: string };

/**
 * Get HyperNatural-style JSON prompt for 60s educational video (template string).
 */
export function getHyperNaturalPrompt(input: VideoPromptInput): string {
  return generateVideoAssets(input).hyperNaturalPrompt;
}

/**
 * Get HyperNatural prompt as formatted JSON (9:16, educational_short, scenes + transitions + captions).
 */
export { generateHyperNaturalPrompt, generateHyperNatural50sScript } from "./video-generator";

/**
 * Get Grok-style text prompt for 60s educational video script.
 */
export function getGrokPrompt(input: VideoPromptInput): string {
  return generateVideoAssets(input).grokPrompt;
}

/**
 * Grok-style 60s video prompt (scene-by-scene, 9:16, technical specs and branding).
 */
export { generateGrokVideoPrompt } from "./video-generator";

/**
 * Get both HyperNatural and Grok prompts (and full YouTube script).
 */
export function getVideoPrompts(input: VideoPromptInput) {
  const assets = generateVideoAssets(input);
  return {
    hyperNatural: assets.hyperNaturalPrompt,
    grok: assets.grokPrompt,
    youtubeScript: assets.youtubeScript,
  };
}
