/**
 * Step 8 – LinkedIn post generator from paper title and key findings.
 */

export interface LinkedInPostOptions {
  title: string;
  keyFindings: string[];
  hashtags?: string[];
}

/** Generate a LinkedIn post (placeholder). */
export function generateLinkedInPost(opts: LinkedInPostOptions): string {
  const { title, keyFindings, hashtags = ["Research", "MedicalResearch", "TyG", "HbA1c"] } = opts;
  const findings = keyFindings.map((f) => `• ${f}`).join("\n");
  return `📄 ${title}\n\nKey findings:\n${findings}\n\n#${hashtags.join(" #")}`;
}
