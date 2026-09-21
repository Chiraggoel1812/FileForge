import { Download, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ProcessingResultProps {
  status: 'idle' | 'processing' | 'success' | 'error';
  progressText?: string;
  error?: string;
  successText?: string;
  onDownload?: () => void;
  onReset?: () => void;
  extraInfo?: string;
}

export default function ProcessingResult({
  status,
  progressText,
  error,
  successText,
  onDownload,
  onReset,
  extraInfo,
}: ProcessingResultProps) {
  if (status === 'idle') return null;

  if (status === 'processing') {
    return (
      <div className="mt-6 flex flex-col items-center rounded-xl bg-brand-50 px-6 py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <p className="mt-3 text-sm font-medium text-brand-700">{progressText || 'Processing...'}</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mt-6 flex flex-col items-center rounded-xl bg-red-50 px-6 py-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="mt-3 text-sm font-medium text-red-700">{error || 'Something went wrong. Please try again.'}</p>
        {onReset && (
          <button type="button" onClick={onReset} className="btn-secondary mt-4 text-xs">
            <RotateCcw className="h-4 w-4" /> Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center rounded-xl bg-green-50 px-6 py-8 text-center">
      <CheckCircle2 className="h-8 w-8 text-green-500" />
      <p className="mt-3 text-sm font-medium text-green-700">{successText || 'Your file is finished.'}</p>
      {extraInfo && <p className="mt-1 text-xs text-green-600">{extraInfo}</p>}
      {onDownload && (
        <button type="button" onClick={onDownload} className="btn-primary mt-4">
          <Download className="h-4 w-4" /> Download result
        </button>
      )}
      {onReset && (
        <button type="button" onClick={onReset} className="btn-secondary mt-3 text-xs">
          <RotateCcw className="h-4 w-4" /> Process another
        </button>
      )}
    </div>
  );
}
