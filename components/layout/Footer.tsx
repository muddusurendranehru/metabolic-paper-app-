export function Footer() {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Dr. Muddu Surendra Nehru MD Professor Medicine | HOMA Clinic
          </div>

          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded border border-green-200">
              🏆 Paper 1: Published
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded border border-blue-200">
              📤 Paper 2: Submitted
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded border border-purple-200 font-semibold">
              🧪 Paper 3: Active
            </span>
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-400 text-center">
          DOI: 10.61336/jccp/25-08-50 | TyG Research Dashboard v2.0
        </div>
      </div>
    </footer>
  );
}
