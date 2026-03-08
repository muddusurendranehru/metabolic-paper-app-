/**
 * AI Testimonials – script builder for patient review videos.
 * Uses lib/utils/testimonials only. No research steps, no patient data.
 */

import { generatePatientReviewScript, type TestimonialScriptInput } from "@/lib/utils/testimonials/review-generator";

export type { TestimonialScriptInput };

/**
 * Build testimonial script for the testimonials page.
 */
export function buildTestimonialScript(input: TestimonialScriptInput): string {
  return generatePatientReviewScript(input);
}
