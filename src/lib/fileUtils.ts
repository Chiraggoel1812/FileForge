export async function downloadBlob(data: Blob | ArrayBuffer, filename: string, type: string) {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const { saveAs } = await import('file-saver');
  saveAs(blob, filename);
}

export function baseName(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(0, idx) : name;
}

export function sanitizeName(name: string): string {
  const base = name.replace(/\.\./g, '_').replace(/[^a-zA-Z0-9._\-\s]/g, '_').trim();
  return base.replace(/^\.+/, '');
}

export async function readArrayBuffer(file: File): Promise<ArrayBuffer> {
  return await file.arrayBuffer();
}
