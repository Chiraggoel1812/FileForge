import { useState } from 'react';
import ToolPage from '@/components/ToolPage';
import FileUpload from '@/components/FileUpload';
import ProcessingResult from '@/components/ProcessingResult';
import { TOOL_MAP } from '@/lib/constants';
import { validateFiles } from '@/lib/validation';
import { downloadBlob } from '@/lib/fileUtils';
import { mergePdfs } from '@/lib/engines/pdfMerge';

const tool = TOOL_MAP['merge-pdf'];

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ArrayBuffer | null>(null);

  const handleProcess = async () => {
    const val = validateFiles(files, tool);
    if (!val.valid) { setStatus('error'); setError(val.error || 'Invalid file.'); return; }
    if (files.length < 2) { setStatus('error'); setError('Select at least 2 PDFs to merge.'); return; }

    setStatus('processing');
    setError('');
    try {
      const buf = await mergePdfs(files);
      setResult(buf);
      setStatus('success');
    } catch (e: any) {
      setError(e.message || 'Could not merge these PDFs.');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (result) downloadBlob(result, 'merged.pdf', 'application/pdf');
  };

  const handleReset = () => {
    setFiles([]); setStatus('idle'); setError(''); setResult(null);
  };

  return (
    <ToolPage tool={tool}>
      <FileUpload tool={tool} files={files} onFilesChange={setFiles} disabled={status === 'processing'} />
      {files.length > 0 && status === 'idle' && (
        <button type="button" onClick={handleProcess} className="btn-primary mt-6 w-full">Merge {files.length} PDF{files.length > 1 ? 's' : ''}</button>
      )}
      <ProcessingResult
        status={status}
        progressText="Merging your PDFs..."
        error={error}
        successText="Your merged PDF is ready."
        onDownload={handleDownload}
        onReset={handleReset}
      />
    </ToolPage>
  );
}
