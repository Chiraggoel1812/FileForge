import { loadPdf } from '../pdfUtils';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';

export async function pdfToWord(file: File): Promise<ArrayBuffer> {
  const data = await file.arrayBuffer();
  const pdf = await loadPdf(data);

  const pageTexts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items as any[];
    let lastY: number | undefined;
    let line = '';
    const lines: string[] = [];

    for (const item of items) {
      const str = item.str || '';
      const ty = item.transform[5];
      if (lastY !== undefined && Math.abs(ty - lastY) > 2) {
        if (line.trim()) lines.push(line.trim());
        line = '';
      }
      line += str;
      if (item.hasEOL) {
        if (line.trim()) lines.push(line.trim());
        line = '';
      }
      lastY = ty;
    }
    if (line.trim()) lines.push(line.trim());
    pageTexts.push(lines.join('\n'));
  }

  const totalText = pageTexts.join('\n\n');
  const hasText = totalText.replace(/[\s\-|]/g, '').length > 10;

  if (!hasText) {
    throw new Error(
      'This PDF appears to contain scanned images or no extractable text. Text-based conversion is not possible for this file.'
    );
  }

  const paragraphs: Paragraph[] = [];

  for (let p = 0; p < pageTexts.length; p++) {
    const pageLines = pageTexts[p].split('\n').filter((l) => l.trim());
    for (const l of pageLines) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: l, size: 22 })],
          spacing: { after: 120 },
        })
      );
    }
    if (p < pageTexts.length - 1) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: '' })],
          pageBreakBefore: true,
        })
      );
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  return await Packer.toBlob(doc).then((b) => b.arrayBuffer());
}
