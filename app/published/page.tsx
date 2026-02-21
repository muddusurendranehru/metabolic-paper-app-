import Link from "next/link";
import { PublicationBadge } from "@/components/published/PublicationBadge";
import { Paper1View } from "@/components/published/Paper1View";

/**
 * Paper 1 (Published) – READ-ONLY.
 * Displays published paper info. No code changes to this page should alter data or allow editing.
 */
export default function PublishedPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-indigo-900">
            Paper 1: TyG &amp; Metabolic Risk: NAFLD Perspective
          </h2>
          <p className="text-sm text-green-700 font-medium">✅ PUBLISHED (JCCP 2025)</p>
          <p className="text-xs text-gray-600">🔒 READ-ONLY: Display DOI link only</p>
        </div>
        <Link
          href="/research#write"
          className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 text-sm font-medium"
        >
          → Paper 3 (Research)
        </Link>
      </div>

      <div className="mb-8">
        <PublicationBadge />
      </div>

      <div className="bg-white border rounded-lg shadow-sm p-8">
        <Paper1View />
      </div>
    </div>
  );
}
