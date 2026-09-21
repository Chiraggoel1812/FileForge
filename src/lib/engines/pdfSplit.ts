import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { baseName } from '../fileUtils';

export interface SplitOptions {
  mode: 'ranges' | 'every';
  ranges?: string;
}

function parseRanges(input: string, maxPage: number): number[][] {
  const parts = input.split(',').map((s) => s.trim()).filter(Boolean);
  const result: number[][] = [];

  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1]);
      const end = parseInt(rangeMatch[2]);
      if (start < 1 || end > maxPage || start > end) {
        throw new Error(`Invalid range: ${part}. PDF has ${maxPage} pages.`);
      }
      const pages: number[] = [];
      for (let i = start; i <= end; i++) pages.push(i);
      result.push(pages);
    } else if (/^\d+$/.test(part)) {
      const p = parseInt(part);
      if (p < 1 || p > maxPage) {
        throw new Error(`Invalid page: ${part}. PDF has ${maxPage} pages.`);
      }
      result.push([p]);
    } else {
      throw new Error(`Invalid range format: ${part}`);
    }
  }
  return result;
}

export async function splitPdf(
  file: File,
  options: SplitOptions
): Promise<{ buffer: ArrayBuffer; isZip: boolean; count: number }> {
  const data = await file.arrayBuffer();
  const src = await PDFDocument.load(data, { ignoreEncryption: true });
  const total = src.getPageCount();

  if (options.mode === 'every') {
    const zip = new JSZip();
    for (let i = 0; i < total; i++) {
      const out = await PDFDocument.create();
      const [page] = await out.copyPages(src, [i]);
      out.addPage(page);
      const bytes = await out.save();
      zip.file(`${baseName(file.name)}_page_${i + 1}.pdf`, bytes);
    }
    return {
      buffer: await zip.generateAsync({ type: 'arraybuffer' }),
      isZip: true,
      count: total,
    };
  }

  const ranges = parseRanges(options.ranges || '1', total);
  if (ranges.length === 1) {
    const out = await PDFDocument.create();
    const indices = ranges[0].map((p) => p - 1);
    const pages = await out.copyPages(src, indices);
    pages.forEach((p) => out.addPage(p));
    return { buffer: await out.save(), isZip: false, count: 1 };
  }

  const zip = new JSZip();
  for (let i = 0; i < ranges.length; i++) {
    const out = await PDFDocument.create();
    const indices = ranges[i].map((p) => p - 1);
    const pages = await out.copyPages(src, indices);
    pages.forEach((p) => out.addPage(p));
    zip.file(`${baseName(file.name)}_part_${i + 1}.pdf`, await out.save());
  }
  return {
    buffer: await zip.generateAsync({ type: 'arraybuffer' }),
    isZip: true,
    count: ranges.length,
  };
}
