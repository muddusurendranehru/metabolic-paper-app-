/**
 * Step 7 – Plagiarism check API.
 * Status: pass (<15%), review (15–25%), fail (>25%).
 */

export type PlagiarismStatus = "pass" | "review" | "fail";

export function getPlagiarismStatus(percent: number): PlagiarismStatus {
  if (percent < 15) return "pass";
  if (percent <= 25) return "review";
  return "fail";
}
