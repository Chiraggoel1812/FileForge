import { PDFDocument } from 'pdf-lib';

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

  const pdf = await PDFDocument.load(data, { ignoreEncryption: true });

  // Re-save with stream compression. pdf-lib compresses uncompressed
  // object streams and removes orphaned objects, preserving all text,
  // vectors, images, and page dimensions.
  const compressed = await pdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

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
