/**
 * Step 12 – platform-specific website injectors (blog footer, YouTube, handout).
 * Imports from @/lib/utils/step12 and ./translations. No patientData; no steps 1–6.
 */

import { WEBSITE_CONFIG, type Step12Language } from "@/lib/utils/step12";
import { getTranslation } from "./translations";

/**
 * Add footer with website link to content if not already present. Language-aware label.
 */
export function injectWebsiteLink(
  content: string,
  language: Step12Language = "en"
): string {
  const link = WEBSITE_CONFIG.url;
  const label = getTranslation(language, "freeTools");

  const linkFormats = {
    markdown: `[${label}](${link})`,
    html: `<a href="${link}" target="_blank">${label}</a>`,
    plain: link,
    twitter: link,
  };

  if (!content.includes(link)) {
    const footer = `

---
*Dr. Muddu Surendra Nehru, MD*  
*HOMA Clinic, Hyderabad*  
🔗 ${linkFormats.markdown}  
*Published: Coming soon*
`;
    return content.trimEnd() + footer;
  }

  return content;
}

/**
 * Prepend website link to top of YouTube description (critical for SEO).
 */
export function injectYouTubeDescription(description: string): string {
  const link = WEBSITE_CONFIG.url;
  const topLines = `
🔗 FREE CALCULATORS: ${link}

${description}
`.trim();
  return topLines;
}

/**
 * Append handout footer with URL and QR code.
 */
export function injectHandoutFooter(content: string): string {
  const link = WEBSITE_CONFIG.url;
  const qrCode = WEBSITE_CONFIG.qrCode(link);

  const footer = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 ${link}
[QR Code: ${qrCode}]

HOMA Clinic | Gachibowli, Hyderabad
© ${new Date().getFullYear()} – For educational purposes only
`;

  return content.trimEnd() + footer;
}
