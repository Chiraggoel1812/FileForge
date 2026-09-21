import { loadPdf, renderPageToCanvas } from '../pdfUtils';
import JSZip from 'jszip';
import { baseName } from '../fileUtils';

async function renderPages(
  file: File,
  type: 'image/jpeg' | 'image/png',
  ext: 'jpg' | 'png'
): Promise<{ zip: ArrayBuffer; count: number }> {
  const data = await file.arrayBuffer();
  const pdf = await loadPdf(data);
  const zip = new JSZip();

  for (let i = 1; i <= pdf.numPages; i++) {
    const canvas = await renderPageToCanvas(pdf, i, 2.0);
    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b!), type, type === 'image/jpeg' ? 0.92 : undefined)
    );
    const numStr = String(i).padStart(2, '0');
    zip.file(`${baseName(file.name)}_page_${numStr}.${ext}`, blob);
  }

  return { zip: await zip.generateAsync({ type: 'arraybuffer' }), count: pdf.numPages };
}

export async function pdfToJpg(file: File): Promise<ArrayBuffer> {
  const { zip } = await renderPages(file, 'image/jpeg', 'jpg');
  return zip;
}

export async function pdfToPng(file: File): Promise<ArrayBuffer> {
  const { zip } = await renderPages(file, 'image/png', 'png');
  return zip;
}
