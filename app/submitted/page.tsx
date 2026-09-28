import Link from "next/link";

/**
 * Paper 2 (TyG-WC & Insulin Resistance, 50 patients) - PUBLISHED in IJCPR 2026.
 * READ-ONLY page. (Route name /submitted kept so old links still work.)
 */
export default function SubmittedPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-indigo-900">Paper 2: TyG-WC Index &amp; Insulin Resistance</h2>
          <p className="text-sm text-green-700 font-medium">PUBLISHED (IJCPR 2026)</p>
        </div>
        <Link
          href="/research#write"
          className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 text-sm font-medium"
        >
          Back to Research
        </Link>
      </div>

      <div className="p-6 bg-green-50 border border-green-200 rounded-lg space-y-2">
        <h3 className="text-lg font-bold text-green-900">
          Waist Circumference-Triglyceride-Glucose Index as a Predictor of Central Obesity-Linked Dyslipidemia and Insulin Resistance: A Clinical Study of 50 Patients in Urban India
        </h3>
        <p className="text-sm text-green-800">Muddu Surendra Nehru, Eedarala Venkata Sathyanarayana, Thousif Ahmed, Rakesh, Naresh</p>
        <p className="text-sm text-green-800">International Journal of Current Pharmaceutical Review and Research 2026; 18(2): 826-833</p>
        <p className="text-sm">
          <a href="https://doi.org/10.25258/ijcpr.18.2.136" target="_blank" rel="noopener noreferrer" className="text-green-700 underline">DOI: 10.25258/ijcpr.18.2.136</a>
        </p>
      </div>

      <div className="mt-6 p-4 bg-white border rounded-lg text-sm text-gray-700 space-y-2">
        <p className="font-semibold">Published papers</p>
        <p>1. TyG &amp; Metabolic Risk: NAFLD Perspective. JCCP 2025. <a href="https://doi.org/10.61336/jccp/25-08-50" target="_blank" rel="noopener noreferrer" className="underline">DOI</a></p>
        <p>2. TyG-WC Index &amp; Insulin Resistance (50 patients). IJCPR 2026;18(2):826-833. <a href="https://doi.org/10.25258/ijcpr.18.2.136" target="_blank" rel="noopener noreferrer" className="underline">DOI</a></p>
        <p>3. Association of TyG Index with HbA1c Levels in Adults (74 patients). International Journal of Medicine 2026;8(2). <a href="https://doi.org/10.61336/im/26-3-10" target="_blank" rel="noopener noreferrer" className="underline">DOI</a></p>
      </div>
    </div>
  );
}