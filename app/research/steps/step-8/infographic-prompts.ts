/**
 * Step 8 – Infographic prompts for design tools (Canva, etc.).
 */

export interface InfographicPromptOptions {
  title: string;
  mainStat: string;
  audience?: string;
}

/** Generate a short prompt for creating an infographic (placeholder). */
export function getInfographicPrompt(opts: InfographicPromptOptions): string {
  const { title, mainStat, audience = "clinicians and researchers" } = opts;
  return `Create a one-page infographic for: "${title}". Highlight: ${mainStat}. Audience: ${audience}. Use clear headings, one key number, and 2–3 bullet points.`;
}
