import Link from "next/link";

export default function Step9Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-indigo-900 mb-2">Step 9: Education</h1>
        <p className="text-gray-600 mb-6">MCQs, Gamma slides, CME content. Coming next.</p>
        <Link href="/step8" className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300">
          ← Back to Step 8
        </Link>
      </div>
    </div>
  );
}
