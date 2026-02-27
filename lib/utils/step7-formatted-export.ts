/**
 * Step 7: Export current manuscript text as a formatted .docx per journal template.
 * Does not modify Step 6 docx-export or word-export.
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

type TemplateId = 'ijcr' | 'jcpr' | 'vancouver';

/** Font name and size in half-points (docx uses half-points: 11pt = 22). */
const TEMPLATE_FONT = {
  ijcr: { font: 'Arial', bodySize: 22, titleSize: 28 },
  jcpr: { font: 'Times New Roman', bodySize: 24, titleSize: 28 },
  vancouver: { font: 'Times New Roman', bodySize: 24, titleSize: 28 },
} as const;

export async function downloadFormattedDocx(
  title: string,
  bodyText: string,
  templateId: TemplateId
): Promise<void> {
  const { font, bodySize, titleSize } = TEMPLATE_FONT[templateId];

  const titleRun = new TextRun({
    text: title || 'Manuscript',
    font,
    size: titleSize,
    bold: true,
  });
  const titlePara = new Paragraph({
    children: [titleRun],
    heading: HeadingLevel.TITLE,
    spacing: { after: 240 },
  });

  const paragraphs: Paragraph[] = [titlePara];
  const blocks = bodyText
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean);
  if (blocks.length === 0) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: bodyText.trim() || '(No content)', font, size: bodySize })],
        spacing: { after: 200 },
      })
    );
  } else {
    for (const block of blocks) {
      const line = block.replace(/\n/g, ' ').trim();
      if (!line) continue;
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: line, font, size: bodySize })],
          spacing: { after: 200 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Formatted_${templateId.toUpperCase()}_${title.slice(0, 30).replace(/\W/g, '_')}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
