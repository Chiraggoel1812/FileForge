import { useState } from 'react';
import ToolPage from '@/components/ToolPage';
import FileUpload from '@/components/FileUpload';
import ProcessingResult from '@/components/ProcessingResult';
import { TOOL_MAP } from '@/lib/constants';
import { validateFiles } from '@/lib/validation';
import { downloadBlob, baseName } from '@/lib/fileUtils';
import { pdfToPng } from '@/lib/engines/pdfToImages';

const tool = TOOL_MAP['pdf-to-png'];

export default function PdfToPng() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ArrayBuffer | null>(null);

  const handleProcess = async () => {
    const val = validateFiles(files, tool);
    if (!val.valid) { setStatus('error'); setError(val.error || 'Invalid file.'); return; }

    setStatus('processing');
    setError('');
    try {
      const buf = await pdfToPng(files[0]);
      setResult(buf);
      setStatus('success');
    } catch (e: any) {
      setError(e.message || 'Could not process this document.');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (result) downloadBlob(result, `${baseName(files[0].name)}_images.zip`, 'application/zip');
  };

  const handleReset = () => {
    setFiles([]); setStatus('idle'); setError(''); setResult(null);
  };

  return (
    <ToolPage tool={tool}>
      <FileUpload tool={tool} files={files} onFilesChange={setFiles} disabled={status === 'processing'} />
      {files.length > 0 && status === 'idle' && (
        <button type="button" onClick={handleProcess} className="btn-primary mt-6 w-full">Convert PDF to PNG</button>
      )}
      <ProcessingResult
        status={status}
        progressText="Rendering PDF pages to PNG..."
        error={error}
        successText="Your PNG images are ready."
        onDownload={handleDownload}
        onReset={handleReset}
      />
    </ToolPage>
  );
}
