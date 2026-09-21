import { Lock, Trash2, EyeOff, ShieldCheck } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-slate-500">Last updated: {new Date().getFullYear()}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <Lock className="h-6 w-6 text-brand-600" />
          <h2 className="mt-3 font-semibold text-slate-900">Browser-based processing</h2>
          <p className="mt-1 text-sm text-slate-500">All file processing happens directly in your browser. Your files are not uploaded to any server.</p>
        </div>
        <div className="card p-5">
          <Trash2 className="h-6 w-6 text-green-600" />
          <h2 className="mt-3 font-semibold text-slate-900">Temporary processing</h2>
          <p className="mt-1 text-sm text-slate-500">Files exist only in memory during processing and are discarded immediately after.</p>
        </div>
        <div className="card p-5">
          <EyeOff className="h-6 w-6 text-amber-600" />
          <h2 className="mt-3 font-semibold text-slate-900">No accounts required</h2>
          <p className="mt-1 text-sm text-slate-500">No signup, no login, no tracking of your activity or file history.</p>
        </div>
        <div className="card p-5">
          <ShieldCheck className="h-6 w-6 text-teal-600" />
          <h2 className="mt-3 font-semibold text-slate-900">No persistent storage</h2>
          <p className="mt-1 text-sm text-slate-500">We do not maintain any database of user files or processing history.</p>
        </div>
      </div>

      <div className="mt-8 space-y-6 text-slate-600">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">How we process files</h2>
          <p className="mt-2 text-sm">FileForge operates entirely client-side. When you select a file, it is read into your browser's memory, processed using JavaScript libraries, and the result is offered as a download. At no point is your file transmitted to a remote server.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">What we don't collect</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>We do not store your files.</li>
            <li>We do not require any personal information.</li>
            <li>We do not maintain file history.</li>
            <li>We do not use cookies for tracking.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Limitations</h2>
          <p className="mt-2 text-sm">While we take measures to protect your privacy, no system can be guaranteed to be completely secure. We recommend caution when handling sensitive documents.</p>
        </div>
      </div>
    </div>
  );
}
