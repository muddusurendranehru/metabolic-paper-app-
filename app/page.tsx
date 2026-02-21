import Link from "next/link";
import { HomeTabs } from "./HomeTabs";

export default function Home() {
  return (
    <>
      {/* Navigation: Paper 1 | Paper 2 | Paper 3 */}
      <nav className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link
            href="/published"
            className="px-3 py-1.5 rounded-lg bg-green-50 text-green-800 border border-green-200 hover:bg-green-100 font-medium"
          >
            ✅ Paper 1: Published
          </Link>
          <Link
            href="/submitted"
            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 font-medium"
          >
            📤 Paper 2: Submitted
          </Link>
          <Link
            href="/research#write"
            className="px-3 py-1.5 rounded-lg bg-violet-50 text-violet-800 border border-violet-200 hover:bg-violet-100 font-medium"
          >
            ✏️ Paper 3: Generate Manuscript
          </Link>
        </div>
      </nav>
      <HomeTabs />
    </>
  );
}
