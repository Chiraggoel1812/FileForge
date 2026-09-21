import { LIMITS, ToolMeta } from './constants';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const EXT_MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

function getExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx).toLowerCase() : '';
}

export function validateFile(file: File, tool: ToolMeta): ValidationResult {
  const ext = getExtension(file.name);
  if (!tool.accept.includes(ext)) {
    return { valid: false, error: `Unsupported file type. Accepted: ${tool.accept.join(', ')}` };
  }
  if (file.size === 0) {
    return { valid: false, error: 'File is empty.' };
  }
  if (file.size > LIMITS.MAX_FILE_SIZE) {
    return { valid: false, error: `File is too large. Maximum: 25 MB.` };
  }
  return { valid: true };
}

export function validateFiles(files: File[], tool: ToolMeta): ValidationResult {
  if (files.length === 0) {
    return { valid: false, error: 'No files selected.' };
  }
  if (files.length > LIMITS.MAX_FILES) {
    return { valid: false, error: `Too many files. Maximum: ${LIMITS.MAX_FILES}.` };
  }
  let total = 0;
  for (const f of files) {
    const r = validateFile(f, tool);
    if (!r.valid) return r;
    total += f.size;
  }
  if (total > LIMITS.MAX_TOTAL_SIZE) {
    return { valid: false, error: 'Total size exceeds 100 MB.' };
  }
  return { valid: true };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export { getExtension };
