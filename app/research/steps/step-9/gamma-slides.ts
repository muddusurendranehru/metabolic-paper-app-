/**
 * Step 9 – Gamma.app slide deck outline from paper.
 * Output can be pasted into Gamma or used as a brief.
 */

export interface GammaSlideOptions {
  title: string;
  abstract: string;
  keyFindings: string[];
  slideCount?: number;
}

/** Generate a short slide outline for Gamma (placeholder). */
export function generateGammaSlides(opts: GammaSlideOptions): string[] {
  const { title, abstract, keyFindings, slideCount = 6 } = opts;
  const slides: string[] = [
    `Title: ${title}`,
    "Background: TyG index and HbA1c in Indian adults.",
    `Abstract: ${abstract.slice(0, 200)}...`,
    "Key findings:",
    ...keyFindings.map((f) => `• ${f}`),
    "Conclusion: TyG as practical screening tool; implications for practice.",
  ];
  return slides.slice(0, slideCount);
}
