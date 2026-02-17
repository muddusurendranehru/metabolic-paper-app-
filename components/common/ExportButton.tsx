"use client";

"use client";

import { downloadCSV } from "@/lib/csv-utils";

interface ExportButtonProps {
  data: unknown[];
  filename: string;
  label?: string;
  className?: string;
}

export function ExportButton({
  data,
  filename,
  label = "📥 Export CSV",
  className = "",
}: ExportButtonProps) {
  return (
    <button
      onClick={() => downloadCSV(data, filename)}
      className={`rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 ${className}`}
    >
      {label}
    </button>
  );
}
