import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { ToolMeta } from '@/lib/constants';

interface ToolPageProps {
  tool: ToolMeta;
  children: ReactNode;
}

export default function ToolPage({ tool, children }: ToolPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="capitalize">{tool.category === 'convert' ? 'Convert' : 'PDF Tools'}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-600">{tool.title}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{tool.title}</h1>
        <p className="mt-2 text-slate-500">{tool.description}</p>
      </div>

      <div className="card p-6 sm:p-8">{children}</div>

      <div className="mt-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to all tools
        </Link>
      </div>
    </div>
  );
}
