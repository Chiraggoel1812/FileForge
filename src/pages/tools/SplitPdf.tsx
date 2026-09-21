import { useState } from 'react';
import ToolPage from '@/components/ToolPage';
import FileUpload from '@/components/FileUpload';
import ProcessingResult from '@/components/ProcessingResult';
import { TOOL_MAP } from '@/lib/constants';
import { validateFiles } from '@/lib/validation';
import { downloadBlob, baseName } from '@/lib/fileUtils';
import { splitPdf, SplitOptions } from '@/lib/engines/pdfSplit';

const tool = TOOL_MAP['split-pdf'];

export default function SplitPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ buffer: ArrayBuffer; isZip: boolean } | null>(null);
  const [mode, setMode] = useState<'ranges' | 'every'>('ranges');
  const [ranges, setRanges] = useState('');

  const handleProcess = async () => {
    const val = validateFiles(files, tool);
    if (!val.valid) { setStatus('error'); setError(val.error || 'Invalid file.'); return; }

    if (mode === 'ranges' && !ranges.trim()) {
      setStatus('error'); setError('Enter page ranges (e.g. 1-3,5,8-10).');
      return;
    }

    setStatus('processing');
    setError('');
    try {
      const opts: SplitOptions = { mode, ranges: mode === 'ranges' ? ranges : undefined };
      const res = await splitPdf(files[0], opts);
      setResult({ buffer: res.buffer, isZip: res.isZip });
      setStatus('success');
    } catch (e: any) {
      setError(e.message || 'Could not split this PDF.');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    if (result.isZip) {
      downloadBlob(result.buffer, `${baseName(files[0].name)}_split.zip`, 'application/zip');
    } else {
      downloadBlob(result.buffer, `${baseName(files[0].name)}_extract.pdf`, 'application/pdf');
    }
  };

  const handleReset = () => {
    setFiles([]); setStatus('idle'); setError(''); setResult(null); setRanges('');
  };

  return (
    <ToolPage tool={tool}>
      <FileUpload tool={tool} files={files} onFilesChange={setFiles} disabled={status === 'processing'} />

      {files.length > 0 && status === 'idle' && (
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Split mode</label>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setMode('ranges')}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${mode === 'ranges' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white text-slate-600'}`}
              >
                Extract ranges
              </button>
              <button
                type="button"
                onClick={() => setMode('every')}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${mode === 'every' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white text-slate-600'}`}
              >
                Split every page
              </button>
            </div>
          </div>

          {mode === 'ranges' && (
            <div>
              <label htmlFor="ranges" className="text-sm font-semibold text-slate-700">Page ranges</label>
              <input
                id="ranges"
                type="text"
                value={ranges}
                onChange={(e) => setRanges(e.target.value)}
                placeholder="e.g. 1-3,5,8-10"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              <p className="mt-1 text-xs text-slate-400">Use commas to separate. Ranges use dashes. Example: 1-3,5,8-10</p>
            </div>
          )}

          <button type="button" onClick={handleProcess} className="btn-primary w-full">Split PDF</button>
        </div>
      )}

      <ProcessingResult
        status={status}
        progressText="Splitting your PDF..."
        error={error}
        successText={result?.isZip ? 'Your split files are ready (ZIP).' : 'Your extracted PDF is ready.'}
        onDownload={handleDownload}
        onReset={handleReset}
      />
    </ToolPage>
  );
}
