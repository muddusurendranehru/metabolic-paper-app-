import Link from "next/link";
import Step6JournalSubmission from "@/components/step6/Step6JournalSubmission";

export default function Step6Page() {
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
            href="/research#write"
            className="px-3 py-1.5 rounded-lg bg-violet-50 text-violet-800 border border-violet-200 hover:bg-violet-100 font-medium"
          >
            ✏️ Step 5: Write JCDR
          </Link>
        </div>
      </nav>
      <Step6JournalSubmission />
    </div>
  );
}
