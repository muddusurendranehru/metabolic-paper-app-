import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from 'docx';
import type { Patient } from '@/lib/types/patient';
import type { ManuscriptData } from './ijcpr-manuscript';

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

function paragraph(text: string, opts?: { heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel]; spacingAfter?: number }) {
  return new Paragraph({
    children: [new TextRun({ text })],
    ...(opts?.heading && { heading: opts.heading }),
    ...(opts?.spacingAfter != null && { spacing: { after: opts.spacingAfter } }),
  });
}

export async function exportWord(
  patients: PatientWithStatus[],
  manuscript: ManuscriptData | ManuscriptTemplate,
  filename: string
): Promise<void> {
  if (isIJCPRManuscript(manuscript)) {
    return exportIJCPRManuscript(manuscript, filename);
  }
  return exportLegacyManuscript(patients, manuscript, filename);
}

function isIJCPRManuscript(m: ManuscriptData | ManuscriptTemplate): m is ManuscriptData {
  return 'table1' in m && 'table2' in m && typeof (m as ManuscriptData).table1 === 'string' && typeof (m as ManuscriptData).table2 === 'string';
}

async function exportIJCPRManuscript(data: ManuscriptData, filename: string): Promise<void> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        paragraph(data.title, { heading: HeadingLevel.TITLE, spacingAfter: 400 }),
        new Paragraph({
          children: [new TextRun({ text: data.authors, bold: true, size: 24 })],
          spacing: { after: 200 },
        }),
        paragraph(data.affiliation, { spacingAfter: 400 }),
        paragraph('ABSTRACT', { heading: HeadingLevel.HEADING_1 }),
        paragraph(data.abstract, { spacingAfter: 400 }),
        paragraph(`Keywords: ${data.keywords}`, { spacingAfter: 400 }),
        paragraph('INTRODUCTION', { heading: HeadingLevel.HEADING_1 }),
        paragraph(data.introduction, { spacingAfter: 400 }),
        paragraph('METHODS', { heading: HeadingLevel.HEADING_1 }),
        paragraph(data.methods, { spacingAfter: 400 }),
        paragraph('RESULTS', { heading: HeadingLevel.HEADING_1 }),
        paragraph(data.results, { spacingAfter: 400 }),
        paragraph(data.table1, { spacingAfter: 400 }),
        paragraph(data.table2, { spacingAfter: 400 }),
        paragraph('DISCUSSION', { heading: HeadingLevel.HEADING_1 }),
        paragraph(data.discussion, { spacingAfter: 400 }),
        paragraph('CONCLUSION', { heading: HeadingLevel.HEADING_1 }),
        paragraph(data.conclusion, { spacingAfter: 400 }),
        paragraph('REFERENCES', { heading: HeadingLevel.HEADING_1 }),
        paragraph(data.references, { spacingAfter: 400 }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.docx') ? filename : filename.replace(/\.doc$/, '') + '.docx';
  a.click();
  URL.revokeObjectURL(url);
}

async function exportLegacyManuscript(
  _patients: PatientWithStatus[],
  manuscript: ManuscriptTemplate,
  filename: string
): Promise<void> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        paragraph(manuscript.title || 'TyG Study', { heading: HeadingLevel.TITLE }),
        paragraph('Dr. Muddu Surendra Nehru MD Professor Medicine, HOMA Clinic'),
        paragraph(''),
        paragraph(manuscript.abstract || '', { heading: HeadingLevel.HEADING_1 }),
        paragraph(manuscript.introduction || '', { heading: HeadingLevel.HEADING_1 }),
        paragraph(manuscript.methods || '', { heading: HeadingLevel.HEADING_1 }),
        paragraph(manuscript.results || '', { heading: HeadingLevel.HEADING_1 }),
        paragraph(manuscript.discussion || '', { heading: HeadingLevel.HEADING_1 }),
        paragraph(manuscript.conclusion || '', { heading: HeadingLevel.HEADING_1 }),
        paragraph(manuscript.references || '', { heading: HeadingLevel.HEADING_1 }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.docx') ? filename : filename.replace(/\.doc$/, '') + '.docx';
  a.click();
  URL.revokeObjectURL(url);
}
