/**
 * Step 12 – letter to editor. Imports ONLY from @/lib/utils/step12.
 * Topic-agnostic; no research metrics, no patient data.
 */

import type { Step12Input, Step12Audience } from "@/lib/utils/step12";
import { STEP12_DEFAULT_CLINIC } from "@/lib/utils/step12";

type LetterInput = Step12Input & {
  journal?: string;
  clinic?: string;
  location?: string;
  authorName?: string;
  title?: string;
  email?: string;
  phone?: string;
};

function getProblemStatement(topic: string): string {
  return `Many people misunderstand ${topic}. Current evidence suggests this area deserves greater clinical attention.`;
}

function getScienceSummary(topic: string): string {
  return `current evidence suggests ${topic} plays a role in metabolic health and patient outcomes`;
}

function getFreeAlternative(topic: string): string {
  return `lifestyle and dietary approaches to ${topic} can be implemented at low cost`;
}

function getPracticalTip(topic: string, n: number): string {
  const tips: Record<number, string> = {
    1: `Consider ${topic} in routine assessment where clinically relevant.`,
    2: `Educate patients on evidence-based approaches to ${topic}.`,
    3: `Monitor and document outcomes when addressing ${topic} in practice.`,
  };
  return tips[n] ?? `Apply evidence-based guidance regarding ${topic}.`;
}

function getRecommendation(audience: Step12Audience, type: "screening" | "monitoring" | "treatment"): string {
  const byType = {
    screening: "Include in risk assessment when appropriate",
    monitoring: "Track relevant outcomes in follow-up",
    treatment: "Align management with current guidelines",
  };
  const base = byType[type];
  if (audience === "patients") return `${base}, with clear patient communication.`;
  if (audience === "students") return `${base}, and incorporate into teaching.`;
  return base + ".";
}

function getFirstReference(topic: string): string {
  return `Evidence on ${topic} – see current guidelines and systematic reviews.`;
}
function getSecondReference(topic: string): string {
  return `Clinical practice recommendations for ${topic}.`;
}
function getThirdReference(topic: string): string {
  return `Patient-centred approaches to ${topic}.`;
}

export function generateLetterToEditor(input: LetterInput): string {
  const topic = input.topic || "this topic";
  const journal = input.journal ?? "Medical Journal";
  const clinic = input.clinic ?? STEP12_DEFAULT_CLINIC;
  const location = input.location ?? "Hyderabad";
  const authorName = input.authorName ?? "Dr. Muddu Surendra Nehru, MD";
  const title = input.title ?? "Professor of Medicine";
  const email = input.email ?? "[Your Email]";
  const phone = input.phone ?? "[Your Phone]";
  const fullLocation = input.location ?? "Gachibowli, Hyderabad, Telangana, India";

  return `
To the Editor,
${journal}

Subject: ${topic} – Clinical Perspective

Dear Editor,

I am writing to share insights regarding ${topic.toLowerCase()}, based on clinical experience at ${clinic}, ${location}.

CLINICAL OBSERVATION:
${getProblemStatement(topic)}

In our practice, we have observed that ${getScienceSummary(topic)}. This has important implications for patient care, particularly in resource-limited settings where ${getFreeAlternative(topic)}.

KEY POINTS:
1. ${getPracticalTip(topic, 1)}
2. ${getPracticalTip(topic, 2)}
3. ${getPracticalTip(topic, 3)}

RECOMMENDATIONS:
Based on current evidence and clinical experience, I recommend:
• ${getRecommendation(input.audience, "screening")}
• ${getRecommendation(input.audience, "monitoring")}
• ${getRecommendation(input.audience, "treatment")}

CONCLUSION:
${topic} requires attention from clinicians and policymakers. Early identification and appropriate management can significantly improve patient outcomes.

I hope this letter stimulates discussion and encourages further research in this important area.

Sincerely,

${authorName}
${title}
${clinic}
${fullLocation}
Email: ${email}
Phone: ${phone}

Conflict of Interest: None declared
Funding: No external funding

References:
1. ${getFirstReference(topic)}
2. ${getSecondReference(topic)}
3. ${getThirdReference(topic)}
`.trim();
}
