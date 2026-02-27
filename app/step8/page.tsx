import Link from "next/link";

export default function Step8Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-indigo-900 mb-2">Step 8: Social Media</h1>
        <p className="text-gray-600 mb-6">Twitter thread, LinkedIn, YouTube script, infographics. Coming next.</p>
        <Link href="/step7" className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300">
          ← Back to Step 7
        </Link>
      </div>
    </div>
  );
}
