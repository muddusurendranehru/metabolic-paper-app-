import Link from "next/link";
import Step7QualityAssurance from "@/components/step7/Step7QualityAssurance";

/** Step 7 – Quality APIs: plagiarism, grammar, journal format. */
export default function Step7Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link href="/research" className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200 font-medium">
            ← Research
          </Link>
          <Link href="/research/steps/step-6" className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 font-medium">
            Step 6: Journal Submission
          </Link>
        </div>
      </nav>
      <Step7QualityAssurance />
    </div>
  );
}
