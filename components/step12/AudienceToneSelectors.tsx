// eslint-disable-next-line no-restricted-imports
// Do NOT import from: app/research, components/tabs, lib/utils except step12
"use client";
/**
 * Step 12 – audience and tone. Uses types from @/lib/utils/step12.
 */

import type { Step12Audience, Step12Tone } from "@/lib/utils/step12";

const AUDIENCES: { id: Step12Audience; label: string }[] = [
  { id: "patients", label: "Patients" },
  { id: "doctors", label: "Doctors" },
  { id: "students", label: "Students" },
  { id: "general", label: "General" },
];

const TONES: { id: Step12Tone; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "friendly", label: "Friendly" },
  { id: "educational", label: "Educational" },
  { id: "urgent", label: "Urgent" },
];

interface AudienceToneSelectorsProps {
  audience: Step12Audience;
  tone: Step12Tone;
  onAudienceChange: (a: Step12Audience) => void;
  onToneChange: (t: Step12Tone) => void;
}

export default function AudienceToneSelectors({
  audience,
  tone,
  onAudienceChange,
  onToneChange,
}: AudienceToneSelectorsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <span className="block text-sm font-medium text-gray-700 mb-2">Audience</span>
        <div className="flex flex-wrap gap-2">
          {AUDIENCES.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onAudienceChange(a.id)}
              className={`px-3 py-1.5 rounded text-sm font-medium ${
                audience === a.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <span className="block text-sm font-medium text-gray-700 mb-2">Tone</span>
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onToneChange(t.id)}
              className={`px-3 py-1.5 rounded text-sm font-medium ${
                tone === t.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
