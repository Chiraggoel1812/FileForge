import { Link, useLocation } from 'react-router-dom';
import { Hammer } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className={`sticky top-0 z-50 transition-all ${isHome ? 'bg-white/80 backdrop-blur-md' : 'bg-white border-b border-slate-200'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/20 transition-transform group-hover:scale-105">
            <Hammer className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">FileForge</span>
        </Link>
        <nav className="hidden items-center gap-6 sm:flex">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Home</Link>
          <Link to="/#convert" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Convert</Link>
          <Link to="/#pdf-tools" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">PDF Tools</Link>
          <Link to="/privacy" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Privacy</Link>
          <Link to="/terms" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Terms</Link>
        </nav>
        <Link to="/" className="sm:hidden">
          <span className="text-sm font-semibold text-brand-600">Tools</span>
        </Link>
      </div>
    </header>
  );
}
