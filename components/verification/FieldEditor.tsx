"use client";

import { PATIENT_FIELDS } from "@/config/fields";

interface FieldEditorProps {
  value: string | number;
  fieldKey: string;
  onChange: (value: string | number) => void;
  disabled?: boolean;
}

export function FieldEditor({
  value,
  fieldKey,
  onChange,
  disabled,
}: FieldEditorProps) {
  const field = PATIENT_FIELDS.find((f) => f.key === fieldKey);
  if (!field) return <span>{String(value)}</span>;

  if (field.type === "select") {
    return (
      <select
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded border px-2 py-1 text-sm"
      >
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "number") {
    return (
      <input
        type="number"
        value={value === "" || value == null ? "" : value}
        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : 0)}
        disabled={disabled}
        min={field.min}
        max={field.max}
        className="w-full rounded border px-2 py-1 text-sm"
      />
    );
  }

  return (
    <input
      type="text"
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={field.placeholder}
      className="w-full rounded border px-2 py-1 text-sm"
    />
  );
}
