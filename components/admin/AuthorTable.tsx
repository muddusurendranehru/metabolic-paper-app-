"use client";
/**
 * Admin: display submitted author details.
 * No patient data. Author metadata only.
 */

import type { AuthorSubmission } from "@/lib/utils/admin/author-schema";

interface AuthorTableProps {
  submissions: AuthorSubmission[];
}

export default function AuthorTable({ submissions }: AuthorTableProps) {
  if (submissions.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4">
        No submissions yet. Use the form or link your Google Form to collect author details.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-2 font-medium">Name</th>
            <th className="text-left p-2 font-medium">Email</th>
            <th className="text-left p-2 font-medium">Reg. no.</th>
            <th className="text-left p-2 font-medium">Year</th>
            <th className="text-left p-2 font-medium">State</th>
            <th className="text-left p-2 font-medium">Specialty</th>
            <th className="text-left p-2 font-medium">Institution</th>
            <th className="text-left p-2 font-medium">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((row, i) => (
            <tr key={i} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="p-2">{row.name}</td>
              <td className="p-2">{row.email}</td>
              <td className="p-2">{row.medicalRegistrationNumber ?? "—"}</td>
              <td className="p-2">{row.registrationYear ?? "—"}</td>
              <td className="p-2">{row.registrationState ?? "—"}</td>
              <td className="p-2">{row.specialty ?? "—"}</td>
              <td className="p-2">{row.institution ?? "—"}</td>
              <td className="p-2">
                {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
