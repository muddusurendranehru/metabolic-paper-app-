"use client";
/**
 * Admin: form for authors to fill (external or embedded).
 * No patient data. Author metadata only. Uses author-schema for validation.
 */

import { useState } from "react";
import { validateAuthorSubmission } from "@/lib/utils/admin/author-schema";

export default function CollaborationForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [institution, setInstitution] = useState("");
  const [phone, setPhone] = useState("");
  const [medicalRegistrationNumber, setMedicalRegistrationNumber] = useState("");
  const [registrationYear, setRegistrationYear] = useState("");
  const [registrationState, setRegistrationState] = useState("");
  const [icmje, setIcmje] = useState(false);
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const result = validateAuthorSubmission({
      name,
      email,
      specialty: specialty || undefined,
      institution: institution || undefined,
      phone: phone || undefined,
      medicalRegistrationNumber: medicalRegistrationNumber.trim() || undefined,
      registrationYear: registrationYear.trim() ? Number(registrationYear) : undefined,
      registrationState: registrationState.trim() || undefined,
      icmjeAcknowledged: icmje,
      consentGiven: consent,
      submittedAt: new Date().toISOString(),
    });
    if (!result.ok) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({ type: "ok", text: "Validation passed. In production, submit to your backend or Google Form." });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
      <p className="text-sm text-gray-700 mb-4">
        Thank you for collaborating on our upcoming publication. Please fill out this form to confirm your authorship details, compliance, and contact information. All data is kept confidential and used solely for manuscript submission and certification. Estimated time: 5 minutes.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
        <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. Endocrinology" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
        <input value={institution} onChange={(e) => setInstitution(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. HOMA Clinic" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. +91 9963721999" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Medical registration number</label>
        <input value={medicalRegistrationNumber} onChange={(e) => setMedicalRegistrationNumber(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. MCI/State council number" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Registration year</label>
          <input type="number" value={registrationYear} onChange={(e) => setRegistrationYear(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. 2015" min={1950} max={2030} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Registration state</label>
          <input value={registrationState} onChange={(e) => setRegistrationState(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. Telangana" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={icmje} onChange={(e) => setIcmje(e.target.checked)} className="rounded border-gray-300" />
        <span>I acknowledge ICMJE authorship criteria</span>
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="rounded border-gray-300" />
        <span>I consent to use of my details per your privacy policy (DPDP)</span>
      </label>
      <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
        Submit
      </button>
      {message && (
        <p className={`text-sm ${message.type === "ok" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
