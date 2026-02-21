import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ImageRun,
} from 'docx';
import type { Patient } from '@/lib/types/patient';
import type { ManuscriptData } from './ijcpr-manuscript';

type PatientWithStatus = Patient & { status?: string };

export type FigurePngBase64 = {
  fig1: string;
  fig2: string;
  fig3: string;
};

function base64ToUint8Array(base64: string): Uint8Array {
  const bin = atob(base64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function isValidPngBase64(s: string): boolean {
  if (typeof s !== 'string' || s.length < 100) return false;
  try {
    atob(s);
    return true;
  } catch {
    return false;
  }
}

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
  filename: string,
  options?: { figurePngBase64?: FigurePngBase64 }
): Promise<void> {
  if (isIJCPRManuscript(manuscript)) {
    return exportIJCPRManuscript(manuscript, filename, options?.figurePngBase64);
  }
  return exportLegacyManuscript(patients, manuscript, filename);
}

function isIJCPRManuscript(m: ManuscriptData | ManuscriptTemplate): m is ManuscriptData {
  return 'table1' in m && 'table2' in m && typeof (m as ManuscriptData).table1 === 'string' && typeof (m as ManuscriptData).table2 === 'string';
}

function buildIJCPRChildren(
  data: ManuscriptData,
  figures?: FigurePngBase64
): (ReturnType<typeof paragraph> | Paragraph)[] {
  const safe = (s: string | undefined) => (typeof s === 'string' ? s : '');
  const children: (ReturnType<typeof paragraph> | Paragraph)[] = [
    paragraph(safe(data.title), { heading: HeadingLevel.TITLE, spacingAfter: 400 }),
    new Paragraph({
      children: [new TextRun({ text: safe(data.authors), bold: true, size: 24 })],
      spacing: { after: 200 },
    }),
    paragraph(safe(data.affiliation), { spacingAfter: 400 }),
    paragraph('ABSTRACT', { heading: HeadingLevel.HEADING_1 }),
    paragraph(safe(data.abstract), { spacingAfter: 400 }),
    paragraph(`Keywords: ${safe(data.keywords)}`, { spacingAfter: 400 }),
    paragraph('INTRODUCTION', { heading: HeadingLevel.HEADING_1 }),
    paragraph(safe(data.introduction), { spacingAfter: 400 }),
    paragraph('METHODS', { heading: HeadingLevel.HEADING_1 }),
    paragraph(safe(data.methods), { spacingAfter: 400 }),
    paragraph('RESULTS', { heading: HeadingLevel.HEADING_1 }),
    paragraph(safe(data.results), { spacingAfter: 400 }),
    paragraph(safe(data.table1), { spacingAfter: 400 }),
    paragraph(safe(data.table2), { spacingAfter: 400 }),
  ];

  const imgWidth = 600;
  const imgHeight = 450;
  const addFigure = (figBase64: string | undefined, caption: string | undefined, heading: string) => {
    children.push(paragraph(heading, { heading: HeadingLevel.HEADING_2 }));
    if (figBase64 && isValidPngBase64(figBase64)) {
      try {
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: base64ToUint8Array(figBase64),
                transformation: { width: imgWidth, height: imgHeight },
                type: 'png',
              }),
            ],
            spacing: { after: 200 },
          })
        );
      } catch {
        // skip image
      }
    }
    if (caption) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: caption, italics: true })],
          spacing: { after: 400 },
        })
      );
    }
  };

  if (figures) {
    addFigure(figures.fig1, data.figure1Caption, 'Figure 1');
    addFigure(figures.fig2, data.figure2Caption, 'Figure 2');
    addFigure(figures.fig3, data.figure3Caption, 'Figure 3');
  }

  children.push(
    paragraph('DISCUSSION', { heading: HeadingLevel.HEADING_1 }),
    paragraph(safe(data.discussion), { spacingAfter: 400 }),
    paragraph('CONCLUSION', { heading: HeadingLevel.HEADING_1 }),
    paragraph(safe(data.conclusion), { spacingAfter: 400 }),
    paragraph('REFERENCES', { heading: HeadingLevel.HEADING_1 }),
    paragraph(safe(data.references), { spacingAfter: 400 })
  );

  return children;
}

async function exportIJCPRManuscript(
  data: ManuscriptData,
  filename: string,
  figures?: FigurePngBase64
): Promise<void> {
  const filenameFinal = filename.endsWith('.docx') ? filename : filename.replace(/\.doc$/, '') + '.docx';

  const tryExport = (withFigures: boolean) => {
    const children = buildIJCPRChildren(data, withFigures ? figures : undefined);
    const doc = new Document({
      sections: [{ properties: {}, children }],
    });
    return Packer.toBlob(doc);
  };

  let blob: Blob;
  try {
    blob = await tryExport(!!figures);
    if (blob.size < 1000 && figures) {
      blob = await tryExport(false);
      console.warn('Word export: figures may have been omitted (small blob), exported without images.');
    }
  } catch (err) {
    console.error('Word export with figures failed, retrying without figures:', err);
    blob = await tryExport(false);
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filenameFinal;
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
