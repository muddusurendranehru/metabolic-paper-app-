import type { Patient } from '@/lib/types/patient';
import { getAnonymizedTable1Data } from './anonymize';

type PatientWithStatus = Patient & { status?: string };

export function exportCSV(patients: PatientWithStatus[], filename: string): void {
  const rows = getAnonymizedTable1Data(patients);
  if (rows.length === 0) {
    const headers = ['id', 'age', 'sex', 'tg', 'glucose', 'hdl', 'waist', 'tyg', 'risk', 'hba1c', 'diabetesRisk'];
    const csv = headers.join(',') + '\n';
    downloadBlob(csv, filename, 'text/csv');
    return;
  }
  const headers = Object.keys(rows[0]) as (keyof (typeof rows)[0])[];
  const csv = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const v = row[h];
        if (typeof v === 'number') return String(v);
        return `"${String(v ?? '').replace(/"/g, '""')}"`;
      }).join(',')
    ),
  ].join('\n');
  downloadBlob(csv, filename, 'text/csv');
}

function downloadBlob(content: string, filename: string, mime: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
