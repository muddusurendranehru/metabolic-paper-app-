// eslint-disable-next-line no-restricted-imports
// Do NOT import from: app/research, components/tabs, lib/utils except step12
"use client";
/**
 * Step 12 – target format selector (multi-select). Uses types from @/lib/utils/step12.
 */

import type { Step12TargetFormat } from "@/lib/utils/step12";

const FORMATS: { id: Step12TargetFormat; label: string }[] = [
  { id: "blog", label: "📝 Blog" },
  { id: "twitter", label: "🐦 Twitter" },
  { id: "linkedin", label: "💼 LinkedIn" },
  { id: "handout", label: "📄 Handout" },
  { id: "youtube", label: "🎥 YouTube" },
  { id: "youtube-package", label: "🎥 YouTube (full pkg)" },
  { id: "mcq", label: "🩺 MCQ (3)" },
  { id: "whatsapp", label: "💬 WhatsApp" },
  { id: "whatsapp-cta", label: "💬 WhatsApp CTA" },
  { id: "facebook-post", label: "📘 Facebook" },
  { id: "hypernatural", label: "🎬 HyperNatural (video)" },
  { id: "infographic", label: "📊 Infographic (mobile)" },
  { id: "book-section", label: "📚 Book section" },
  { id: "seo-blog", label: "🔍 SEO Blog + Metadata" },
];

interface FormatSelectorProps {
  value: Step12TargetFormat[];
  onChange: (formats: Step12TargetFormat[]) => void;
}

export default function FormatSelector({ value, onChange }: FormatSelectorProps) {
  const toggle = (id: Step12TargetFormat) => {
    if (value.includes(id)) onChange(value.filter((f) => f !== id));
    else onChange([...value, id]);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <span className="block text-sm font-medium text-gray-700 mb-2">Target formats (choose one or more)</span>
      <div className="flex flex-wrap gap-2">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => toggle(f.id)}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              value.includes(f.id) ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
