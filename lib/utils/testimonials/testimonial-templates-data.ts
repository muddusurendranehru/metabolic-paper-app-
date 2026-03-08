/*
 * STEP 12: 30 Diabetes Complication Topics (Patient Testimonial Templates)
 * Data file only. No imports from app/research, /ai/notebook/, or step12.
 * Generic composite testimonials – no real patient data.
 */

export interface TestimonialTemplateRow {
  topic: string;
  hook: string;
  middle: string;
  close: string;
  footer: string;
}

const FOOTER =
  "HOMA Clinic | Dr. Muddu Surendra Nehru, MD | For information only – not medical advice.";
const CLOSE =
  "Talk to your doctor before any change. Visit HOMA Clinic website for more.";
const MIDDLE =
  "Everyone's body is different. For me, following the plan and coming for follow-ups helped. I track my numbers and stay in touch with the clinic. This is not a guarantee for anyone else—just what worked for me.";

function hook(topic: string): string {
  return `After my check-up, I wanted to share a bit about my ${topic} experience—no medical advice, just my story.`;
}

export const TESTIMONIAL_TEMPLATES_30: TestimonialTemplateRow[] = [
  { topic: "TyG index + waist reduction", hook: hook("TyG index and waist reduction"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Weight loss + energy improvement", hook: hook("weight loss and energy improvement"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Blood sugar + heart problem", hook: hook("blood sugar and heart"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "HbA1c reduction journey", hook: hook("HbA1c reduction"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "PCOS + insulin resistance", hook: hook("PCOS and insulin resistance"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Neuropathy + pain management", hook: hook("neuropathy and pain management"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Kidney health + diabetes", hook: hook("kidney health and diabetes"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Eye health + retinopathy prevention", hook: hook("eye health and retinopathy prevention"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Foot care + circulation improvement", hook: hook("foot care and circulation"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Sleep + diabetes management", hook: hook("sleep and diabetes management"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Stress + blood sugar control", hook: hook("stress and blood sugar control"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Cholesterol + metabolic health", hook: hook("cholesterol and metabolic health"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Blood pressure + diabetes", hook: hook("blood pressure and diabetes"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Fatty liver + insulin resistance", hook: hook("fatty liver and insulin resistance"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Post-meal sugar spikes", hook: hook("post-meal sugar spikes"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Morning fasting sugar control", hook: hook("morning fasting sugar control"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Medication reduction journey", hook: hook("medication reduction"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Pregnancy + gestational diabetes", hook: hook("pregnancy and gestational diabetes"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Senior diabetes management (60+)", hook: hook("senior diabetes management"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Young adult diabetes (20-40)", hook: hook("young adult diabetes"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Vegetarian diet + diabetes control", hook: hook("vegetarian diet and diabetes control"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Non-veg diet + diabetes balance", hook: hook("non-veg diet and diabetes balance"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Festival season sugar management", hook: hook("festival season sugar management"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Travel + diabetes control", hook: hook("travel and diabetes control"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Work stress + metabolic health", hook: hook("work stress and metabolic health"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Post-COVID diabetes management", hook: hook("post-COVID diabetes management"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Thyroid + diabetes combination", hook: hook("thyroid and diabetes"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Joint pain + diabetes", hook: hook("joint pain and diabetes"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Digestion + blood sugar", hook: hook("digestion and blood sugar"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
  { topic: "Overall metabolic transformation", hook: hook("overall metabolic transformation"), middle: MIDDLE, close: CLOSE, footer: FOOTER },
];
