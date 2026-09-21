import { useRef, useState, DragEvent } from 'react';
import { Upload, X, File as FileIcon, Plus } from 'lucide-react';
import { formatBytes } from '@/lib/validation';
import { ToolMeta } from '@/lib/constants';

interface FileUploadProps {
  tool: ToolMeta;
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

export default function FileUpload({ tool, files, onFilesChange, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files);
    if (tool.multiple) {
      onFilesChange([...files, ...dropped]);
    } else {
      onFilesChange(dropped.slice(0, 1));
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (tool.multiple) {
      onFilesChange([...files, ...selected]);
    } else {
      onFilesChange(selected.slice(0, 1));
    }
    e.target.value = '';
  };

  const removeFile = (idx: number) => {
    onFilesChange(files.filter((_, i) => i !== idx));
  };

  const moveFile = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return;
    const next = [...files];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onFilesChange(next);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') inputRef.current?.click(); }}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all ${dragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/50'} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={tool.accept.join(',')}
          multiple={tool.multiple}
          onChange={handleSelect}
          className="hidden"
        />
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <Upload className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-700">Drop {tool.multiple ? 'files' : 'your file'} here</p>
        <p className="mt-1 text-xs text-slate-500">or choose from your device</p>
        <button type="button" className="btn-secondary mt-4 text-xs" disabled={disabled}>
          <Plus className="h-4 w-4" /> Browse Files
        </button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">{files.length} file{files.length > 1 ? 's' : ''} selected</p>
            <button
              type="button"
              onClick={() => onFilesChange([])}
              className="text-xs font-medium text-slate-500 hover:text-red-500"
              disabled={disabled}
            >
              Clear all
            </button>
          </div>
          <ul className="space-y-2">
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <FileIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{f.name}</p>
                  <p className="text-xs text-slate-400">{formatBytes(f.size)} &middot; {f.type || 'unknown type'}</p>
                </div>
                {tool.multiple && files.length > 1 && (
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveFile(i, i - 1)} disabled={i === 0 || disabled} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30">
                      ↑
                    </button>
                    <button type="button" onClick={() => moveFile(i, i + 1)} disabled={i === files.length - 1 || disabled} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30">
                      ↓
                    </button>
                  </div>
                )}
                <button type="button" onClick={() => removeFile(i)} disabled={disabled} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-center text-xs text-slate-400">Maximum file size: 25 MB &middot; Maximum files: 20</p>
    </div>
  );
}
