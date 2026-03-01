"use client";
/**
 * Step 12 only. Collaboration Tracker – Authors & co-authors.
 * SAFE: No patient data. Author metadata only. No imports from app/research or steps 1–11.
 * Recommended: Google Form (zero code risk). Optional ICMJE + DPDP checkboxes (local state only).
 */

import { useState } from "react";

const COLLABORATION_FORM_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_COLLABORATION_FORM_URL) ||
  "https://forms.gle/N2oi4oJaYhVMu2NBA";

const PRE_LAUNCH_ITEMS: { key: string; label: string }[] = [
  { key: "form", label: "Create Google Form → Copy Link" },
  { key: "test", label: "Test Form → Submit dummy data → Verify Google Sheet updates" },
  { key: "email", label: "Update Email Draft → Insert Form Link" },
  { key: "send", label: "Send to 1 trusted colleague → Test response time" },
  { key: "privacy", label: "Verify Privacy Policy (add to Form description if needed)" },
  { key: "backup", label: 'Backup Steps 1-6 → git commit -m "Pre-collaboration launch"' },
];

const EMAIL_DRAFT_WITH_FORM_LINK = `Subject: Research Collaboration: Indexed Journal Publication (TyG-HbA1c Study, n=74)

Dear Dr. [Last Name],

**HOMA Clinic Research Partnership Opportunity**

Are you looking to publish in indexed journals (IJCR, Cureus, J Family Med) with minimal time investment?

**Our Gold Collaboration Package (₹20,000):**
✅ Co-author position (your expertise formally credited)
✅ Human-verified dataset (n=74 patients, r=0.46, p=0.001)
✅ Complete manuscript + Figures + Tables ready for submission
✅ Social media promotion (Twitter/LinkedIn/Reels) to amplify reach
✅ Final PDF + citation for your CV/portfolio

**Your Time Commitment (≈60 minutes total):**
1. Review Methods/Results section (15 min)
2. Add 1-2 clinical insights from your specialty (10 min)
3. Approve final manuscript before submission (5 min)
4. Respond to minor reviewer comments if needed (30 min, rare)

**Why Partner With Us:**
• 📄 Scopus/UGC-indexed publication for your CV
• 🤝 Access to HOMA Clinic's metabolic research network
• 🔄 Priority invitation for future multi-center studies
• 🌐 Social amplification of your co-authored work

**Current Study Available:**
"Waist Circumference Predicts Lipotoxicity (TG≥220) AND Glucotoxicity (HbA1c≥8.0): ADA Risk Stratification"
• Design: Cross-sectional, n=74, HOMA Clinic Hyderabad
• Key Finding: TyG index correlates significantly with HbA1c (r=0.46, p=0.001)
• Status: Manuscript ready → Submit March 2026

**Next Step:**
1. **Fill Author Details Form:** [INSERT GOOGLE FORM LINK HERE]
2. Reply "YES" to confirm interest
3. We will send manuscript draft + agreement within 24 hours

**Timeline:**
• Form Submission: By March 1, 2026
• Review Draft: By March 3, 2026
• Journal Submission: March 5, 2026

**Ethical Compliance:**
• ICMJE authorship criteria met (substantial contribution + approval)
• Institutional permission obtained for anonymized data use
• Conflict of Interest: None declared for collaborating authors
• No ghostwriting – your input shapes the clinical interpretation

Collaboration builds careers and advances patient care.

Warm regards,

**Dr. Muddu Surendra Nehru, MD**
Professor of Medicine | HOMA Clinic, Gachibowli, Hyderabad
📧 [your-email@homaclinic.in]
📱 [WhatsApp Business Link]
🌐 https://dr-muddus-mvp-miracle-value-proposition-2l36.onrender.com

*P.S. Prefer a Silver Package (₹10k, acknowledgment only) or Platinum (₹35k, multi-paper bundle)? Reply "PACKAGES" for details.*`;

export default function CollaborationTrackerCard() {
  const [icmje, setIcmje] = useState(false);
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [preLaunch, setPreLaunch] = useState<Record<string, boolean>>(
    PRE_LAUNCH_ITEMS.reduce((acc, { key }) => ({ ...acc, [key]: false }), {})
  );
  const togglePreLaunch = (key: string) =>
    setPreLaunch((prev) => ({ ...prev, [key]: !prev[key] }));

  const copyEmailDraft = () => {
    navigator.clipboard?.writeText(EMAIL_DRAFT_WITH_FORM_LINK).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mt-8 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200">
      <h2 className="text-lg font-bold text-emerald-900 mb-3">👥 Collaboration Tracker – Authors</h2>
      <div className="text-sm text-emerald-800 space-y-2 mb-4">
        <p>✅ Recommended: Google Forms (zero code risk)</p>
        <p>✅ Safety: No patient data, only author metadata</p>
        <p>✅ Ethics: ICMJE compliance checkboxes below</p>
        <p>✅ Privacy: Consent checkboxes for DPDP Act compliance</p>
      </div>

      <div className="space-y-3 mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={icmje}
            onChange={(e) => setIcmje(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span>ICMJE authorship criteria acknowledged by collaborators</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={dpdpConsent}
            onChange={(e) => setDpdpConsent(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span>DPDP Act: consent obtained for use of contact/author details</span>
        </label>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-bold text-emerald-900 mb-2">Pre-collaboration launch checklist</h3>
        <ul className="space-y-2">
          {PRE_LAUNCH_ITEMS.map(({ key, label }) => (
            <li key={key}>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preLaunch[key] ?? false}
                  onChange={() => togglePreLaunch(key)}
                  className="rounded border-gray-300"
                />
                <span>{label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-bold text-emerald-900 mb-2">📧 Email draft (with form link)</h3>
        <p className="text-xs text-gray-600 mb-2">Copy-paste into your email draft. Replace [INSERT GOOGLE FORM LINK HERE], [Last Name], [your-email@homaclinic.in], [WhatsApp Business Link] as needed.</p>
        <pre className="p-3 bg-white border border-emerald-200 rounded text-xs text-gray-800 whitespace-pre-wrap max-h-64 overflow-y-auto mb-2">
          {EMAIL_DRAFT_WITH_FORM_LINK}
        </pre>
        <button
          type="button"
          onClick={copyEmailDraft}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
        >
          {copied ? "Copied!" : "Copy email draft"}
        </button>
      </div>

      <div className="text-sm font-semibold text-emerald-900 mb-2">Next: Create Form → Insert Link → Send First Email</div>
      {COLLABORATION_FORM_URL ? (
        <a
          href={COLLABORATION_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
        >
          Open collaboration form →
        </a>
      ) : (
        <p className="text-sm text-gray-600">
          Set <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_COLLABORATION_FORM_URL</code> to your Google Form link, or add the link manually when ready.
        </p>
      )}
    </div>
  );
}
