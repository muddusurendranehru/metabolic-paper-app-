import type { Patient } from '@/lib/types/patient';
import { getAnonymizedTable1Data } from './anonymize';

type PatientWithStatus = Patient & { status?: string };

export type ManuscriptTemplate = {
  title: string;
  abstract: string;
  introduction: string;
  methods: string;
  results: string;
  discussion: string;
  conclusion: string;
  references: string;
};

export async function exportWord(
  patients: PatientWithStatus[],
  manuscript: ManuscriptTemplate,
  filename: string
): Promise<void> {
  const tableRows = getAnonymizedTable1Data(patients);
  const headers = ['ID', 'Age', 'Sex', 'TG', 'Glucose', 'HDL', 'Waist', 'TyG', 'Risk'];
  const tableHtml = [
    '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse;">',
    '<thead><tr>' + headers.map(h => `<th>${escapeHtml(h)}</th>`).join('') + '</tr></thead>',
    '<tbody>',
    ...tableRows.slice(0, 100).map(
      row =>
        '<tr>' +
        [row.id, row.age, row.sex, row.tg, row.glucose, row.hdl, row.waist, row.tyg?.toFixed(2), row.risk]
          .map(c => `<td>${escapeHtml(String(c ?? ''))}</td>`)
          .join('') +
        '</tr>'
    ),
    '</tbody></table>',
  ].join('');

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>${escapeHtml(manuscript.title)}</title></head>
<body>
<h1>${escapeHtml(manuscript.title)}</h1>
<p><strong>Abstract</strong></p>
<p>${escapeHtml(manuscript.abstract).replace(/\n/g, '</p><p>')}</p>
<p><strong>Introduction</strong></p>
<p>${escapeHtml(manuscript.introduction).replace(/\n/g, '</p><p>')}</p>
<p><strong>Methods</strong></p>
<p>${escapeHtml(manuscript.methods).replace(/\n/g, '</p><p>')}</p>
<p><strong>Results</strong></p>
<p>${escapeHtml(manuscript.results).replace(/\n/g, '</p><p>')}</p>
<p><strong>Table 1: Patient Characteristics (Anonymized)</strong></p>
${tableHtml}
<p><strong>Discussion</strong></p>
<p>${escapeHtml(manuscript.discussion).replace(/\n/g, '</p><p>')}</p>
<p><strong>Conclusion</strong></p>
<p>${escapeHtml(manuscript.conclusion).replace(/\n/g, '</p><p>')}</p>
<p><strong>References</strong></p>
<p>${escapeHtml(manuscript.references).replace(/\n/g, '</p><p>')}</p>
</body>
</html>`;

  const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace(/\.docx?$/i, '') + '.doc';
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
