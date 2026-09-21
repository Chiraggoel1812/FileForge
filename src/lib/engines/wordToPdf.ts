import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface RenderResult {
  buffer: ArrayBuffer;
  pageWidth: number;
  pageHeight: number;
}

async function renderHtmlToPdf(html: string): Promise<ArrayBuffer> {
  const container = document.createElement('div');
  container.style.cssText =
    'position:absolute;left:-9999px;top:0;width:794px;padding:60px;font-family:Calibri,Arial,sans-serif;font-size:14px;line-height:1.6;color:#1a1a1a;background:#fff;';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    pdf.addImage(imgData, 'JPEG', margin, position, usableWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, usableWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    return pdf.output('arraybuffer');
  } finally {
    document.body.removeChild(container);
  }
}

export async function wordToPdf(file: File): Promise<ArrayBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value || '<p>Empty document.</p>';
  return renderHtmlToPdf(html);
}
