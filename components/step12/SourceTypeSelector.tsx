// eslint-disable-next-line no-restricted-imports
// Do NOT import from: app/research, components/tabs, lib/utils except step12
"use client";
/**
 * Step 12 – source type: upload | paste | from-scratch. Uses types from @/lib/utils/step12.
 */

import type { Step12SourceType } from "@/lib/utils/step12";

const OPTIONS: { id: Step12SourceType; label: string }[] = [
  { id: "upload", label: "Upload file" },
  { id: "paste", label: "Paste text" },
  { id: "from-scratch", label: "From scratch (topic only)" },
];

interface SourceTypeSelectorProps {
  value: Step12SourceType;
  onChange: (v: Step12SourceType) => void;
}

export default function SourceTypeSelector({ value, onChange }: SourceTypeSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <span className="block text-sm font-medium text-gray-700 mb-2">Source</span>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              value === o.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
