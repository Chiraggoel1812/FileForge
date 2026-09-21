import { PDFDocument, degrees } from 'pdf-lib';

export async function rotatePdf(
  file: File,
  rotation: 90 | 180 | 270
): Promise<ArrayBuffer> {
  const data = await file.arrayBuffer();
  const pdf = await PDFDocument.load(data, { ignoreEncryption: true });

  const pages = pdf.getPages();
  for (const page of pages) {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + rotation) % 360));
  }

  return pdf.save();
}
