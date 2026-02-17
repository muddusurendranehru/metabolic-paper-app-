"use client";

import type { PatientRow } from "@/lib/tyg";

interface VerificationTableProps {
  patients: PatientRow[];
  onVerify: (p: PatientRow) => void;
}

export function VerificationTable({ patients, onVerify }: VerificationTableProps) {
  if (patients.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No patients in queue. Extract PDFs first.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border">
        <thead className="bg-indigo-50">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Age</th>
            <th className="p-2 border">TG</th>
            <th className="p-2 border">Glucose</th>
            <th className="p-2 border">TyG</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="p-2 border">{p.name}</td>
              <td className="p-2 border">{p.age}</td>
              <td className="p-2 border">{p.tg}</td>
              <td className="p-2 border">{p.glucose}</td>
              <td className="p-2 border">{p.tyg.toFixed(2)}</td>
              <td className="p-2 border">
                <button
                  onClick={() => onVerify(p)}
                  className="text-indigo-600 hover:underline"
                >
                  Verify
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
