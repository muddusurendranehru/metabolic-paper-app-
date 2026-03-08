/**
 * HOMA 45s testimonial video spec – full brief for Shorts/Reels.
 * Patient review ONLY. Use with uploaded patient photo as main speaker.
 */

const HOMA_PHONE = "09963721999";

export const HOMA_45S_VIDEO_SPEC = `
PHOTO: Use uploaded patient photo as MAIN SPEAKER (smiling, natural Hyderabad clinic background).

VOICE: Warm Indian male/female, 40s, slight Telugu accent, conversational pace.

SCRIPT (45 seconds exactly - speak naturally with pauses):

"Anna, HOMA Insulin Resistance Clinics join ayina roju naa life change ayindi! // 
Dr. Muddu Surendra Nehru MD garu, DORA Diabetes Obesity Remission Academy director - // 
meeru chala mandiki badha solution icharu. // 

Na TyG index high undi, waist kuda ekkuva. // 
3 months lo waist 6 inches taggindi, energy unlimited! // 
Sugar control automatic, daily walking cheyadam natural ayindi. // 

500+ patients la nenu kuda complete remission lo unna. // 
Diabetes bhayam over! HOMA method chala simple, chala effective. // 

Inka problems unte call cheyandi: ${HOMA_PHONE} // 
Dr. Muddu Surendra Nehru, HOMA Insulin Resistance Clinics"

VISUALS (8 cues):
1. [Patient photo talking, lip sync perfect, warm smile]
2. [Clinic interior background: reception/waiting area]
3. [TyG graph animation: green arrow trending down]
4. [Before/after waist measurement visual: tape measure graphic]
5. [Happy patients walking montage: park/clinic corridor]
6. [Doctor garu consulting patient: respectful, professional]
7. [Phone number screen: ${HOMA_PHONE} large, clear]
8. [End screen: "HOMA Clinics ${HOMA_PHONE}" + logo]

STYLE: Photographic realistic, warm clinic lighting, trustworthy doctor-patient feel.
DURATION: 45 seconds exactly.
END SCREEN: "HOMA Clinics ${HOMA_PHONE}" (last 3 seconds)

OUTPUT: MP4 video, 1080p, vertical 9:16 for Shorts/Reels.
`.trim();

/**
 * Get the full 45s HOMA testimonial video brief for copy/export.
 */
export function getHoma45sVideoSpec(): string {
  return HOMA_45S_VIDEO_SPEC;
}

/**
 * Get 45s brief with topic-specific script (linked to 30 diabetes complication topics).
 * Use when a topic is selected so "Copy full brief" includes the right script.
 */
export function getHoma45sVideoSpecWithScript(scriptBody: string): string {
  return `
PHOTO: Use uploaded patient photo as MAIN SPEAKER (smiling, natural Hyderabad clinic background).

VOICE: Warm Indian male/female, 40s, slight Telugu accent, conversational pace.

SCRIPT (45 seconds exactly - speak naturally with pauses):

${scriptBody.trim()}

VISUALS (8 cues):
1. [Patient photo talking, lip sync perfect, warm smile]
2. [Clinic interior background: reception/waiting area]
3. [TyG graph animation: green arrow trending down]
4. [Before/after waist measurement visual: tape measure graphic]
5. [Happy patients walking montage: park/clinic corridor]
6. [Doctor garu consulting patient: respectful, professional]
7. [Phone number screen: ${HOMA_PHONE} large, clear]
8. [End screen: "HOMA Clinics ${HOMA_PHONE}" + logo]

STYLE: Photographic realistic, warm clinic lighting, trustworthy doctor-patient feel.
DURATION: 45 seconds exactly.
END SCREEN: "HOMA Clinics ${HOMA_PHONE}" (last 3 seconds)

OUTPUT: MP4 video, 1080p, vertical 9:16 for Shorts/Reels.
`.trim();
}
