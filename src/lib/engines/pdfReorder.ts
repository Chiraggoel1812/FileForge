import { PDFDocument } from 'pdf-lib';

export async function reorderPdfPages(
  file: File,
  newOrder: number[]
): Promise<ArrayBuffer> {
  const data = await file.arrayBuffer();
  const pdf = await PDFDocument.load(data, { ignoreEncryption: true });
  const total = pdf.getPageCount();

  if (newOrder.length === 0) throw new Error('No page order specified.');
  if (newOrder.some((p) => p < 1 || p > total)) {
    throw new Error(`Page numbers must be between 1 and ${total}.`);
  }

  const indices = newOrder.map((p) => p - 1);
  const newPdf = await PDFDocument.create();
  const pages = await newPdf.copyPages(pdf, indices);
  pages.forEach((p) => newPdf.addPage(p));

  return newPdf.save();
}
