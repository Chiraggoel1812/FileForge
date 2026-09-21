import { PDFDocument } from 'pdf-lib';

async function imagesToPdf(files: File[], isPng: boolean): Promise<ArrayBuffer> {
  const pdf = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    let img;
    if (isPng) {
      img = await pdf.embedPng(bytes);
    } else {
      img = await pdf.embedJpg(bytes);
    }
    const page = pdf.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }

  return pdf.save();
}

export async function jpgToPdf(files: File[]): Promise<ArrayBuffer> {
  return imagesToPdf(files, false);
}

export async function pngToPdf(files: File[]): Promise<ArrayBuffer> {
  return imagesToPdf(files, true);
}
