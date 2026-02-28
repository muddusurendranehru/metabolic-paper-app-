import Link from "next/link";
import Step11ContentAmplification from "@/components/step11/Step11ContentAmplification";

export default function Step11Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 font-medium"
          >
            ← Home
          </Link>
          <Link
            href="/step9"
            className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 font-medium"
          >
            Step 9: Education
          </Link>
          <Link
            href="/step12"
            className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-medium"
          >
            Step 12: Neutral Content
          </Link>
        </div>
      </nav>
      <Step11ContentAmplification />
    </div>
  );
}
