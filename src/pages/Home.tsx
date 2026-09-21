import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Check, Shield, Zap, Lock } from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import { TOOLS } from '@/lib/constants';

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  const convertTools = TOOLS.filter((t) => t.category === 'convert');
  const pdfTools = TOOLS.filter((t) => t.category === 'pdf-tools');

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-100 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-brand-700">
            <Zap className="h-4 w-4" /> Simple. Free. Private.
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Free PDF &amp; Document Tools
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
            Convert, merge, split, compress and manage your documents online.
          </p>
          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              { icon: Check, text: 'Free to use' },
              { icon: Check, text: 'No signup required' },
              { icon: Check, text: 'No watermark' },
              { icon: Check, text: 'Temporary processing' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-sm text-slate-600">
                <Icon className="h-4 w-4 text-green-500" /> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Convert section */}
      <section id="convert" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Convert</h2>
          <p className="mt-1 text-sm text-slate-500">Transform files between formats.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {convertTools.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      </section>

      {/* PDF Tools section */}
      <section id="pdf-tools" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">PDF Tools</h2>
          <p className="mt-1 text-sm text-slate-500">Edit, organize, and optimize your PDFs.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pdfTools.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      </section>

      {/* Privacy banner */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="card flex flex-col items-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Private by design</h3>
              <p className="mt-1 text-sm text-slate-500">Files are processed in your browser. Nothing is uploaded.</p>
            </div>
            <div className="card flex flex-col items-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Fast &amp; free</h3>
              <p className="mt-1 text-sm text-slate-500">No accounts, no payments, no watermarks. Ever.</p>
            </div>
            <div className="card flex flex-col items-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">No tracking</h3>
              <p className="mt-1 text-sm text-slate-500">No persistent file history. Your data stays yours.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
