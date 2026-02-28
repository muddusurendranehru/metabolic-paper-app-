/**
 * Step 12 – video assets generator. Imports ONLY from @/lib/utils/step12.
 * Topic-agnostic: no hardcoded TyG/HbA1c/Waist, no research metrics, no patient data.
 * Produces: YouTube script (60s) + HyperNatural JSON prompt + Grok prompt.
 * When pastedText is provided, script sections use that content for richer output.
 */

import type { Step12Input } from "@/lib/utils/step12";
import { extractPlainText, extractSnippet, STEP12_DEFAULT_WEBSITE_URL, STEP12_DEFAULT_CLINIC } from "@/lib/utils/step12";

/** Optional fields for CTA/branding; not on base Step12Input. */
type VideoInput = Step12Input & { websiteUrl?: string; clinic?: string };

export interface VideoAssets {
  youtubeScript: string;
  hyperNaturalPrompt: string;
  grokPrompt: string;
}

/** Get source text from input (pasted or topic). No patientData. */
function getSourceText(input: VideoInput): string {
  const raw =
    input.sourceType === "from-scratch"
      ? input.topic
      : (input.pastedText ?? input.topic ?? "");
  return extractPlainText(raw) || input.topic || "";
}

export function generateVideoAssets(input: VideoInput): VideoAssets {
  const url = input.websiteUrl ?? STEP12_DEFAULT_WEBSITE_URL;
  const clinic = input.clinic ?? STEP12_DEFAULT_CLINIC;
  const sourceText = getSourceText(input);

  const hook = getHookLine(input.topic, sourceText);
  const problem = getProblemLine(input.topic, sourceText);
  const science = getScienceLine(input.topic, sourceText);
  const solution = getSolutionLine(input.topic, sourceText);

  return {
    youtubeScript: `
[0:00-0:05] HOOK:
"${hook}"
[Visual: ${getVisualSuggestion(input.topic)}]

[0:05-0:15] PROBLEM:
"${problem}"
[Visual: ${getProblemVisual()}]

[0:15-0:35] SCIENCE:
"${science}"
[Visual: ${getScienceVisual()}]

[0:35-0:50] SOLUTION:
"${solution}"
[Visual: ${getSolutionVisual()}]

[0:50-0:60] CTA:
"${getCallToAction(url)}"
[Visual: ${getCTAVisual()}]
`.trim(),

    hyperNaturalPrompt: `
{
  "video_type": "educational",
  "duration": "60_seconds",
  "style": "professional_medical",
  "voice": "neutral_${input.audience === "patients" ? "friendly" : "authoritative"}",
  "scenes": [
    {
      "timestamp": "0-5s",
      "visual": "${getVisualSuggestion(input.topic)}",
      "text_overlay": "${input.topic.substring(0, 50)}...",
      "voiceover": "${escapeJson(hook)}"
    },
    {
      "timestamp": "5-15s",
      "visual": "Animation: ${getProblemVisual()}",
      "text_overlay": "${escapeJson(problem.substring(0, 100))}",
      "voiceover": "${escapeJson(problem)}"
    },
    {
      "timestamp": "15-35s",
      "visual": "Infographic: ${getScienceVisual()}",
      "text_overlay": "Evidence-Based Guidance",
      "voiceover": "${escapeJson(science)}"
    },
    {
      "timestamp": "35-50s",
      "visual": "Checklist: ${getSolutionVisual()}",
      "text_overlay": "Practical Steps",
      "voiceover": "${escapeJson(solution)}"
    },
    {
      "timestamp": "50-60s",
      "visual": "QR code + Subscribe button",
      "text_overlay": "${url}",
      "voiceover": "${getCallToAction(url)}"
    }
  ],
  "branding": {
    "logo": "${clinic}",
    "colors": ["#1E40AF", "#FFFFFF", "#F97316"],
    "font": "Montserrat"
  }
}
`.trim(),

    grokPrompt: `
Create a 60-second educational video script about "${input.topic}".
Target audience: ${input.audience}.
Tone: ${input.tone}.
Key points to cover:
1. Hook question
2. Problem statement
3. Evidence summary (no specific stats unless provided)
4. Practical solution
5. Call to action: ${url}
Include visual descriptions for each scene.
`.trim(),
  };
}

/**
 * HyperNatural prompt as formatted JSON (9:16 vertical, 60s).
 * Use for Reels/Shorts. Same helpers as generateVideoAssets.
 */
export function generateHyperNaturalPrompt(input: VideoInput): string {
  const url = input.websiteUrl ?? STEP12_DEFAULT_WEBSITE_URL;
  const clinic = input.clinic ?? STEP12_DEFAULT_CLINIC;
  const topic = input.topic || "Medical topic";
  const hook = `Did you know ${getHookQuestion(topic)}?`;
  const problem = getProblemStatement(topic);
  const science = getScienceSummary(topic);
  const solution = getSolutionStatement(topic);
  const cta = getCallToAction(url);
  const displayUrl = url.replace(/^https?:\/\//, "") || "homaclinic.in";

  const payload = {
    video_type: "educational_short",
    duration: "60_seconds",
    aspect_ratio: "9:16",
    style: "professional_medical",
    voice: input.audience === "patients" ? "friendly_explanatory" : "authoritative_clinical",
    background_music: "calm_inspirational",
    scenes: [
      {
        timestamp: "0-5s",
        visual: `Doctor in ${clinic} setting holding medical chart`,
        text_overlay: topic.substring(0, 50) + (topic.length > 50 ? "..." : ""),
        voiceover: hook,
        transition: "fade_in",
      },
      {
        timestamp: "5-15s",
        visual: "Animation: " + getProblemVisual(),
        text_overlay: problem.substring(0, 80),
        voiceover: problem,
        transition: "slide_left",
      },
      {
        timestamp: "15-35s",
        visual: "Infographic: " + getScienceVisual(),
        text_overlay: "Evidence-Based Insights",
        voiceover: science,
        transition: "zoom_in",
      },
      {
        timestamp: "35-50s",
        visual: "Checklist animation: " + getSolutionVisual(),
        text_overlay: "Practical Steps",
        voiceover: solution,
        transition: "slide_up",
      },
      {
        timestamp: "50-60s",
        visual: "QR code + " + clinic + " logo",
        text_overlay: displayUrl,
        voiceover: cta,
        transition: "fade_out",
      },
    ],
    branding: {
      logo: clinic,
      colors: ["#1E40AF", "#FFFFFF", "#10B981"],
      font: "Montserrat",
    },
    captions: {
      enabled: true,
      style: "bold_white",
      position: "bottom",
    },
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Grok-style 60s video prompt (scene-by-scene, 9:16, technical specs and branding).
 */
export function generateGrokVideoPrompt(input: VideoInput): string {
  const url = input.websiteUrl ?? STEP12_DEFAULT_WEBSITE_URL;
  const clinic = input.clinic ?? STEP12_DEFAULT_CLINIC;
  const topic = input.topic || "Medical topic";
  const hook = `Did you know ${getHookQuestion(topic)}?`;
  const problem = getProblemStatement(topic);
  const science = getScienceSummary(topic);
  const solution = getSolutionStatement(topic);
  const cta = getCallToAction(url);
  const displayUrl = url.replace(/^https?:\/\//, "") || "homaclinic.in";

  return `
Create a 60-second educational medical video about "${topic}".

TARGET AUDIENCE: ${input.audience === "patients" ? "General public/patients" : "Doctors/medical students"}
TONE: ${input.tone === "professional" ? "Authoritative and clinical" : "Friendly and accessible"}

VIDEO STRUCTURE:

SCENE 1 (0-5 seconds):
- Visual: Doctor in modern clinic setting, professional attire
- Text on screen: "${topic}"
- Voiceover: "${hook}"
- Mood: Engaging, attention-grabbing

SCENE 2 (5-15 seconds):
- Visual: Animated graphics showing ${getProblemVisual()}
- Text on screen: "${problem.substring(0, 100)}"
- Voiceover: "${problem}"
- Mood: Informative, serious

SCENE 3 (15-35 seconds):
- Visual: Medical infographic with ${getScienceVisual()}
- Text on screen: "Key Evidence"
- Voiceover: "${science}"
- Include: Statistics, icons, medical symbols
- Mood: Educational, trustworthy

SCENE 4 (35-50 seconds):
- Visual: Checklist animation showing ${getSolutionVisual()}
- Text on screen: "Practical Recommendations"
- Voiceover: "${solution}"
- Include: Step-by-step visual guide
- Mood: Actionable, positive

SCENE 5 (50-60 seconds):
- Visual: Clinic logo, QR code, contact information
- Text on screen: "${displayUrl}"
- Voiceover: "${cta}"
- Mood: Professional, inviting

TECHNICAL SPECIFICATIONS:
- Format: Vertical video (9:16 aspect ratio)
- Resolution: 1080x1920 pixels (optimized for mobile/Reels/Shorts)
- Frame rate: 30 fps
- Style: Modern medical animation, clean design
- Color scheme: Medical blue (#1E40AF), green (#10B981), white
- Font: Montserrat for headers, Open Sans for body text
- Background music: Calm, inspirational, non-intrusive
- Voice: ${input.audience === "patients" ? "Warm, friendly, explanatory" : "Professional, authoritative, clear"}
- Captions: Bold white text with black outline, positioned at bottom

BRANDING:
- Include ${clinic} logo in bottom right corner
- Use consistent color palette throughout
- Professional medical aesthetic

OPTIMIZATION:
- Optimized for: Instagram Reels, YouTube Shorts, TikTok
- Mobile-first design (all text readable on phone)
- High contrast for accessibility
- Fast-paced but not overwhelming
- Clear call-to-action at end

Generate this video with smooth transitions between scenes, professional medical imagery, and engaging visuals that maintain viewer attention throughout the 60-second duration.
`.trim();
}

// Helpers: topic-agnostic, no research metrics
function escapeJson(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
}

function getHookLine(topic: string, sourceText: string): string {
  const q = getHookQuestion(topic);
  if (!sourceText || sourceText.length < 40) return `Did you know ${q}`;
  const first = extractSnippet(sourceText, 80).replace(/\?+$/, "").trim();
  return first ? `Did you know ${first}?` : `Did you know ${q}`;
}

function getProblemLine(topic: string, sourceText: string): string {
  if (!sourceText || sourceText.length < 60) return getProblemStatement(topic);
  const snippet = extractSnippet(sourceText, 200);
  if (snippet.length < 30) return getProblemStatement(topic);
  return snippet.endsWith(".") ? snippet : snippet + ".";
}

function getScienceLine(topic: string, sourceText: string): string {
  if (!sourceText || sourceText.length < 80) return getScienceSummary(topic);
  const start = sourceText.length > 250 ? 200 : 0;
  const snippet = sourceText.slice(start, start + 400).trim();
  const use = snippet.length > 50 ? extractSnippet(snippet, 350) : getScienceSummary(topic);
  return use || getScienceSummary(topic);
}

function getSolutionLine(topic: string, sourceText: string): string {
  if (!sourceText || sourceText.length < 80) return getSolutionStatement(topic);
  const tail = sourceText.slice(-500).trim();
  const snippet = extractSnippet(tail, 280);
  if (snippet.length < 30) return getSolutionStatement(topic);
  return snippet.endsWith(".") ? snippet : snippet + ".";
}

function getHookQuestion(topic: string): string {
  return `the truth about ${topic}?`;
}
function getProblemStatement(topic: string): string {
  return `Many people misunderstand ${topic}.`;
}
function getScienceSummary(topic: string): string {
  return `Current evidence suggests ${topic} plays a role in metabolic health.`;
}
function getSolutionStatement(topic: string): string {
  return `Here's how to approach ${topic} safely.`;
}
function getCallToAction(url: string): string {
  return `Learn more at ${url}.`;
}
function getVisualSuggestion(topic: string): string {
  const t = topic.toLowerCase();
  if (/\b(ghee|oil|fat|butter)\b/.test(t)) return `Doctor holding ${topic.split(/\s+/)[0]} jar`;
  return `Doctor explaining ${topic}`;
}
function getProblemVisual(): string {
  return `Confused patient with question marks`;
}
function getScienceVisual(): string {
  return `Medical icons and data charts`;
}
function getSolutionVisual(): string {
  return `Checklist and healthy food`;
}
function getCTAVisual(): string {
  return `Website URL and clinic logo`;
}
