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
  /** 45s video: topic-specific middle (70% English + 30% Telugu, patient-reported). Used with HOMA_45S_HOOK and HOMA_45S_CLOSE. */
  middle45s?: string;
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

/** Fixed HOOK for 45s video (0–12s). 70% English + 30% Telugu. */
export const HOMA_45S_HOOK =
  "Anna, HOMA Insulin Resistance Clinics join ayina roju naa life change ayindi! // Dr. Muddu Surendra Nehru MD garu, DORA director - meeru chala mandiki badha solution icharu. //";

/** Fixed CLOSE for 45s video (38–45s). */
export const HOMA_45S_CLOSE =
  "Diabetes bhayam over! HOMA method chala simple, chala effective. // Inka problems unte call cheyandi: 09963721999 // Dr. Muddu Surendra Nehru, HOMA Insulin Resistance Clinics";

/** Generic 45s middle when topic has no custom middle45s. */
const MIDDLE_45S_DEFAULT =
  "Na numbers track chesi, follow-up plan follow chesam. // Small changes: walking, diet, TyG tracking. // 2–3 months lo improvement feel ayindi, sugar stable. //";

export const TESTIMONIAL_TEMPLATES_30: TestimonialTemplateRow[] = [
  { topic: "TyG index + waist reduction", hook: hook("TyG index and waist reduction"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Na TyG index high undi, waist kuda ekkuva. // 3 months lo waist 6 inches taggindi, energy unlimited! // Sugar control automatic, daily walking natural ayindi. //" },
  { topic: "Weight loss + energy improvement", hook: hook("weight loss and energy improvement"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Na weight ekkuva, energy low undi. // Small changes: walking, portion control, TyG tracking. // 2 months lo 5 kg taggindi, energy unlimited ayindi! // Sugar stable, mood chala bagundi. //" },
  { topic: "Blood sugar + heart problem", hook: hook("blood sugar and heart"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Na sugar + heart rendu bhayam ga undedi. // TyG, waist, BP track chesam. // 3 months lo sugar stable, chest comfort bagundi. // Walking, stress management chala help ayindi. //" },
  { topic: "HbA1c reduction journey", hook: hook("HbA1c reduction"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Na HbA1c high undi. // Plan follow chesi, regular tests chesam. // 3 months lo HbA1c taggindi, doctor garu kuda happy. // Control lo pettadam possible ani telisindi. //" },
  { topic: "PCOS + insulin resistance", hook: hook("PCOS and insulin resistance"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Na periods irregular, weight increase, sugar fluctuate. // TyG index track chesi, diet + walking start chesam. // 3 months lo periods regular, weight taggindi, sugar stable. //" },
  { topic: "Neuropathy + pain management", hook: hook("neuropathy and pain management"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Na feet lo pain, numbness badha undedi. // Sugar control + nerve care plan start chesam. // 2 months lo pain taggindi, sleep bagundi. // Early care important ani telisindi. //" },
  { topic: "Kidney health + diabetes", hook: hook("kidney health and diabetes"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Kidney + sugar rendu track cheyali ani telisindi. // Diet, medicines, follow-up balance chesam. // Numbers stable unte kidney safe ga undochu. //" },
  { topic: "Eye health + retinopathy prevention", hook: hook("eye health and retinopathy prevention"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Eyes + sugar link undi ani doctor garu explain chesaru. // Sugar control + regular eye check start chesam. // Vision stable, bhayam taggindi. //" },
  { topic: "Foot care + circulation improvement", hook: hook("foot care and circulation"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Foot care daily routine lo pettam. // Proper shoes, walking, sugar control. // 2 months lo circulation better, pain taggindi. //" },
  { topic: "Sleep + diabetes management", hook: hook("sleep and diabetes management"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Sleep takkuva, sugar fluctuate ayedi. // Routine set chesi, sleep improve chesam. // Sleep bagunte sugar kuda control lo undi. //" },
  { topic: "Stress + blood sugar control", hook: hook("stress and blood sugar control"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Stress high unte sugar kuda high. // Walking, breathing, follow-up tho stress taggindi. // Sugar numbers kuda stable ayindi. //" },
  { topic: "Cholesterol + metabolic health", hook: hook("cholesterol and metabolic health"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Cholesterol + TyG rendu high undedi. // Diet, walking, tracking start chesam. // 3 months lo numbers improve, energy bagundi. //" },
  { topic: "Blood pressure + diabetes", hook: hook("blood pressure and diabetes"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "BP + sugar rendu track chesam. // Medicines + lifestyle balance chesam. // 3 months lo BP stable, sugar kuda control lo. //" },
  { topic: "Fatty liver + insulin resistance", hook: hook("fatty liver and insulin resistance"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Fatty liver + sugar link undi. // Weight, diet, TyG track chesi improve chesam. // Reports lo improvement chupinchindi. //" },
  { topic: "Post-meal sugar spikes", hook: hook("post-meal sugar spikes"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Tinnaka sugar ekkuva perugedi. // Portion, timing, walking change chesam. // 2 months lo post-meal numbers control lo. //" },
  { topic: "Morning fasting sugar control", hook: hook("morning fasting sugar control"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Early morning sugar high undedi. // Diet + medicine timing adjust chesam. // Fasting sugar stable ayindi. //" },
  { topic: "Medication reduction journey", hook: hook("medication reduction"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Medicines tagginchukovali ani goal set chesam. // Lifestyle improve ayaka doctor garu dose taggisaru. // Nenu kuda gradual reduction lo unna. //" },
  { topic: "Pregnancy + gestational diabetes", hook: hook("pregnancy and gestational diabetes"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Pregnancy lo sugar monitor cheyadam important. // Diet + walking + tracking follow chesam. // Baby + mother safe ga unnam. //" },
  { topic: "Senior diabetes management (60+)", hook: hook("senior diabetes management"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Age 60+ unna kuda numbers control lo pettachu. // Simple plan: walking, portion, regular check. // 2 months lo sugar stable, energy kuda bagundi. //" },
  { topic: "Young adult diabetes (20-40)", hook: hook("young adult diabetes"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Young age lo early control important. // Lifestyle change + tracking start chesam. // Future complications avoid cheskovachu ani telisindi. //" },
  { topic: "Vegetarian diet + diabetes control", hook: hook("vegetarian diet and diabetes control"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Vegetarian diet lo kuda balance possible. // Portion, timing, fiber track chesam. // Sugar control vegetarian food tho kuda ayindi. //" },
  { topic: "Non-veg diet + diabetes balance", hook: hook("non-veg diet and diabetes balance"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Non-veg + sugar balance cheskunnam. // Portion control, less oil, regular check. // Protein tho energy bagundi, sugar kuda stable. //" },
  { topic: "Festival season sugar management", hook: hook("festival season sugar management"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Festival time lo kuda control possible. // Small portions, timing, walking continue chesam. // Enjoy chesam kani numbers track lo pettam. //" },
  { topic: "Travel + diabetes control", hook: hook("travel and diabetes control"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Travel lo kuda sugar manage cheskunnam. // Medicines, snacks, walking plan chesi vellam. // Trip enjoy chesam, numbers stable. //" },
  { topic: "Work stress + metabolic health", hook: hook("work stress and metabolic health"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Work stress sugar meeda effect chestundi. // Break lo walking, breathing, routine set chesam. // Stress taggindi, TyG kuda improve ayindi. //" },
  { topic: "Post-COVID diabetes management", hook: hook("post-COVID diabetes management"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "COVID tarwata sugar ekkuva ayindi. // Recovery + sugar control plan follow chesam. // 3 months lo numbers normal range ki vachindi. //" },
  { topic: "Thyroid + diabetes combination", hook: hook("thyroid and diabetes"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Thyroid + sugar rendu unte careful ga undali. // Medicines + diet balance, regular tests. // Rendu control lo unte energy bagundi. //" },
  { topic: "Joint pain + diabetes", hook: hook("joint pain and diabetes"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Joint pain + sugar link undi. // Light walking, weight tagginchukuni improve chesam. // Pain taggindi, sugar kuda stable. //" },
  { topic: "Digestion + blood sugar", hook: hook("digestion and blood sugar"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "Digestion better ayite sugar kuda control lo undi. // Fiber, timing, probiotics try chesam. // Gut + sugar rendu improve ayindi. //" },
  { topic: "Overall metabolic transformation", hook: hook("overall metabolic transformation"), middle: MIDDLE, close: CLOSE, footer: FOOTER, middle45s: "TyG, weight, sugar, energy anni improve ayindi. // 3 months lo full transformation feel ayindi. // Life change ayindi anipinchindi, anna. //" },
];
