"use client";

import Link from "next/link";

/**
 * Navigation: shared data tabs + Paper 3 (Write) + Paper 2 (Submitted) + Paper 1 (Published).
 */
export function PaperNav() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap gap-1">
          <Link href="/research" className="px-4 py-3 text-gray-600 hover:text-indigo-600 text-sm font-medium">📄 Extract</Link>
          <Link href="/research" className="px-4 py-3 text-gray-600 hover:text-indigo-600 text-sm font-medium">✅ Verify</Link>
          <Link href="/research" className="px-4 py-3 text-gray-600 hover:text-indigo-600 text-sm font-medium">📏 Waist</Link>
          <Link href="/research" className="px-4 py-3 text-gray-600 hover:text-indigo-600 text-sm font-medium">📊 Analyze</Link>

          {/* Paper 3: Active workspace – #write opens Tab 5 */}
          <Link href="/research#write" className="px-4 py-3 text-blue-600 font-medium border-b-2 border-blue-600 text-sm">
            ✏️ Paper 3: Write
          </Link>

          {/* Paper 2: Submitted – status only */}
          <Link href="/submitted" className="px-4 py-3 text-amber-600 hover:text-amber-700 text-sm font-medium">
            📤 Paper 2: Submitted
          </Link>

          {/* Paper 1: Published */}
          <Link href="/published" className="px-4 py-3 text-green-600 hover:text-green-700 text-sm font-medium">
            🏆 Paper 1: Published
          </Link>
        </div>
      </div>
    </nav>
  );
}
