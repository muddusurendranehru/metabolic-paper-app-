import Link from "next/link";

/** Step 2 – READ-ONLY. Verify. */
export default function Step2Page() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center border-2 border-gray-200">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">🔒 READ-ONLY</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Step 2: Verify</h1>
        <p className="text-gray-600 mt-2">Verify extracted data. Use main Research flow.</p>
        <Link href="/research" className="mt-6 inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700">
          Open Research (Steps 1–5)
        </Link>
      </div>
    </div>
  );
}
