"use client";

import { useState } from "react";
import type { PatientRow } from "@/lib/tyg";
import { PatientVerificationModal } from "@/components/verification/PatientVerificationModal";
import { VerificationTable } from "@/components/verification/VerificationTable";

interface TabVerifyProps {
  patientData: PatientRow[];
  setPatientData: (arg: PatientRow[] | ((prev: PatientRow[]) => PatientRow[])) => void;
}

export function TabVerify({ patientData, setPatientData }: TabVerifyProps) {
  const [modalPatient, setModalPatient] = useState<PatientRow | null>(null);

  const handleVerify = (p: PatientRow) => setModalPatient(p);

  const handleSave = (p: PatientRow) => {
    setPatientData((prev) =>
      prev.map((x) => (x.id === p.id ? p : x))
    );
    setModalPatient(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">✅ Step 2: Human Verification</h2>
      <p className="text-sm text-gray-600 mb-6">
        Review and correct OCR-extracted values before proceeding to waist edit.
      </p>
      <VerificationTable patients={patientData} onVerify={handleVerify} />
      {modalPatient && (
        <PatientVerificationModal
          patient={modalPatient}
          onSave={handleSave}
          onClose={() => setModalPatient(null)}
        />
      )}
    </div>
  );
}
