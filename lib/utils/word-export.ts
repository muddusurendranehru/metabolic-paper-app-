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

export type WordExportFigures = {
  fig1: string;
  fig2: string;
  fig3: string;
};

/** Convert SVG string to PNG Uint8Array in browser (for docx ImageRun). */
function svgToPngUint8Array(svgString: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined' || typeof URL === 'undefined') {
      reject(new Error('svgToPngUint8Array requires browser'));
      return;
    }
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('No 2d context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (pngBlob) => {
          URL.revokeObjectURL(url);
          if (!pngBlob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(new Uint8Array(reader.result as ArrayBuffer));
          };
          reader.readAsArrayBuffer(pngBlob);
        },
        'image/png'
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load failed'));
    };
    img.src = url;
  });
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
  figures?: WordExportFigures
): Promise<void> {
  if (isIJCPRManuscript(manuscript)) {
    return exportIJCPRManuscript(manuscript, filename, figures);
  }
  return exportLegacyManuscript(patients, manuscript, filename);
}

function isIJCPRManuscript(m: ManuscriptData | ManuscriptTemplate): m is ManuscriptData {
  return 'table1' in m && 'table2' in m && typeof (m as ManuscriptData).table1 === 'string' && typeof (m as ManuscriptData).table2 === 'string';
}

async function exportIJCPRManuscript(
  data: ManuscriptData,
  filename: string,
  figures?: WordExportFigures
): Promise<void> {
  const children: Paragraph[] = [
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
  ];

  if (figures && typeof document !== 'undefined') {
    try {
      const [fig1Png, fig2Png, fig3Png] = await Promise.all([
        svgToPngUint8Array(figures.fig1),
        svgToPngUint8Array(figures.fig2),
        svgToPngUint8Array(figures.fig3),
      ]);
      const figWidth = 600;
      const figHeight = 450;
      children.push(
        paragraph('Figure 1', { heading: HeadingLevel.HEADING_2, spacingAfter: 200 }),
        new Paragraph({
          children: [
            new ImageRun({
              data: fig1Png,
              transformation: { width: figWidth, height: figHeight },
              type: 'png',
            }),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: data.figure1Caption, italics: true })],
          spacing: { after: 400 },
        }),
        paragraph('Figure 2', { heading: HeadingLevel.HEADING_2, spacingAfter: 200 }),
        new Paragraph({
          children: [
            new ImageRun({
              data: fig2Png,
              transformation: { width: figWidth, height: figHeight },
              type: 'png',
            }),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: data.figure2Caption, italics: true })],
          spacing: { after: 400 },
        }),
        paragraph('Figure 3', { heading: HeadingLevel.HEADING_2, spacingAfter: 200 }),
        new Paragraph({
          children: [
            new ImageRun({
              data: fig3Png,
              transformation: { width: figWidth, height: figHeight },
              type: 'png',
            }),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: data.figure3Caption, italics: true })],
          spacing: { after: 400 },
        })
      );
    } catch (e) {
      console.warn('Figure embedding failed, exporting without figures:', e);
    }
  }

  children.push(
    paragraph('DISCUSSION', { heading: HeadingLevel.HEADING_1 }),
    paragraph(data.discussion, { spacingAfter: 400 }),
    paragraph('CONCLUSION', { heading: HeadingLevel.HEADING_1 }),
    paragraph(data.conclusion, { spacingAfter: 400 }),
    paragraph('REFERENCES', { heading: HeadingLevel.HEADING_1 }),
    paragraph(data.references, { spacingAfter: 400 })
  );

  const doc = new Document({
    sections: [{ properties: {}, children }],
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
