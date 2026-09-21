import { BrowserRouter, Routes, Route, useParams, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import WordToPdf from '@/pages/tools/WordToPdf';
import PdfToWord from '@/pages/tools/PdfToWord';
import PdfToJpg from '@/pages/tools/PdfToJpg';
import PdfToPng from '@/pages/tools/PdfToPng';
import JpgToPdf from '@/pages/tools/JpgToPdf';
import PngToPdf from '@/pages/tools/PngToPdf';
import MergePdf from '@/pages/tools/MergePdf';
import SplitPdf from '@/pages/tools/SplitPdf';
import CompressPdf from '@/pages/tools/CompressPdf';
import RotatePdf from '@/pages/tools/RotatePdf';
import DeletePdfPages from '@/pages/tools/DeletePdfPages';
import ReorderPdfPages from '@/pages/tools/ReorderPdfPages';
import { TOOL_MAP } from '@/lib/constants';

const toolComponents: Record<string, React.ComponentType> = {
  'word-to-pdf': WordToPdf,
  'pdf-to-word': PdfToWord,
  'pdf-to-jpg': PdfToJpg,
  'pdf-to-png': PdfToPng,
  'jpg-to-pdf': JpgToPdf,
  'png-to-pdf': PngToPdf,
  'merge-pdf': MergePdf,
  'split-pdf': SplitPdf,
  'compress-pdf': CompressPdf,
  'rotate-pdf': RotatePdf,
  'delete-pdf-pages': DeletePdfPages,
  'reorder-pdf-pages': ReorderPdfPages,
};

function ToolRoute() {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = toolId ? TOOL_MAP[toolId] : null;
  const Comp = toolId ? toolComponents[toolId] : null;

  useEffect(() => {
    if (tool) {
      document.title = `${tool.seoTitle} — FileForge`;
    }
  }, [tool]);

  if (!tool || !Comp) return <Navigate to="/" replace />;
  return <Comp />;
}

function ScrollToTop() {
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/tool/:toolId" element={<ToolRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
