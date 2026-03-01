/**
 * Step 13 – Collaboration Admin Panel (SAFE, ISOLATED).
 * DO NOT modify app/research/steps/step-1 through step-6.
 * No patient data – ONLY author metadata (name, email, institution, medical reg no/year/state).
 */

import Link from "next/link";
import AuthorTable from "@/components/admin/AuthorTable";
import CollaborationForm from "@/components/admin/CollaborationForm";
import type { AuthorSubmission } from "@/lib/utils/admin/author-schema";

export default function AdminCollaborationPage() {
  const submissions: AuthorSubmission[] = [];
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
        <p className="text-sm text-gray-600 mb-6">Author submissions only. No patient data; author metadata (including medical registration number, year, state).</p>

        <p className="text-sm text-gray-600 mb-4">
          <a href="https://forms.gle/N2oi4oJaYhVMu2NBA" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium">
            HOMA Clinic Research Collaboration – Author Details (Google Form) →
          </a>
        </p>

        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Author form (embedded)</h2>
          <CollaborationForm />
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Submissions</h2>
          <AuthorTable submissions={submissions} />
        </section>
      </div>
    </div>
  );
}
