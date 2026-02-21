"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="bg-white shadow-md border-b-4 border-indigo-600">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <Link href="/" className="hover:opacity-90 block">
              <h1 className="text-2xl font-bold text-indigo-900">
                TyG Index Research Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Dr. Muddu Surendra Nehru | Professor Medicine | HOMA Clinic
              </p>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-gray-600 hover:text-indigo-600 font-medium">
                Home
              </Link>
              <Link href="/published" className="text-gray-600 hover:text-indigo-600 font-medium">
                Published
              </Link>
              <Link href="/research" className="text-gray-600 hover:text-indigo-600 font-medium">
                Research
              </Link>
              <Link href="/analyze" className="text-gray-600 hover:text-indigo-600 font-medium">
                Analyze
              </Link>
              <Link href="/export" className="text-gray-600 hover:text-indigo-600 font-medium">
                Export
              </Link>
            </nav>

            {/* 3-Paper Status Badges */}
            <div className="hidden md:flex gap-2">
              {/* Paper 1: Published */}
              <a
                href="https://doi.org/10.61336/jccp/25-08-50"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
              >
                <p className="text-xs font-semibold text-green-800">
                  🏆 Paper 1: Published
                </p>
                <p className="text-xs text-green-600">
                  JCCP 2025 • View DOI →
                </p>
              </a>

              {/* Paper 2: Submitted */}
              <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-800">
                  📤 Paper 2: Submitted
                </p>
                <p className="text-xs text-blue-600">
                  60 Patients • Awaiting Review
                </p>
              </div>

              {/* Paper 3: Active */}
              <div className="px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs font-semibold text-purple-800">
                  🧪 Paper 3: Active
                </p>
                <p className="text-xs text-purple-600">
                  TyG-HbA1c • In Progress
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
