import Link from "next/link";

/**
 * Paper 2 (TyG & Waist: 60-Patient Study) – SUBMITTED.
 * READ-ONLY: Track submission status only. No editing, no export.
 */
export default function SubmittedPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-indigo-900">Paper 2: TyG &amp; Waist: 60-Patient Study</h2>
          <p className="text-sm text-blue-700 font-medium">📤 SUBMITTED (manuscript written)</p>
          <p className="text-xs text-gray-600">🔒 READ-ONLY: Track submission status only</p>
        </div>
        <Link
          href="/research#write"
          className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 text-sm font-medium"
        >
          → Paper 3 (Active)
        </Link>
      </div>

      <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="text-lg font-bold text-amber-900 mb-2">TyG &amp; Waist: 60-Patient Study</h3>
        <p className="text-sm text-amber-800 font-medium mb-1">📤 SUBMITTED (manuscript written)</p>
        <p className="text-sm text-amber-700">🔒 READ-ONLY: Track submission status only. No edits or export here.</p>
      </div>

      <div className="mt-6 p-4 bg-white border rounded-lg text-sm text-gray-600">
        <p>Paper 1 is published (JCCP 2025). Paper 2 is submitted. Paper 3 (TyG &amp; HbA1c) is the active workspace for manuscript generation and export.</p>
      </div>
    </div>
  );
}
