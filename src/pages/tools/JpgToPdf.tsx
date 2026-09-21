import { useState } from 'react';
import ToolPage from '@/components/ToolPage';
import FileUpload from '@/components/FileUpload';
import ProcessingResult from '@/components/ProcessingResult';
import { TOOL_MAP } from '@/lib/constants';
import { validateFiles } from '@/lib/validation';
import { downloadBlob, baseName } from '@/lib/fileUtils';
import { jpgToPdf } from '@/lib/engines/imagesToPdf';

const tool = TOOL_MAP['jpg-to-pdf'];

export default function JpgToPdf() {
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
      const buf = await jpgToPdf(files);
      setResult(buf);
      setStatus('success');
    } catch (e: any) {
      setError(e.message || 'Could not process these images.');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (result) downloadBlob(result, 'images.pdf', 'application/pdf');
  };

  const handleReset = () => {
    setFiles([]); setStatus('idle'); setError(''); setResult(null);
  };

  return (
    <ToolPage tool={tool}>
      <FileUpload tool={tool} files={files} onFilesChange={setFiles} disabled={status === 'processing'} />
      {files.length > 0 && status === 'idle' && (
        <button type="button" onClick={handleProcess} className="btn-primary mt-6 w-full">Convert JPG to PDF</button>
      )}
      <ProcessingResult
        status={status}
        progressText="Combining images into PDF..."
        error={error}
        successText="Your PDF is ready."
        onDownload={handleDownload}
        onReset={handleReset}
      />
    </ToolPage>
  );
}
