import { PDFDocument } from 'pdf-lib';

export async function mergePdfs(files: File[]): Promise<ArrayBuffer> {
  const merged = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const indices = src.getPages().map((_, i) => i);
    const pages = await merged.copyPages(src, indices);
    pages.forEach((p) => merged.addPage(p));
  }

  return merged.save();
}
