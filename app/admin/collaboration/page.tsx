/**
 * Step 13 – Collaboration Admin Panel (SAFE, ISOLATED).
 * DO NOT modify app/research/steps/step-1 through step-6.
 * No patient data – ONLY author metadata. Submissions saved to data/step13-submissions.json.
 */

import Link from "next/link";
import CollaborationAdmin from "@/components/admin/CollaborationAdmin";
import ShareFormLinks from "@/components/admin/ShareFormLinks";

export default function AdminCollaborationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-sm text-indigo-600 hover:underline">
            ← Home
          </Link>
          <Link href="/step12" className="text-sm text-indigo-600 hover:underline">
            Step 12
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Step 13: Collaboration Admin Panel</h1>
        <p className="text-sm text-gray-600 mb-6">Author submissions only. No patient data; author metadata (including medical registration number, year, state). Saved to data/step13-submissions.json.</p>

        <p className="text-sm text-gray-600 mb-4">
          <a href="https://forms.gle/N2oi4oJaYhVMu2NBA" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium">
            HOMA Clinic Research Collaboration – Author Details (Google Form) →
          </a>
        </p>

        <ShareFormLinks />

        <CollaborationAdmin />
      </div>
    </div>
  );
}
