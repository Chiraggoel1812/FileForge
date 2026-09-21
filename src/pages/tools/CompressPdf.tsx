import { useState } from 'react';
import ToolPage from '@/components/ToolPage';
import FileUpload from '@/components/FileUpload';
import ProcessingResult from '@/components/ProcessingResult';
import { TOOL_MAP } from '@/lib/constants';
import { validateFiles, formatBytes } from '@/lib/validation';
import { downloadBlob, baseName } from '@/lib/fileUtils';
import { compressPdf } from '@/lib/engines/pdfCompress';

const tool = TOOL_MAP['compress-pdf'];

export default function CompressPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ buffer: ArrayBuffer; saved: boolean; original: number; compressed: number } | null>(null);
  const [level, setLevel] = useState<'basic' | 'strong'>('basic');

  const handleProcess = async () => {
    const val = validateFiles(files, tool);
    if (!val.valid) { setStatus('error'); setError(val.error || 'Invalid file.'); return; }

    setStatus('processing');
    setError('');
    try {
      const res = await compressPdf(files[0], level === 'strong');
      setResult({ buffer: res.buffer, saved: res.saved, original: res.originalSize, compressed: res.compressedSize });
      setStatus('success');
    } catch (e: any) {
      setError(e.message || 'Could not compress this PDF.');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (result) downloadBlob(result.buffer, `${baseName(files[0].name)}_compressed.pdf`, 'application/pdf');
  };

  const handleReset = () => {
    setFiles([]); setStatus('idle'); setError(''); setResult(null);
  };

  const pct = result ? Math.round((1 - result.compressed / result.original) * 100) : 0;

  return (
    <ToolPage tool={tool}>
      <FileUpload tool={tool} files={files} onFilesChange={setFiles} disabled={status === 'processing'} />

      {files.length > 0 && status === 'idle' && (
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Compression level</label>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setLevel('basic')}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${level === 'basic' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white text-slate-600'}`}
              >
                Basic compression
              </button>
              <button
                type="button"
                onClick={() => setLevel('strong')}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${level === 'strong' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white text-slate-600'}`}
              >
                Strong compression
              </button>
            </div>
          </div>
          <button type="button" onClick={handleProcess} className="btn-primary w-full">Compress PDF</button>
        </div>
      )}

      {status === 'success' && result && (
        <div className="mt-6 flex flex-col items-center rounded-xl bg-green-50 px-6 py-8 text-center">
          <p className="text-sm font-medium text-green-700">
            {result.saved ? 'Your compressed PDF is ready.' : 'Already compact — no further compression possible.'}
          </p>
          {result.saved ? (
            <div className="mt-3 flex gap-6 text-sm">
              <div><span className="text-slate-500">Original:</span> <span className="font-semibold text-slate-700">{formatBytes(result.original)}</span></div>
              <div><span className="text-slate-500">Compressed:</span> <span className="font-semibold text-slate-700">{formatBytes(result.compressed)}</span></div>
              <div><span className="text-slate-500">Saved:</span> <span className="font-semibold text-green-600">{pct}%</span></div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-green-600">The file was already small enough. Original is returned.</p>
          )}
          <button type="button" onClick={handleDownload} className="btn-primary mt-4">Download result</button>
          <button type="button" onClick={handleReset} className="btn-secondary mt-3 text-xs">Process another</button>
        </div>
      )}

      {status === 'processing' && (
        <div className="mt-6 flex flex-col items-center rounded-xl bg-brand-50 px-6 py-8 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-200 border-t-brand-600" />
          <p className="mt-3 text-sm font-medium text-brand-700">Compressing your PDF...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-6 flex flex-col items-center rounded-xl bg-red-50 px-6 py-8 text-center">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button type="button" onClick={handleReset} className="btn-secondary mt-4 text-xs">Try Again</button>
        </div>
      )}
    </ToolPage>
  );
}
