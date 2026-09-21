import { PDFDocument } from 'pdf-lib';
import { loadPdf, renderPageToCanvas } from '../pdfUtils';
import { jsPDF } from 'jspdf';

export interface CompressResult {
  buffer: ArrayBuffer;
  originalSize: number;
  compressedSize: number;
  saved: boolean;
}

export async function compressPdf(
  file: File,
  strong: boolean
): Promise<CompressResult> {
  const originalSize = file.size;
  const data = await file.arrayBuffer();

  const pdf = await loadPdf(data);
  const scale = strong ? 1.0 : 1.5;
  const quality = strong ? 0.5 : 0.75;

  const outPdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;

  for (let i = 1; i <= pdf.numPages; i++) {
    const canvas = await renderPageToCanvas(pdf, i, scale);
    const imgData = canvas.toDataURL('image/jpeg', quality);
    if (i > 1) outPdf.addPage();
    outPdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
  }

  const compressed = outPdf.output('arraybuffer');

  if (compressed.byteLength >= originalSize) {
    return {
      buffer: data,
      originalSize,
      compressedSize: originalSize,
      saved: false,
    };
  }

  return {
    buffer: compressed,
    originalSize,
    compressedSize: compressed.byteLength,
    saved: true,
  };
}
