import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export async function loadPdf(data: ArrayBuffer) {
  return pdfjsLib.getDocument({ data }).promise;
}

export async function renderPageToCanvas(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  scale: number = 1.5
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return canvas;
}

export async function renderPageToDataURL(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  scale: number = 1.5,
  type: string = 'image/jpeg',
  quality: number = 0.92
): Promise<string> {
  const canvas = await renderPageToCanvas(pdf, pageNum, scale);
  return canvas.toDataURL(type, quality);
}

export async function getPageCount(data: ArrayBuffer): Promise<number> {
  const pdf = await loadPdf(data);
  return pdf.numPages;
}

export async function getPageThumbnails(
  data: ArrayBuffer,
  maxPages: number = 50
): Promise<string[]> {
  const pdf = await loadPdf(data);
  const count = Math.min(pdf.numPages, maxPages);
  const thumbs: string[] = [];
  for (let i = 1; i <= count; i++) {
    const canvas = await renderPageToCanvas(pdf, i, 0.5);
    thumbs.push(canvas.toDataURL('image/jpeg', 0.6));
  }
  return thumbs;
}
