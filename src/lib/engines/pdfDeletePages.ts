import { PDFDocument } from 'pdf-lib';

export async function deletePdfPages(
  file: File,
  pagesToDelete: number[]
): Promise<ArrayBuffer> {
  const data = await file.arrayBuffer();
  const pdf = await PDFDocument.load(data, { ignoreEncryption: true });
  const total = pdf.getPageCount();
  const toDelete = new Set(pagesToDelete.map((p) => p - 1));

  const keepIndices: number[] = [];
  for (let i = 0; i < total; i++) {
    if (!toDelete.has(i)) keepIndices.push(i);
  }

  if (keepIndices.length === 0) {
    throw new Error('Cannot delete all pages.');
  }

  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdf, keepIndices);
  pages.forEach((p) => newPdf.addPage(p));

  return newPdf.save();
}
