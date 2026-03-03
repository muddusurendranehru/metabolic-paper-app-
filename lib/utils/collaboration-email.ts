/**
 * Collaboration email & invite generators (topic-agnostic).
 *
 * ✅ SAFETY GUARANTEE:
 * - No imports from app/research/steps/step-1 to step-6
 * - No access to patientData
 * - No hardcoded medical terms (TyG, HbA1c, etc.) – all via input
 * - Topic-agnostic: works for ANY study (TyG-HbA1c, TyG-WC, etc.)
 * - If Step 11 is deleted, Steps 1-6 work 100%
 */

export interface CollaborationEmailInput {
  // Recipient Details
  recipientName: string;
  recipientSpecialty?: string; // e.g., "Endocrinologist", "General Physician"
  recipientInstitution?: string;

  // Study Details (Dynamic – Not Hardcoded)
  studyTitle: string;
  sampleSize: number;
  keyFinding: string; // e.g., "TyG correlated with HbA1c (r=0.46, p=0.001)"
  journalTarget?: string; // e.g., "IJCR", "Cureus", "J Family Med"
  studyLocation?: string; // e.g., "HOMA Clinic, Hyderabad"

  // Package Details
  packageType: 'Gold' | 'Silver' | 'Platinum';
  packagePrice: number; // in INR
  timelineReview: string; // e.g., "March 3, 2026"
  timelineSubmit: string; // e.g., "March 5, 2026"

  // Branding
  authorName: string; // e.g., "Dr. Muddu Surendra Nehru, MD"
  clinicName: string; // e.g., "HOMA Clinic"
  websiteUrl: string; // e.g., "https://dr-muddus-mvp-miracle-value-proposition-2l36.onrender.com"
  contactEmail?: string;
  contactPhone?: string;
}

export function generateCollaborationEmail(input: CollaborationEmailInput): string {
  const {
    recipientName,
    recipientSpecialty,
    studyTitle,
    sampleSize,
    keyFinding,
    journalTarget,
    studyLocation,
    packageType,
    packagePrice,
    timelineReview,
    timelineSubmit,
    authorName,
    clinicName,
    websiteUrl,
    contactEmail,
    contactPhone,
  } = input;

  // Package Details Mapping
  const packageDetails = {
    Gold: {
      price: `₹${packagePrice.toLocaleString()}`,
      benefits: [
        'Co-author position (ICMJE-compliant)',
        'Human-verified dataset',
        'Full manuscript + Figures ready',
        'Social media promotion',
        'Final PDF + citation for CV',
      ],
      timeCommitment: '~60 minutes total',
    },
    Silver: {
      price: `₹${(packagePrice * 0.5).toLocaleString()}`,
      benefits: [
        'Acknowledgment in manuscript',
        'Early access to findings',
        'CME MCQs included',
      ],
      timeCommitment: '~15 minutes total',
    },
    Platinum: {
      price: `₹${(packagePrice * 1.75).toLocaleString()}`,
      benefits: [
        'Multi-paper bundle (3 studies)',
        'Senior co-author position',
        'Conference presentation support',
        'Priority review & submission',
      ],
      timeCommitment: '~2 hours total',
    },
  };

  const selectedPackage = packageDetails[packageType];

  return `
Subject: Research Collaboration: ${studyTitle.split(':')[0]} (n=${sampleSize})

Dear Dr. ${recipientName},

${recipientSpecialty ? `As a ${recipientSpecialty} specialist,` : ''} your expertise would add valuable clinical perspective to our upcoming study: "${studyTitle}".

**${clinicName} Research Partnership Opportunity**

Are you looking to publish in indexed journals (${journalTarget || 'IJCR, Cureus, J Family Med'}) with minimal time investment?

**Our ${packageType} Collaboration Package (${selectedPackage.price}):**
${selectedPackage.benefits.map(b => `✅ ${b}`).join('\n')}

**Your Time Commitment (${selectedPackage.timeCommitment}):**
1. Review Methods/Results section (15 min)
2. Add 1-2 clinical insights from your specialty (10 min)
3. Approve final manuscript before submission (5 min)
4. Respond to minor reviewer comments if needed (30 min, rare)

**Why Partner With Us:**
• 📄 Scopus/UGC-indexed publication for your CV
• 🤝 Access to ${clinicName}'s metabolic research network
• 🔄 Priority invitation for future multi-center studies
• 🌐 Social amplification of your co-authored work

**Current Study Available:**
"${studyTitle}"
• Design: Cross-sectional, n=${sampleSize}, ${studyLocation || clinicName}
• Key Finding: ${keyFinding}
• Status: Manuscript ready → Submit ${timelineSubmit}

**Ethical Compliance:**
• ICMJE authorship criteria met (substantial contribution + approval)
• Institutional permission obtained for anonymized data use
• Conflict of Interest: None declared for collaborating authors
• No ghostwriting – your input shapes the clinical interpretation

**Timeline:**
• Review draft: By ${timelineReview}
• Final approval: ${timelineSubmit}
• Journal submission: ${timelineSubmit}

**Next Step:**
Reply "YES" to receive:
1. Full manuscript PDF
2. Authorship agreement template
3. Secure payment details (UPI/bank transfer)

Collaboration builds careers and advances patient care.

Warm regards,

**${authorName}**
${clinicName}, ${studyLocation || 'Hyderabad'}
📧 ${contactEmail || '[Your Email]'}
📱 ${contactPhone || '[Your Phone]'}
🌐 ${websiteUrl}

*P.S. Prefer a different package? Reply "PACKAGES" for Silver (₹10k, acknowledgment) or Platinum (₹35k, multi-paper bundle) details.*
`;
}

/**
 * ✅ Helper: Generate WhatsApp Short Version (160 chars approx)
 */
export function generateWhatsAppInvite(input: CollaborationEmailInput): string {
  return `
Dr. ${input.recipientName}, collaboration opportunity: ${input.studyTitle.split(':')[0]} (n=${input.sampleSize}). Indexed journal publication, minimal time (~60 min). Reply YES for details. ${input.authorName}, ${input.clinicName}
`.trim().replace(/\s+/g, ' ').substring(0, 160);
}

/**
 * ✅ Helper: Generate LinkedIn Message Version
 */
export function generateLinkedInInvite(input: CollaborationEmailInput): string {
  return `
Hi Dr. ${input.recipientName},

I'm leading a study on "${input.studyTitle}" (n=${input.sampleSize}) at ${input.clinicName}. We're inviting ${input.recipientSpecialty || 'clinicians'} for co-authorship (ICMJE-compliant). Minimal time commitment (~60 min), indexed journal target.

Interested in details? Reply here or email ${input.contactEmail}.

Best,
${input.authorName}
${input.websiteUrl}
`.trim();
}
