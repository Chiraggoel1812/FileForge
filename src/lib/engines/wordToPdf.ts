import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';

interface TextBlock {
  text: string;
  size: number;
  bold: boolean;
  italic: boolean;
  heading: boolean;
  listItem: boolean;
}

function htmlToBlocks(html: string): TextBlock[] {
  const blocks: TextBlock[] = [];
  const container = document.createElement('div');
  container.innerHTML = html;

  function walk(node: Node, ctx: { bold: boolean; italic: boolean; heading: boolean; listItem: boolean; size: number }) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim() || '';
      if (text) {
        blocks.push({ text, size: ctx.size, bold: ctx.bold, italic: ctx.italic, heading: ctx.heading, listItem: ctx.listItem });
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const newCtx = { ...ctx };
    if (tag === 'strong' || tag === 'b') newCtx.bold = true;
    if (tag === 'em' || tag === 'i') newCtx.italic = true;
    if (tag === 'h1') { newCtx.heading = true; newCtx.size = 22; newCtx.bold = true; }
    if (tag === 'h2') { newCtx.heading = true; newCtx.size = 18; newCtx.bold = true; }
    if (tag === 'h3') { newCtx.heading = true; newCtx.size = 16; newCtx.bold = true; }
    if (tag === 'h4' || tag === 'h5' || tag === 'h6') { newCtx.heading = true; newCtx.size = 14; newCtx.bold = true; }
    if (tag === 'li') newCtx.listItem = true;
    if (tag === 'p' || tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6' || tag === 'li') {
      for (const child of el.childNodes) walk(child, newCtx);
      blocks.push({ text: '', size: 0, bold: false, italic: false, heading: false, listItem: false });
      return;
    }
    if (tag === 'br') {
      blocks.push({ text: '\n', size: ctx.size, bold: false, italic: false, heading: false, listItem: false });
      return;
    }
    if (tag === 'table') {
      for (const row of el.querySelectorAll('tr')) {
        const cells = Array.from(row.querySelectorAll('td, th'));
        const cellTexts = cells.map(c => c.textContent?.trim() || '');
        blocks.push({ text: cellTexts.join('  |  '), size: 11, bold: row.querySelector('th') !== null, italic: false, heading: false, listItem: false });
      }
      blocks.push({ text: '', size: 0, bold: false, italic: false, heading: false, listItem: false });
      return;
    }
    for (const child of el.childNodes) walk(child, newCtx);
  }

  walk(container, { bold: false, italic: false, heading: false, listItem: false, size: 12 });
  return blocks;
}

function wrapText(jsPdf: jsPDF, text: string, maxWidth: number, fontSize: number): string[] {
  jsPdf.setFontSize(fontSize);
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    const w = jsPdf.getTextWidth(test);
    if (w > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function wordToPdf(file: File): Promise<ArrayBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value || '<p>Empty document.</p>';
  const blocks = htmlToBlocks(html);

  const pdf = new jsPDF('p', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 50;
  const usableWidth = pageWidth - margin * 2;
  let y = margin;
  const lineSpacing = 16;
  const paragraphSpacing = 10;

  function ensureSpace(needed: number) {
    if (y + needed > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  }

  for (const block of blocks) {
    if (block.text === '' && block.size === 0) {
      y += paragraphSpacing;
      continue;
    }
    if (block.text === '\n') {
      y += lineSpacing;
      continue;
    }

    const fontSize = block.heading ? block.size : block.size;
    const fontStyle = block.bold ? 'bold' : block.italic ? 'italic' : 'normal';
    const prefix = block.listItem ? '• ' : '';

    pdf.setFont('helvetica', fontStyle);
    const lines = wrapText(pdf, prefix + block.text, usableWidth, fontSize);

    for (const line of lines) {
      ensureSpace(lineSpacing + (block.heading ? 4 : 0));
      pdf.setFontSize(fontSize);
      pdf.text(line, margin, y);
      y += lineSpacing + (block.heading ? 4 : 0);
    }
    y += block.heading ? 8 : paragraphSpacing;
  }

  return pdf.output('arraybuffer');
}
