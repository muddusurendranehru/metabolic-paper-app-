import Link from "next/link";

/** Step 9 – Medical Education: MCQ generator, Gamma slides. */
export default function Step9Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <nav className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link href="/research/steps/step-8" className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 font-medium">
            ← Step 8
          </Link>
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">✅ NEW</span>
          <h1 className="text-2xl font-bold text-indigo-900 mt-2">Step 9: Medical Education</h1>
          <p className="text-gray-600 mt-2">MCQ generator, Gamma slide deck. Use mcq-generator and gamma-slides in this step.</p>
          <Link href="/research" className="mt-6 inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700">
            Back to Research
          </Link>
        </div>
      </div>
    </div>
  );
}
