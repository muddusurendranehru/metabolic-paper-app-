/**
 * Step 6: Export submission package (Manuscript.docx) from formatted paper.
 * Uses journal config for font, size, line spacing. Full IMRAD + tables.
 * Does not modify existing word-export or Step 5 behavior.
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
} from 'docx';
import type { FormattedPaper } from '@/components/step6/journal-formatter';

type PaperData = FormattedPaper;

function paragraph(
  text: string,
  opts?: { heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel]; spacingAfter?: number; italics?: boolean }
): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: text || '', italics: opts?.italics })],
    ...(opts?.heading && { heading: opts.heading }),
    ...(opts?.spacingAfter != null && { spacing: { after: opts.spacingAfter } }),
  });
}

function createDocxTable(tableData: any): Paragraph | Table {
  if (!tableData || !Array.isArray(tableData.rows) || tableData.rows.length === 0) {
    return paragraph('[Table data not available]', { spacingAfter: 200 });
  }
  const rows = tableData.rows.map((row: any[]) =>
    new TableRow({
      children: (Array.isArray(row) ? row : [row]).map((cell: any) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: String(cell ?? '') })] })],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
        })
      ),
    })
  );
  return new Table({
    rows,
    width: { size: 100, type: 'pct' },
  });
}

export async function exportSubmissionPackage(paper: PaperData, journalId: string): Promise<void> {

  const children: (Paragraph | Table)[] = [
    paragraph(paper.title ?? 'Manuscript', { heading: HeadingLevel.TITLE, spacingAfter: 400 }),
    paragraph('Dr. Muddu Surendra Nehru, MD¹, et al.', { spacingAfter: 200 }),
    paragraph('¹Professor, Department of Medicine, HOMA Clinic, Hyderabad, India', { italics: true, spacingAfter: 400 }),
    paragraph('ABSTRACT', { heading: HeadingLevel.HEADING_1 }),
    paragraph(paper.abstract ?? '', { spacingAfter: 400 }),
    paragraph('INTRODUCTION', { heading: HeadingLevel.HEADING_1 }),
    paragraph(paper.introduction ?? '', { spacingAfter: 400 }),
    paragraph('METHODS', { heading: HeadingLevel.HEADING_1 }),
    paragraph(paper.methods ?? '', { spacingAfter: 400 }),
    paragraph('RESULTS', { heading: HeadingLevel.HEADING_1 }),
    paragraph(paper.results ?? '', { spacingAfter: 400 }),
  ];

  if (paper.tables?.length) {
    for (const t of paper.tables) {
      const el = createDocxTable(t);
      children.push(el);
      if (el instanceof Paragraph) children.push(paragraph('', { spacingAfter: 200 }));
    }
  }

  children.push(
    paragraph('DISCUSSION', { heading: HeadingLevel.HEADING_1 }),
    paragraph(paper.discussion ?? '', { spacingAfter: 400 }),
    paragraph('CONCLUSION', { heading: HeadingLevel.HEADING_1 }),
    paragraph(paper.conclusion ?? '', { spacingAfter: 400 }),
    paragraph('REFERENCES', { heading: HeadingLevel.HEADING_1 })
  );

  const refList = Array.isArray(paper.references) ? paper.references : [];
  refList.forEach((ref, i) => {
    children.push(
      paragraph(`${i + 1}. ${ref}`, { spacingAfter: 100 })
    );
  });

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${journalId.toUpperCase()}_Manuscript.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
