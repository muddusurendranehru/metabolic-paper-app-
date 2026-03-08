/*
 * SAFETY: No imports from app/research/steps, step12 generators, or clinical content.
 * Generic composite testimonial only (no real patient data).
 * If this file is deleted, app works 100%.
 */

const HOOK =
  "Anna, HOMA Insulin Resistance Clinics join ayina roju naa life change ayindi! // Dr. Muddu Surendra Nehru MD garu, DORA Diabetes Obesity Remission Academy director - // meeru chala mandiki badha solution icharu. //";
const MIDDLE =
  "Na TyG index high undi, waist kuda ekkuva. // 3 months lo waist 6 inches taggindi, energy unlimited! // Sugar control automatic, daily walking natural ayindi. //";
const CLOSE =
  "Diabetes bhayam over! HOMA method chala simple, chala effective. // Inka problems unte call cheyandi: 09963721999 // Dr. Muddu Surendra Nehru, HOMA Insulin Resistance Clinics";

/**
 * Returns the full testimonial script (HOOK + MIDDLE + CLOSE) for clipboard copy.
 * Paste into HyperNatural AI or similar.
 */
export function getSimpleTestimonialScript(): string {
  return `HOOK:\n${HOOK}\n\nMIDDLE:\n${MIDDLE}\n\nCLOSE:\n${CLOSE}`.trim();
}

const VIDEO_BRIEF_SCRIPT =
  `"Anna, HOMA Insulin Resistance Clinics join ayina roju naa life change ayindi! // 
Dr. Muddu Surendra Nehru MD garu, DORA Diabetes Obesity Remission Academy director - // 
meeru chala mandiki badha solution icharu. // 

Na TyG index high undi, waist kuda ekkuva. // 
3 months lo waist 6 inches taggindi, energy unlimited! // 
Sugar control automatic, daily walking natural ayindi. // 

Diabetes bhayam over! HOMA method chala simple, chala effective. // 
Inka problems unte call cheyandi: 09963721999 // 
Dr. Muddu Surendra Nehru, HOMA Insulin Resistance Clinics"`;

/**
 * Returns the full 45s HOMA video brief (photo, voice, script, 8 visuals, style, output).
 * Paste into HyperNatural AI or other video tools.
 */
export function getSimpleTestimonialVideoBrief(): string {
  return `PHOTO: Use uploaded patient photo as MAIN SPEAKER (smiling, natural Hyderabad clinic background).

VOICE: Warm Indian male/female, 40s, slight Telugu accent, conversational pace.

SCRIPT (45 seconds exactly - speak naturally with pauses):

${VIDEO_BRIEF_SCRIPT}

VISUALS (8 cues):
1. [Patient photo talking, lip sync perfect, warm smile]
2. [Clinic interior background: reception/waiting area]
3. [TyG graph animation: green arrow trending down]
4. [Before/after waist measurement visual: tape measure graphic]
5. [Happy patients walking montage: park/clinic corridor]
6. [Doctor garu consulting patient: respectful, professional]
7. [Phone number screen: 09963721999 large, clear]
8. [End screen: "HOMA Clinics 09963721999" + logo]

STYLE: Photographic realistic, warm clinic lighting, trustworthy doctor-patient feel.
DURATION: 45 seconds exactly.
END SCREEN: "HOMA Clinics 09963721999" (last 3 seconds)
OUTPUT: MP4 video, 1080p, vertical 9:16 for Shorts/Reels.`.trim();
}
