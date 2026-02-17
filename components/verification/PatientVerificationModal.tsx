"use client";

import { useState } from "react";
import { PATIENT_FIELDS } from "@/config/fields";
import type { PatientRow } from "@/lib/tyg";
import { calcTyG } from "@/lib/tyg";
import { assessRisk } from "@/lib/utils/risk-assessor";
import { FieldEditor } from "./FieldEditor";

interface PatientVerificationModalProps {
  patient: PatientRow;
  onSave: (p: PatientRow) => void;
  onClose: () => void;
}

export function PatientVerificationModal({
  patient,
  onSave,
  onClose,
}: PatientVerificationModalProps) {
  const [edited, setEdited] = useState<PatientRow>({ ...patient });

  const handleChange = (key: keyof PatientRow, value: string | number) => {
    const next = { ...edited, [key]: value };
    if (key === "tg" || key === "glucose") {
      next.tyg = Math.round(calcTyG(next.tg, next.glucose) * 100) / 100;
      next.risk = assessRisk(next.tyg, next.waist);
    }
    if (key === "waist") {
      next.risk = assessRisk(next.tyg, Number(value));
    }
    setEdited(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold">Verify Patient</h3>
        <div className="space-y-3">
          {PATIENT_FIELDS.filter((f) =>
            ["name", "age", "sex", "tg", "glucose", "hdl", "waist"].includes(f.key)
          ).map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                {f.label}
              </label>
              <FieldEditor
                fieldKey={f.key}
                value={
                  (() => {
                    const v = (edited as unknown as Record<string, unknown>)[f.key];
                    if (typeof v === "number") return v;
                    if (typeof v === "string") return v;
                    return f.type === "number" ? 0 : "";
                  })()
                }
                onChange={(v) => handleChange(f.key as keyof PatientRow, v)}
              />
            </div>
          ))}
          <div className="text-sm text-gray-500">
            TyG: {edited.tyg.toFixed(2)} | Risk: {edited.risk}
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => onSave(edited)}
            className="flex-1 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="rounded border px-4 py-2 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
