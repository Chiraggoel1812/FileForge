import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { ToolMeta } from '@/lib/constants';

export default function ToolCard({ tool }: { tool: ToolMeta }) {
  const Icon = (Icons as any)[tool.icon] || Icons.File;

  return (
    <Link
      to={`/tool/${tool.id}`}
      className="card group flex flex-col p-5 transition-all hover:border-brand-300 hover:shadow-lg hover:shadow-brand-100/50"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tool.accent} text-white shadow-md transition-transform group-hover:scale-105`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{tool.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{tool.description}</p>
      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
        Open tool <ChevronRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
