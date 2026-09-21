import { useState } from 'react';
import ToolPage from '@/components/ToolPage';
import FileUpload from '@/components/FileUpload';
import ProcessingResult from '@/components/ProcessingResult';
import { TOOL_MAP } from '@/lib/constants';
import { validateFiles } from '@/lib/validation';
import { downloadBlob, baseName } from '@/lib/fileUtils';
import { rotatePdf } from '@/lib/engines/pdfRotate';

const tool = TOOL_MAP['rotate-pdf'];

export default function RotatePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ArrayBuffer | null>(null);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);

  const handleProcess = async () => {
    const val = validateFiles(files, tool);
    if (!val.valid) { setStatus('error'); setError(val.error || 'Invalid file.'); return; }

    setStatus('processing');
    setError('');
    try {
      const buf = await rotatePdf(files[0], rotation);
      setResult(buf);
      setStatus('success');
    } catch (e: any) {
      setError(e.message || 'Could not rotate this PDF.');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (result) downloadBlob(result, `${baseName(files[0].name)}_rotated.pdf`, 'application/pdf');
  };

  const handleReset = () => {
    setFiles([]); setStatus('idle'); setError(''); setResult(null);
  };

  return (
    <ToolPage tool={tool}>
      <FileUpload tool={tool} files={files} onFilesChange={setFiles} disabled={status === 'processing'} />

      {files.length > 0 && status === 'idle' && (
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Rotation angle</label>
            <div className="mt-2 flex gap-3">
              {([90, 180, 270] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRotation(r)}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${rotation === r ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white text-slate-600'}`}
                >
                  {r}°
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={handleProcess} className="btn-primary w-full">Rotate PDF</button>
        </div>
      )}

      <ProcessingResult
        status={status}
        progressText="Rotating your PDF..."
        error={error}
        successText="Your rotated PDF is ready."
        onDownload={handleDownload}
        onReset={handleReset}
      />
    </ToolPage>
  );
}
