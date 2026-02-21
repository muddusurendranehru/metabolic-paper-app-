"use client";

import { useState } from "react";
import { PATIENT_FIELDS } from "@/config/fields";
import type { PatientRow } from "@/lib/tyg";
import { calcTyG } from "@/lib/tyg";
import { assessRisk } from "@/lib/utils/risk-assessor";
import { updatePatientDiabetesRisk, getDiabetesRisk, getDiabetesRiskColor } from "@/lib/utils/diabetes-risk";
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
    let next = { ...edited, [key]: value };
    if (key === "tg" || key === "glucose") {
      next.tyg = Math.round(calcTyG(next.tg, next.glucose) * 100) / 100;
      next.risk = assessRisk(next.tyg, next.waist);
    }
    if (key === "waist") {
      next.risk = assessRisk(next.tyg, Number(value));
    }
    if (key === "hba1c") {
      const num = typeof value === "number" ? value : parseFloat(String(value));
      next.hba1c = Number.isFinite(num) ? num : undefined;
      next = updatePatientDiabetesRisk(next) as PatientRow;
    }
    setEdited(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-md overflow-auto rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold">Verify Patient</h3>
        <div className="space-y-3">
          {PATIENT_FIELDS.filter((f) =>
            ["name", "age", "sex", "tg", "glucose", "hdl", "waist", "hba1c"].includes(f.key)
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
          <div className="text-sm text-gray-500 flex flex-wrap items-center gap-2">
            <span>TyG: {edited.tyg.toFixed(2)}</span>
            <span>|</span>
            <span>Risk: {edited.risk}</span>
            {(() => {
              const diabetesRisk = edited.diabetesRisk ?? getDiabetesRisk(edited.hba1c);
              return (
                <>
                  <span>|</span>
                  <span>Diabetes:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getDiabetesRiskColor(diabetesRisk)}`}>
                    {diabetesRisk}
                  </span>
                </>
              );
            })()}
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
