import { useState, useEffect } from 'react';
import ToolPage from '@/components/ToolPage';
import FileUpload from '@/components/FileUpload';
import ProcessingResult from '@/components/ProcessingResult';
import { TOOL_MAP } from '@/lib/constants';
import { validateFiles } from '@/lib/validation';
import { downloadBlob, baseName } from '@/lib/fileUtils';
import { reorderPdfPages } from '@/lib/engines/pdfReorder';
import { getPageThumbnails } from '@/lib/pdfUtils';

const tool = TOOL_MAP['reorder-pdf-pages'];

export default function ReorderPdfPages() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ArrayBuffer | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [loadingThumbs, setLoadingThumbs] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    if (files.length === 0) { setThumbs([]); setOrder([]); return; }
    setLoadingThumbs(true);
    files[0].arrayBuffer().then((buf) =>
      getPageThumbnails(buf).then((t) => {
        setThumbs(t);
        setOrder(t.map((_, i) => i));
        setLoadingThumbs(false);
      })
    ).catch(() => setLoadingThumbs(false));
  }, [files]);

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const next = [...order];
    const [item] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, item);
    setOrder(next);
    setDragIdx(null);
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrder(next);
  };

  const handleProcess = async () => {
    const val = validateFiles(files, tool);
    if (!val.valid) { setStatus('error'); setError(val.error || 'Invalid file.'); return; }

    setStatus('processing');
    setError('');
    try {
      const newOrder = order.map((i) => i + 1);
      const buf = await reorderPdfPages(files[0], newOrder);
      setResult(buf);
      setStatus('success');
    } catch (e: any) {
      setError(e.message || 'Could not reorder pages.');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (result) downloadBlob(result, `${baseName(files[0].name)}_reordered.pdf`, 'application/pdf');
  };

  const handleReset = () => {
    setFiles([]); setStatus('idle'); setError(''); setResult(null); setThumbs([]); setOrder([]);
  };

  return (
    <ToolPage tool={tool}>
      <FileUpload tool={tool} files={files} onFilesChange={setFiles} disabled={status === 'processing'} />

      {files.length > 0 && status === 'idle' && (
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-700">Drag to reorder pages</p>
            <p className="mt-1 text-xs text-slate-400">The output will match this exact order. Use arrows on mobile.</p>
          </div>

          {loadingThumbs && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-200 border-t-brand-600" />
            </div>
          )}

          {thumbs.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {order.map((origIdx, pos) => (
                  <div
                    key={origIdx}
                    draggable
                    onDragStart={() => handleDragStart(pos)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(pos)}
                    className={`relative cursor-move overflow-hidden rounded-lg border-2 transition-all ${dragIdx === pos ? 'border-brand-500 opacity-40' : 'border-slate-200 hover:border-brand-400'}`}
                  >
                    <img src={thumbs[origIdx]} alt={`Page ${origIdx + 1}`} className="w-full" draggable={false} />
                    <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">{pos + 1}</span>
                    <span className="absolute right-1 top-1 rounded bg-brand-600/80 px-1.5 py-0.5 text-xs font-medium text-white">was {origIdx + 1}</span>
                    <div className="flex justify-between px-1 py-0.5">
                      <button type="button" onClick={() => moveItem(pos, pos - 1)} disabled={pos === 0} className="text-xs text-slate-500 disabled:opacity-30">↑</button>
                      <button type="button" onClick={() => moveItem(pos, pos + 1)} disabled={pos === order.length - 1} className="text-xs text-slate-500 disabled:opacity-30">↓</button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500">Output order: {order.map((i) => i + 1).join(', ')}</p>
              <button type="button" onClick={handleProcess} className="btn-primary w-full">Reorder Pages</button>
            </>
          )}
        </div>
      )}

      <ProcessingResult
        status={status}
        progressText="Reordering pages..."
        error={error}
        successText="Your reordered PDF is ready."
        onDownload={handleDownload}
        onReset={handleReset}
      />
    </ToolPage>
  );
}
