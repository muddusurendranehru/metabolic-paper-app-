"use client";

import { useState, useRef } from 'react';
import type { Patient } from '@/lib/types/patient';
import { generateManuscriptTemplate } from '@/lib/utils/manuscript-template';
import { getAnonymizedTable1Data } from '@/lib/utils/anonymize';
import { calculateStats } from '@/lib/utils/stats-calculator';
import { exportCSV } from '@/lib/utils/csv-export';
import { exportPDF } from '@/lib/utils/pdf-export';
import { exportWord } from '@/lib/utils/word-export';

type PatientWithStatus = Patient & { status?: string };

interface Props {
  patientData: PatientWithStatus[];
  onBack: () => void;
}

export default function Tab5JCDR({ patientData, onBack }: Props) {
  const [manuscript, setManuscript] = useState(() => generateManuscriptTemplate(patientData));
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const manuscriptRef = useRef<HTMLDivElement>(null);

  const stats = calculateStats(patientData);
  const table1Data = getAnonymizedTable1Data(patientData);
  const verified = patientData.filter((p: PatientWithStatus) => p.status === 'verified');

  const handleEdit = (section: string) => {
    setIsEditing(prev => ({ ...prev, [section]: true }));
  };

  const handleSave = (section: string) => {
    setIsEditing(prev => ({ ...prev, [section]: false }));
  };

  const handleCancel = (section: string) => {
    setIsEditing(prev => ({ ...prev, [section]: false }));
  };

  const handleExportWord = async () => {
    await exportWord(verified, manuscript, 'tyg-study-manuscript.docx');
  };

  const handleExportPDF = async () => {
    if (manuscriptRef.current) {
      await exportPDF(manuscriptRef.current, 'tyg-study-manuscript.pdf');
    }
  };

  const handleExportCSV = () => {
    exportCSV(verified, 'tyg-study-anonymized.csv');
  };

  const SectionEditor = ({
    section,
    title,
    value,
  }: {
    section: string;
    title: string;
    value: string;
  }) => (
    <div className="mb-6 border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-indigo-900">{title}</h3>
        {isEditing[section] ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSave(section)}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              💾 Save
            </button>
            <button
              type="button"
              onClick={() => handleCancel(section)}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
            >
              ✕ Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => handleEdit(section)}
            className="px-3 py-1 border border-indigo-300 text-indigo-600 rounded text-sm hover:bg-indigo-50"
          >
            ✏️ Edit
          </button>
        )}
      </div>
      {isEditing[section] ? (
        <textarea
          value={value}
          onChange={e => setManuscript(prev => ({ ...prev, [section]: e.target.value }))}
          className="w-full border rounded p-3 min-h-[200px] font-mono text-sm"
        />
      ) : (
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">{value}</div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-indigo-900">📄 Step 5: Write JCDR Paper</h2>
          <p className="text-gray-600">Human-in-the-loop manuscript generation</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-indigo-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">Total Patients</p>
          <p className="text-2xl font-bold text-indigo-900">{stats.n}</p>
        </div>
        <div className="p-4 bg-indigo-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">Mean TyG</p>
          <p className="text-2xl font-bold text-indigo-900">{stats.avgTyG.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">High Risk</p>
          <p className="text-2xl font-bold text-red-900">{stats.highRisk}</p>
        </div>
        <div className="p-4 bg-indigo-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">Correlation (r)</p>
          <p className="text-2xl font-bold text-indigo-900">{stats.correlationR.toFixed(2)}</p>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          type="button"
          onClick={handleExportWord}
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
        >
          <p className="text-2xl mb-2">📝</p>
          <p className="font-bold text-blue-900">Export Word</p>
          <p className="text-sm text-blue-700">.docx manuscript</p>
        </button>
        <button
          type="button"
          onClick={handleExportPDF}
          className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
        >
          <p className="text-2xl mb-2">📄</p>
          <p className="font-bold text-red-900">Export PDF</p>
          <p className="text-sm text-red-700">300 DPI</p>
        </button>
        <button
          type="button"
          onClick={handleExportCSV}
          className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
        >
          <p className="text-2xl mb-2">📊</p>
          <p className="font-bold text-green-900">Export CSV</p>
          <p className="text-sm text-green-700">Anonymized data</p>
        </button>
      </div>

      {/* Manuscript Preview */}
      <div ref={manuscriptRef} className="border rounded-lg p-8 bg-white">
        <div className="text-center mb-8">
          <SectionEditor section="title" title="Title" value={manuscript.title} />
        </div>

        <div className="mb-8 p-4 bg-gray-50 rounded">
          <p className="text-center text-gray-600">
            Dr. Muddu Surendra Nehru MD Professor Medicine
            <br />
            HOMA Clinic | {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
          </p>
        </div>

        <SectionEditor section="abstract" title="Abstract" value={manuscript.abstract} />
        <SectionEditor section="introduction" title="Introduction" value={manuscript.introduction} />
        <SectionEditor section="methods" title="Methods" value={manuscript.methods} />

        {/* Table 1 */}
        <div className="mb-6 border rounded-lg p-4 bg-white">
          <h3 className="font-bold text-lg text-indigo-900 mb-3">
            Table 1: Patient Characteristics (Anonymized)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Age</th>
                  <th className="p-2 border">Sex</th>
                  <th className="p-2 border">TG</th>
                  <th className="p-2 border">Glucose</th>
                  <th className="p-2 border">HDL</th>
                  <th className="p-2 border">Waist</th>
                  <th className="p-2 border">TyG</th>
                  <th className="p-2 border">Risk</th>
                </tr>
              </thead>
              <tbody>
                {table1Data.slice(0, 10).map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="p-2 border font-medium">{row.id}</td>
                    <td className="p-2 border">{row.age ?? '-'}</td>
                    <td className="p-2 border">{row.sex ?? '-'}</td>
                    <td className="p-2 border">{row.tg ?? '-'}</td>
                    <td className="p-2 border">{row.glucose ?? '-'}</td>
                    <td className="p-2 border">{row.hdl ?? '-'}</td>
                    <td className="p-2 border">{row.waist ?? '-'}</td>
                    <td className="p-2 border">{row.tyg != null ? row.tyg.toFixed(2) : '-'}</td>
                    <td className="p-2 border">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          row.risk === 'High'
                            ? 'bg-red-100 text-red-700'
                            : row.risk === 'Moderate'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {row.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {table1Data.length > 10 && (
              <p className="text-sm text-gray-500 mt-2">
                + {table1Data.length - 10} more patients (see CSV export)
              </p>
            )}
          </div>
        </div>

        <SectionEditor section="results" title="Results" value={manuscript.results} />
        <SectionEditor section="discussion" title="Discussion" value={manuscript.discussion} />
        <SectionEditor section="conclusion" title="Conclusion" value={manuscript.conclusion} />
        <SectionEditor section="references" title="References" value={manuscript.references} />
      </div>

      {/* Footer Note */}
      <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
        <p className="text-sm text-indigo-800">
          📝 <strong>Human-in-the-Loop:</strong> Click &quot;Edit&quot; on any section to modify text
          before export. All patient names are anonymized (Patient 001, 002...) in exports. Original
          names preserved internally.
        </p>
      </div>
    </div>
  );
}
