import { useState, useEffect } from 'react';
import ToolPage from '@/components/ToolPage';
import FileUpload from '@/components/FileUpload';
import ProcessingResult from '@/components/ProcessingResult';
import { TOOL_MAP } from '@/lib/constants';
import { validateFiles } from '@/lib/validation';
import { downloadBlob, baseName } from '@/lib/fileUtils';
import { deletePdfPages } from '@/lib/engines/pdfDeletePages';
import { getPageThumbnails } from '@/lib/pdfUtils';

const tool = TOOL_MAP['delete-pdf-pages'];

export default function DeletePdfPages() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ArrayBuffer | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loadingThumbs, setLoadingThumbs] = useState(false);

  useEffect(() => {
    if (files.length === 0) { setThumbs([]); setSelected(new Set()); return; }
    setLoadingThumbs(true);
    files[0].arrayBuffer().then((buf) =>
      getPageThumbnails(buf).then((t) => {
        setThumbs(t);
        setLoadingThumbs(false);
      })
    ).catch(() => setLoadingThumbs(false));
  }, [files]);

  const togglePage = (idx: number) => {
    const next = new Set(selected);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelected(next);
  };

  const handleProcess = async () => {
    const val = validateFiles(files, tool);
    if (!val.valid) { setStatus('error'); setError(val.error || 'Invalid file.'); return; }
    if (selected.size === 0) { setStatus('error'); setError('Select at least one page to delete.'); return; }
    if (selected.size >= thumbs.length) { setStatus('error'); setError('Cannot delete all pages.'); return; }

    setStatus('processing');
    setError('');
    try {
      const pages = Array.from(selected).map((i) => i + 1);
      const buf = await deletePdfPages(files[0], pages);
      setResult(buf);
      setStatus('success');
    } catch (e: any) {
      setError(e.message || 'Could not delete pages.');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (result) downloadBlob(result, `${baseName(files[0].name)}_edited.pdf`, 'application/pdf');
  };

  const handleReset = () => {
    setFiles([]); setStatus('idle'); setError(''); setResult(null); setThumbs([]); setSelected(new Set());
  };

  return (
    <ToolPage tool={tool}>
      <FileUpload tool={tool} files={files} onFilesChange={setFiles} disabled={status === 'processing'} />

      {files.length > 0 && status === 'idle' && (
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">Select pages to delete</p>
            <p className="mt-1 text-xs text-slate-400">Click thumbnails to mark pages for deletion.</p>
          </div>

          {loadingThumbs && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-200 border-t-brand-600" />
            </div>
          )}

          {thumbs.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {thumbs.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => togglePage(i)}
                    className={`relative overflow-hidden rounded-lg border-2 transition-all ${selected.has(i) ? 'border-red-500 opacity-50' : 'border-slate-200 hover:border-brand-400'}`}
                  >
                    <img src={src} alt={`Page ${i + 1}`} className="w-full" />
                    <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">{i + 1}</span>
                    {selected.has(i) && (
                      <span className="absolute inset-0 flex items-center justify-center bg-red-500/30">
                        <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">Delete</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-500">{selected.size} page{selected.size !== 1 ? 's' : ''} selected for deletion</p>
              <button type="button" onClick={handleProcess} className="btn-primary w-full">Delete {selected.size} Page{selected.size !== 1 ? 's' : ''}</button>
            </>
          )}
        </div>
      )}

      <ProcessingResult
        status={status}
        progressText="Deleting pages..."
        error={error}
        successText="Your edited PDF is ready."
        onDownload={handleDownload}
        onReset={handleReset}
      />
    </ToolPage>
  );
}
