"use client";

import { useState } from "react";
import { downloadCSV } from "@/lib/csv-utils";
import type { PatientRow } from "@/lib/tyg";

export function TabWaist({
  patientData,
  setPatientData,
}: {
  patientData: PatientRow[];
  setPatientData: (arg: PatientRow[] | ((prev: PatientRow[]) => PatientRow[])) => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleWaistChange = (index: number, value: string) => {
    const updated = [...patientData];
    updated[index].waist = value ? parseFloat(value) : 0;

    const tygVal = updated[index].tyg;
    if (tygVal != null && tygVal > 0) {
      const isHighWaist = value ? parseFloat(value) >= 90 : false;
      const isHighTyG = (tygVal as number) >= 9.5;
      updated[index].risk =
        isHighWaist && isHighTyG
          ? "High"
          : isHighWaist || isHighTyG
            ? "Moderate"
            : "Normal";
    }

    setPatientData(updated);
  };

  const handleDownload = () => {
    downloadCSV(
      patientData.map((p) => ({
        ...p,
        filename: p.name,
        TyG: p.tyg,
      })) as Record<string, unknown>[],
      "tyg-study-complete.csv"
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">📏 Step 3: Edit Waist Circumference</h2>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
        <p className="text-yellow-800">
          ⚠️ Waist circumference must be entered manually (not available in PDF reports)
        </p>
        <p className="text-sm text-yellow-700 mt-1">
          Cut-off: ≥90cm (Men), ≥80cm (Women) = High Risk
        </p>
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border">
          <thead className="bg-indigo-50">
            <tr>
              <th className="p-2 border">Patient</th>
              <th className="p-2 border">TyG</th>
              <th className="p-2 border">Waist (cm)</th>
              <th className="p-2 border">Risk</th>
            </tr>
          </thead>
          <tbody>
            {patientData.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-2 border">{p.name ?? "-"}</td>
                <td className="p-2 border">
                  {p.tyg?.toFixed(2) ?? "-"}
                </td>
                <td className="p-2 border">
                  {editingId === i ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => {
                        handleWaistChange(i, editValue);
                        setEditingId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleWaistChange(i, editValue);
                          setEditingId(null);
                        }
                      }}
                      className="border px-2 py-1 w-20"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(i);
                        setEditValue(String(p.waist ?? ""));
                      }}
                      className="text-indigo-600 hover:underline"
                    >
                      {p.waist ? p.waist : "Click to edit"}
                    </button>
                  )}
                </td>
                <td className="p-2 border">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      p.risk === "High"
                        ? "bg-red-100 text-red-700"
                        : p.risk === "Moderate"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {p.risk ?? "Normal"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleDownload}
        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
      >
        📥 Download Complete Dataset
      </button>
    </div>
  );
}
