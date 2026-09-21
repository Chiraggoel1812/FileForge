import { Link } from 'react-router-dom';
import { Hammer } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Hammer className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-slate-900">FileForge</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">Simple. Free. Private. Your documents are processed in your browser and never uploaded to a server.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Convert</h3>
              <ul className="mt-3 space-y-2">
                <li><Link to="/tool/word-to-pdf" className="text-sm text-slate-500 hover:text-brand-600">Word to PDF</Link></li>
                <li><Link to="/tool/pdf-to-word" className="text-sm text-slate-500 hover:text-brand-600">PDF to Word</Link></li>
                <li><Link to="/tool/pdf-to-jpg" className="text-sm text-slate-500 hover:text-brand-600">PDF to JPG</Link></li>
                <li><Link to="/tool/jpg-to-pdf" className="text-sm text-slate-500 hover:text-brand-600">JPG to PDF</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">PDF Tools</h3>
              <ul className="mt-3 space-y-2">
                <li><Link to="/tool/merge-pdf" className="text-sm text-slate-500 hover:text-brand-600">Merge PDF</Link></li>
                <li><Link to="/tool/split-pdf" className="text-sm text-slate-500 hover:text-brand-600">Split PDF</Link></li>
                <li><Link to="/tool/compress-pdf" className="text-sm text-slate-500 hover:text-brand-600">Compress PDF</Link></li>
                <li><Link to="/tool/rotate-pdf" className="text-sm text-slate-500 hover:text-brand-600">Rotate PDF</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Legal</h3>
              <ul className="mt-3 space-y-2">
                <li><Link to="/privacy" className="text-sm text-slate-500 hover:text-brand-600">Privacy</Link></li>
                <li><Link to="/terms" className="text-sm text-slate-500 hover:text-brand-600">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} FileForge. All processing happens locally in your browser.</p>
        </div>
      </div>
    </footer>
  );
}
