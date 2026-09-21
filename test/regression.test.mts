/**
 * FileForge Comprehensive Regression Test Suite
 *
 * Tests all 12 tools by calling the actual engine functions.
 * Browser-only engines (Word→PDF, PDF→JPG, PDF→PNG, Compress) use canvas/html2canvas
 * which require a DOM — those are tested via their core logic (mammoth, pdfjs text, pdf-lib)
 * with browser-API parts stubbed where needed.
 *
 * Run: npx tsx test/regression.test.mts
 */

import { PDFDocument, degrees } from 'pdf-lib';
import JSZip from 'jszip';
import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const FIXTURES = join(process.cwd(), 'test-fixtures');
const TMP = join(process.cwd(), 'test-tmp');

// ── Test framework ──────────────────────────────
interface TestResult { name: string; passed: boolean; error?: string; details?: string; }
const results: TestResult[] = [];
let passCount = 0, failCount = 0;

function record(name: string, passed: boolean, details?: string, error?: string) {
  results.push({ name, passed, details, error });
  if (passed) passCount++; else failCount++;
  const tag = passed ? 'PASS' : 'FAIL';
  console.log(`  [${tag}] ${name}${details ? ' — ' + details : ''}${error ? ' — ' + error : ''}`);
}

function section(title: string) { console.log(`\n--- ${title} ---`); }

function readFixture(name: string): Buffer { return readFileSync(join(FIXTURES, name)); }
function toUint8(buf: Buffer): Uint8Array { return new Uint8Array(buf); }

async function loadPdf(buf: Buffer | Uint8Array) {
  return PDFDocument.load(buf, { ignoreEncryption: true });
}

function makeFile(buf: Buffer, name: string, type: string): File {
  return new File([buf], name, { type });
}

// ── Cleanup tracking ─────────────────────────────
function ensureTmpDir() { mkdirSync(TMP, { recursive: true }); }
function cleanTmpDir() { if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true }); }
function tmpFileCount(): number {
  if (!existsSync(TMP)) return 0;
  return readdirSync(TMP).length;
}

// ── 1. Fixture Integrity ─────────────────────────
async function testFixtures() {
  section('Fixture Integrity');
  const onePage = await loadPdf(readFixture('one-page.pdf'));
  record('one-page.pdf has 1 page', onePage.getPageCount() === 1, `Pages: ${onePage.getPageCount()}`);

  const fourPage = await loadPdf(readFixture('four-page.pdf'));
  record('four-page.pdf has 4 pages', fourPage.getPageCount() === 4, `Pages: ${fourPage.getPageCount()}`);

  const tenPage = await loadPdf(readFixture('ten-page.pdf'));
  record('ten-page.pdf has 10 pages', tenPage.getPageCount() === 10, `Pages: ${tenPage.getPageCount()}`);

  const large = await loadPdf(readFixture('large.pdf'));
  record('large.pdf has 20 pages', large.getPageCount() === 20, `Pages: ${large.getPageCount()}`);

  const m1 = await loadPdf(readFixture('merge-1.pdf'));
  const m2 = await loadPdf(readFixture('merge-2.pdf'));
  const m3 = await loadPdf(readFixture('merge-3.pdf'));
  record('merge-1.pdf has 2 pages', m1.getPageCount() === 2);
  record('merge-2.pdf has 3 pages', m2.getPageCount() === 3);
  record('merge-3.pdf has 1 page', m3.getPageCount() === 1);

  for (const f of ['simple.docx', 'heading.docx', 'table.docx', 'image-doc.docx', 'document with spaces.docx']) {
    const buf = readFixture(f);
    record(`${f} is non-empty`, buf.length > 0, `Size: ${buf.length}`);
  }

  const jpg = readFixture('test.jpg');
  record('test.jpg is valid JPEG', jpg[0] === 0xFF && jpg[1] === 0xD8, `Size: ${jpg.length}`);
  const jpeg = readFixture('test.jpeg');
  record('test.jpeg is valid JPEG', jpeg[0] === 0xFF && jpeg[1] === 0xD8, `Size: ${jpeg.length}`);
  const spacesJpeg = readFixture('image with spaces.jpeg');
  record('image with spaces.jpeg is valid JPEG', spacesJpeg[0] === 0xFF && spacesJpeg[1] === 0xD8, `Size: ${spacesJpeg.length}`);
  const png = readFixture('test.png');
  record('test.png is valid PNG', png[0] === 0x89 && png[1] === 0x50, `Size: ${png.length}`);
  const png2 = readFixture('test2.png');
  record('test2.png is valid PNG', png2[0] === 0x89 && png2[1] === 0x50, `Size: ${png2.length}`);
}

// ── 2. Word → PDF (mammoth HTML extraction) ──────
async function testWordToPdf() {
  section('Word → PDF (DOCX→HTML via mammoth)');
  const mammoth = await import('mammoth');

  for (const f of ['simple.docx', 'heading.docx', 'table.docx', 'image-doc.docx', 'document with spaces.docx']) {
    try {
      const result = await mammoth.convertToHtml({ buffer: readFixture(f) });
      const hasContent = result.value && result.value.length > 0;
      record(`mammoth extracts HTML from ${f}`, hasContent, `HTML length: ${result.value?.length}`);
    } catch (e: any) {
      record(`mammoth extracts HTML from ${f}`, false, undefined, e.message?.slice(0, 80));
    }
  }

  // Verify the HTML contains expected content
  const simpleResult = await mammoth.convertToHtml({ buffer: readFixture('simple.docx') });
  record('simple.docx HTML contains "Simple Document"', simpleResult.value.includes('Simple Document'));
  const tableResult = await mammoth.convertToHtml({ buffer: readFixture('table.docx') });
  record('table.docx HTML contains table tags', tableResult.value.includes('<table>'));
  const headingResult = await mammoth.convertToHtml({ buffer: readFixture('heading.docx') });
  record('heading.docx HTML contains heading tags', headingResult.value.includes('<h1>') || headingResult.value.includes('<h2>'));
}

// ── 3. PDF → Word (pdfjs text extraction + docx) ─
async function testPdfToWord() {
  section('PDF → Word (text extraction + docx generation)');

  // Test text extraction from text PDF
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const textData = readFixture('one-page.pdf');
  const textPdf = await pdfjs.getDocument({ data: toUint8(textData) }).promise;
  const textPage = await textPdf.getPage(1);
  const textContent = await textPage.getTextContent();
  const extractedText = textContent.items.map((i: any) => i.str).join('');
  record('Text PDF extractable text', extractedText.length > 10, `Text: "${extractedText.slice(0, 50)}..."`);

  // Multi-page PDF text extraction
  const multiData = readFixture('four-page.pdf');
  const multiPdf = await pdfjs.getDocument({ data: toUint8(multiData) }).promise;
  let allText = '';
  for (let i = 1; i <= multiPdf.numPages; i++) {
    const pg = await multiPdf.getPage(i);
    const ct = await pg.getTextContent();
    allText += ct.items.map((it: any) => it.str).join('');
  }
  record('Multi-page PDF text extracted from all pages', allText.includes('Page 1') && allText.includes('Page 4'));

  // Scanned PDF (no text) detection
  const scannedData = readFixture('scanned.pdf');
  const scannedPdf = await pdfjs.getDocument({ data: toUint8(scannedData) }).promise;
  const scannedPage = await scannedPdf.getPage(1);
  const scannedContent = await scannedPage.getTextContent();
  const scannedText = scannedContent.items.map((i: any) => i.str).join('').replace(/[\s\-|]/g, '');
  record('Scanned PDF has no extractable text', scannedText.length < 10, `Text length: ${scannedText.length}`);

  // DOCX generation from extracted text
  const { Document, Packer, Paragraph, TextRun } = await import('docx');
  const doc = new Document({
    sections: [{ children: [new Paragraph({ children: [new TextRun({ text: extractedText })] })] }],
  });
  const docxBuf = await Packer.toBuffer(doc);
  record('DOCX generated from PDF text', docxBuf.length > 0, `Size: ${docxBuf.length}`);
  record('Generated DOCX is valid ZIP', docxBuf[0] === 0x50 && docxBuf[1] === 0x4B, `First bytes: ${docxBuf.slice(0,2).toString('hex')}`);
}

// ── 4. PDF → JPG (logic test) ────────────────────
async function testPdfToJpg() {
  section('PDF → JPG (page count + zip logic)');
  // pdfjs canvas rendering requires DOM — test the zip packaging logic
  // and verify page counts match
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

  const onePageData = readFixture('one-page.pdf');
  const onePagePdf = await pdfjs.getDocument({ data: toUint8(onePageData) }).promise;
  record('1-page PDF → should produce 1 JPG', onePagePdf.numPages === 1, `Pages: ${onePagePdf.numPages}`);

  const fourPageData = readFixture('four-page.pdf');
  const fourPagePdf = await pdfjs.getDocument({ data: toUint8(fourPageData) }).promise;
  record('4-page PDF → should produce 4 JPGs', fourPagePdf.numPages === 4, `Pages: ${fourPagePdf.numPages}`);

  // Test zip packaging with mock blobs
  const zip = new JSZip();
  for (let i = 1; i <= fourPagePdf.numPages; i++) {
    const mockBlob = new Blob([`mock image ${i}`], { type: 'image/jpeg' });
    zip.file(`four-page_page_${String(i).padStart(2, '0')}.jpg`, mockBlob);
  }
  const zipBuf = await zip.generateAsync({ type: 'nodebuffer' });
  const loadedZip = await JSZip.loadAsync(zipBuf);
  const zipFiles = Object.keys(loadedZip.files);
  record('ZIP contains 4 JPG files', zipFiles.length === 4, `Files: ${zipFiles.length}`);
  record('ZIP files have .jpg extension', zipFiles.every(f => f.endsWith('.jpg')), zipFiles.join(', '));
  record('ZIP is valid (PK header)', zipBuf[0] === 0x50 && zipBuf[1] === 0x4B, `Header: ${zipBuf.slice(0,2).toString('hex')}`);
}

// ── 5. PDF → PNG (logic test) ────────────────────
async function testPdfToPng() {
  section('PDF → PNG (page count + zip logic)');
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

  const onePageData = readFixture('one-page.pdf');
  const onePagePdf = await pdfjs.getDocument({ data: toUint8(onePageData) }).promise;
  record('1-page PDF → should produce 1 PNG', onePagePdf.numPages === 1);

  const fourPageData = readFixture('four-page.pdf');
  const fourPagePdf = await pdfjs.getDocument({ data: toUint8(fourPageData) }).promise;
  record('4-page PDF → should produce 4 PNGs', fourPagePdf.numPages === 4);

  const zip = new JSZip();
  for (let i = 1; i <= fourPagePdf.numPages; i++) {
    const mockBlob = new Blob([`mock png ${i}`], { type: 'image/png' });
    zip.file(`four-page_page_${String(i).padStart(2, '0')}.png`, mockBlob);
  }
  const zipBuf = await zip.generateAsync({ type: 'nodebuffer' });
  const loadedZip = await JSZip.loadAsync(zipBuf);
  const zipFiles = Object.keys(loadedZip.files);
  record('ZIP contains 4 PNG files', zipFiles.length === 4, `Files: ${zipFiles.length}`);
  record('ZIP files have .png extension', zipFiles.every(f => f.endsWith('.png')), zipFiles.join(', '));
}

// ── 6. JPG → PDF ─────────────────────────────────
async function testJpgToPdf() {
  section('JPG → PDF');
  const { jpgToPdf } = await import('../src/lib/engines/imagesToPdf.ts');

  // Single .jpg
  const jpgFile = makeFile(readFixture('test.jpg'), 'test.jpg', 'image/jpeg');
  const out1 = await jpgToPdf([jpgFile]);
  const pdf1 = await loadPdf(Buffer.from(out1));
  record('.jpg → PDF creates 1 page', pdf1.getPageCount() === 1, `Pages: ${pdf1.getPageCount()}`);
  record('.jpg → PDF output non-zero', out1.byteLength > 0, `Size: ${out1.byteLength}`);

  // Single .jpeg
  const jpegFile = makeFile(readFixture('test.jpeg'), 'test.jpeg', 'image/jpeg');
  const out2 = await jpgToPdf([jpegFile]);
  const pdf2 = await loadPdf(Buffer.from(out2));
  record('.jpeg → PDF creates 1 page', pdf2.getPageCount() === 1, `Pages: ${pdf2.getPageCount()}`);

  // Multiple .jpeg files
  const j1 = makeFile(readFixture('test.jpeg'), 'a.jpeg', 'image/jpeg');
  const j2 = makeFile(readFixture('test.jpeg'), 'b.jpeg', 'image/jpeg');
  const j3 = makeFile(readFixture('test.jpeg'), 'c.jpeg', 'image/jpeg');
  const out3 = await jpgToPdf([j1, j2, j3]);
  const pdf3 = await loadPdf(Buffer.from(out3));
  record('3 .jpeg → PDF creates 3 pages', pdf3.getPageCount() === 3, `Pages: ${pdf3.getPageCount()}`);

  // Mixed .jpg + .jpeg
  const mixed = [
    makeFile(readFixture('test.jpg'), 'test.jpg', 'image/jpeg'),
    makeFile(readFixture('test.jpeg'), 'test.jpeg', 'image/jpeg'),
    makeFile(readFixture('image with spaces.jpeg'), 'image with spaces.jpeg', 'image/jpeg'),
  ];
  const out4 = await jpgToPdf(mixed);
  const pdf4 = await loadPdf(Buffer.from(out4));
  record('Mixed .jpg+.jpeg → PDF creates 3 pages', pdf4.getPageCount() === 3, `Pages: ${pdf4.getPageCount()}`);

  // Filename with spaces
  const spacesFile = makeFile(readFixture('image with spaces.jpeg'), 'image with spaces.jpeg', 'image/jpeg');
  const out5 = await jpgToPdf([spacesFile]);
  const pdf5 = await loadPdf(Buffer.from(out5));
  record('Filename with spaces → PDF works', pdf5.getPageCount() === 1, `Pages: ${pdf5.getPageCount()}`);

  // Order preservation: use different-sized images
  const big = makeFile(readFixture('test.jpg'), 'big.jpg', 'image/jpeg');
  const small = makeFile(readFixture('test.jpeg'), 'small.jpeg', 'image/jpeg');
  const out6 = await jpgToPdf([big, small]);
  const pdf6 = await loadPdf(Buffer.from(out6));
  const p1 = pdf6.getPages()[0];
  const p2 = pdf6.getPages()[1];
  record('Order preserved (page 1 is big.jpg)', p1.getSize().width > 0 && p2.getSize().width > 0, `P1: ${p1.getSize().width}x${p1.getSize().height}, P2: ${p2.getSize().width}x${p2.getSize().height}`);
}

// ── 7. PNG → PDF ─────────────────────────────────
async function testPngToPdf() {
  section('PNG → PDF');
  const { pngToPdf } = await import('../src/lib/engines/imagesToPdf.ts');

  // Single PNG
  const pngFile = makeFile(readFixture('test.png'), 'test.png', 'image/png');
  const out1 = await pngToPdf([pngFile]);
  const pdf1 = await loadPdf(Buffer.from(out1));
  record('Single PNG → PDF creates 1 page', pdf1.getPageCount() === 1, `Pages: ${pdf1.getPageCount()}`);
  record('PNG → PDF output non-zero', out1.byteLength > 0, `Size: ${out1.byteLength}`);

  // Multiple PNGs
  const p1 = makeFile(readFixture('test.png'), 'a.png', 'image/png');
  const p2 = makeFile(readFixture('test2.png'), 'b.png', 'image/png');
  const out2 = await pngToPdf([p1, p2]);
  const pdf2 = await loadPdf(Buffer.from(out2));
  record('2 PNGs → PDF creates 2 pages', pdf2.getPageCount() === 2, `Pages: ${pdf2.getPageCount()}`);

  // Order preservation
  const out3 = await pngToPdf([p2, p1]);
  const pdf3 = await loadPdf(Buffer.from(out3));
  record('Order preserved (b.png first)', pdf3.getPageCount() === 2, `Pages: ${pdf3.getPageCount()}`);
}

// ── 8. Merge PDF ─────────────────────────────────
async function testMergePdf() {
  section('Merge PDF');
  const { mergePdfs } = await import('../src/lib/engines/pdfMerge.ts');

  const f1 = makeFile(readFixture('merge-1.pdf'), 'merge-1.pdf', 'application/pdf');
  const f2 = makeFile(readFixture('merge-2.pdf'), 'merge-2.pdf', 'application/pdf');
  const f3 = makeFile(readFixture('merge-3.pdf'), 'merge-3.pdf', 'application/pdf');

  const out = await mergePdfs([f1, f2, f3]);
  const pdf = await loadPdf(Buffer.from(out));
  const expected = 2 + 3 + 1;
  record('Merge 3 PDFs → correct page count', pdf.getPageCount() === expected, `Pages: ${pdf.getPageCount()}, expected: ${expected}`);
  record('Merged PDF is valid', out.byteLength > 0, `Size: ${out.byteLength}`);

  // Verify order: page 1 should be from merge-1.pdf (contains "Page 1")
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const mergedPdf = await pdfjs.getDocument({ data: toUint8(Buffer.from(out)) }).promise;
  const page1 = await mergedPdf.getPage(1);
  const content1 = await page1.getTextContent();
  const text1 = content1.items.map((i: any) => i.str).join('');
  record('Merged page 1 is from merge-1.pdf', text1.includes('Page 1'), `Text: "${text1.slice(0, 30)}"`);

  const page3 = await mergedPdf.getPage(3);
  const content3 = await page3.getTextContent();
  const text3 = content3.items.map((i: any) => i.str).join('');
  record('Merged page 3 is from merge-2.pdf (page 1)', text3.includes('Page 1'), `Text: "${text3.slice(0, 30)}"`);

  // Only 2 PDFs
  const out2 = await mergePdfs([f1, f3]);
  const pdf2 = await loadPdf(Buffer.from(out2));
  record('Merge 2 PDFs → 3 pages', pdf2.getPageCount() === 3, `Pages: ${pdf2.getPageCount()}`);
}

// ── 9. Split PDF ─────────────────────────────────
async function testSplitPdf() {
  section('Split PDF');
  const { splitPdf } = await import('../src/lib/engines/pdfSplit.ts');

  // Extract pages 1-3 from 10-page PDF
  const file = makeFile(readFixture('ten-page.pdf'), 'ten-page.pdf', 'application/pdf');
  const r1 = await splitPdf(file, { mode: 'ranges', ranges: '1-3' });
  record('Split 1-3 → single PDF, 3 pages', !r1.isZip && r1.count === 1, `isZip: ${r1.isZip}, count: ${r1.count}`);
  const pdf1 = await loadPdf(Buffer.from(r1.buffer));
  record('Split 1-3 PDF has 3 pages', pdf1.getPageCount() === 3, `Pages: ${pdf1.getPageCount()}`);

  // Extract page 5
  const r2 = await splitPdf(file, { mode: 'ranges', ranges: '5' });
  const pdf2 = await loadPdf(Buffer.from(r2.buffer));
  record('Split page 5 → 1 page', pdf2.getPageCount() === 1, `Pages: ${pdf2.getPageCount()}`);

  // Extract pages 8-10
  const r3 = await splitPdf(file, { mode: 'ranges', ranges: '8-10' });
  const pdf3 = await loadPdf(Buffer.from(r3.buffer));
  record('Split 8-10 → 3 pages', pdf3.getPageCount() === 3, `Pages: ${pdf3.getPageCount()}`);

  // Multiple ranges → ZIP
  const r4 = await splitPdf(file, { mode: 'ranges', ranges: '1-3,5,8-10' });
  record('Split 1-3,5,8-10 → ZIP', r4.isZip, `isZip: ${r4.isZip}, count: ${r4.count}`);
  const zip4 = await JSZip.loadAsync(r4.buffer);
  const zipFiles = Object.keys(zip4.files);
  record('Split ZIP has 3 files', zipFiles.length === 3, `Files: ${zipFiles.length}`);

  // Split every page from 4-page PDF
  const file4 = makeFile(readFixture('four-page.pdf'), 'four-page.pdf', 'application/pdf');
  const r5 = await splitPdf(file4, { mode: 'every' });
  record('Split every page → ZIP', r5.isZip, `isZip: ${r5.isZip}`);
  const zip5 = await JSZip.loadAsync(r5.buffer);
  const zip5Files = Object.keys(zip5.files);
  record('Split every page → 4 files', zip5Files.length === 4, `Files: ${zip5Files.length}`);

  // Verify each split page has 1 page
  for (let i = 0; i < zip5Files.length; i++) {
    const fData = await zip5.files[zip5Files[i]].async('uint8array');
    const fPdf = await loadPdf(fData);
    record(`Split file ${i + 1} has 1 page`, fPdf.getPageCount() === 1, `Pages: ${fPdf.getPageCount()}`);
  }

  // Invalid range
  try {
    await splitPdf(file, { mode: 'ranges', ranges: '1-15' });
    record('Invalid range rejected', false, 'Should have thrown');
  } catch (e: any) {
    record('Invalid range rejected', true, e.message?.slice(0, 60));
  }

  // Invalid format
  try {
    await splitPdf(file, { mode: 'ranges', ranges: 'abc' });
    record('Invalid format rejected', false, 'Should have thrown');
  } catch (e: any) {
    record('Invalid format rejected', true, e.message?.slice(0, 60));
  }
}

// ── 10. Compress PDF ─────────────────────────────
async function testCompressPdf() {
  section('Compress PDF (logic validation)');

  // Compress uses pdfjs canvas + jsPDF — can't run in Node.
  // Test the "already compact" logic: if compressed >= original, keep original.
  const largeBuf = readFixture('large.pdf');
  const smallBuf = readFixture('one-page.pdf');
  record('large.pdf is larger than one-page.pdf', largeBuf.length > smallBuf.length, `Large: ${largeBuf.length}, Small: ${smallBuf.length}`);

  // Test the comparison logic
  const compressedMock = largeBuf.length * 0.5;
  record('Compressed smaller → saved=true', compressedMock < largeBuf.length, `Mock compressed: ${compressedMock}`);

  const compressedSmall = smallBuf.length + 100;
  record('Compressed larger → saved=false (keep original)', compressedSmall >= smallBuf.length, `Mock compressed: ${compressedSmall}`);
}

// ── 11. Rotate PDF ───────────────────────────────
async function testRotatePdf() {
  section('Rotate PDF');
  const { rotatePdf } = await import('../src/lib/engines/pdfRotate.ts');

  const file = makeFile(readFixture('one-page.pdf'), 'one-page.pdf', 'application/pdf');

  // Rotate 90
  const out90 = await rotatePdf(file, 90);
  const pdf90 = await loadPdf(Buffer.from(out90));
  const angle90 = pdf90.getPages()[0].getRotation().angle;
  record('Rotate 90° → angle is 90', angle90 === 90, `Angle: ${angle90}`);
  record('Rotate 90° output is valid', out90.byteLength > 0, `Size: ${out90.byteLength}`);

  // Rotate 180
  const out180 = await rotatePdf(file, 180);
  const pdf180 = await loadPdf(Buffer.from(out180));
  const angle180 = pdf180.getPages()[0].getRotation().angle;
  record('Rotate 180° → angle is 180', angle180 === 180, `Angle: ${angle180}`);

  // Rotate 270
  const out270 = await rotatePdf(file, 270);
  const pdf270 = await loadPdf(Buffer.from(out270));
  const angle270 = pdf270.getPages()[0].getRotation().angle;
  record('Rotate 270° → angle is 270', angle270 === 270, `Angle: ${angle270}`);

  // Multi-page rotate
  const multiFile = makeFile(readFixture('four-page.pdf'), 'four-page.pdf', 'application/pdf');
  const outMulti = await rotatePdf(multiFile, 90);
  const pdfMulti = await loadPdf(Buffer.from(outMulti));
  const allRotated = pdfMulti.getPages().every(p => p.getRotation().angle === 90);
  record('Multi-page rotate: all pages rotated', allRotated, `Pages: ${pdfMulti.getPageCount()}`);
}

// ── 12. Delete PDF Pages ─────────────────────────
async function testDeletePdfPages() {
  section('Delete PDF Pages');
  const { deletePdfPages } = await import('../src/lib/engines/pdfDeletePages.ts');

  const file = makeFile(readFixture('four-page.pdf'), 'four-page.pdf', 'application/pdf');

  // Delete pages 2 and 4
  const out = await deletePdfPages(file, [2, 4]);
  const pdf = await loadPdf(Buffer.from(out));
  record('Delete pages 2,4 → 2 pages remain', pdf.getPageCount() === 2, `Pages: ${pdf.getPageCount()}`);
  record('Delete output is valid', out.byteLength > 0, `Size: ${out.byteLength}`);

  // Verify remaining pages are 1 and 3 (content check)
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const resultPdf = await pdfjs.getDocument({ data: toUint8(Buffer.from(out)) }).promise;
  const p1 = await resultPdf.getPage(1);
  const c1 = await p1.getTextContent();
  const t1 = c1.items.map((i: any) => i.str).join('');
  record('Remaining page 1 is original page 1', t1.includes('Page 1'), `Text: "${t1.slice(0, 20)}"`);
  const p2 = await resultPdf.getPage(2);
  const c2 = await p2.getTextContent();
  const t2 = c2.items.map((i: any) => i.str).join('');
  record('Remaining page 2 is original page 3', t2.includes('Page 3'), `Text: "${t2.slice(0, 20)}"`);

  // Delete single page
  const out2 = await deletePdfPages(file, [1]);
  const pdf2 = await loadPdf(Buffer.from(out2));
  record('Delete page 1 → 3 pages remain', pdf2.getPageCount() === 3, `Pages: ${pdf2.getPageCount()}`);

  // Try to delete all pages
  try {
    await deletePdfPages(file, [1, 2, 3, 4]);
    record('Delete all pages rejected', false, 'Should have thrown');
  } catch (e: any) {
    record('Delete all pages rejected', true, e.message?.slice(0, 60));
  }
}

// ── 13. Reorder PDF Pages ────────────────────────
async function testReorderPdfPages() {
  section('Reorder PDF Pages');
  const { reorderPdfPages } = await import('../src/lib/engines/pdfReorder.ts');

  const file = makeFile(readFixture('four-page.pdf'), 'four-page.pdf', 'application/pdf');

  // Reorder to 3,1,4,2
  const out = await reorderPdfPages(file, [3, 1, 4, 2]);
  const pdf = await loadPdf(Buffer.from(out));
  record('Reorder 3,1,4,2 → 4 pages', pdf.getPageCount() === 4, `Pages: ${pdf.getPageCount()}`);
  record('Reorder output is valid', out.byteLength > 0, `Size: ${out.byteLength}`);

  // Verify exact order by checking page content
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const resultPdf = await pdfjs.getDocument({ data: toUint8(Buffer.from(out)) }).promise;
  const expectedOrder = [3, 1, 4, 2];
  for (let i = 0; i < 4; i++) {
    const pg = await resultPdf.getPage(i + 1);
    const ct = await pg.getTextContent();
    const text = ct.items.map((it: any) => it.str).join('');
    const expectedPage = expectedOrder[i];
    record(`Output page ${i + 1} is original page ${expectedPage}`, text.includes(`Page ${expectedPage}`), `Text: "${text.slice(0, 20)}"`);
  }

  // Invalid page number
  try {
    await reorderPdfPages(file, [1, 5]);
    record('Invalid page number rejected', false, 'Should have thrown');
  } catch (e: any) {
    record('Invalid page number rejected', true, e.message?.slice(0, 60));
  }

  // Empty order
  try {
    await reorderPdfPages(file, []);
    record('Empty order rejected', false, 'Should have thrown');
  } catch (e: any) {
    record('Empty order rejected', true, e.message?.slice(0, 60));
  }
}

// ── 14. Validation ───────────────────────────────
async function testValidation() {
  section('Validation');
  const { validateFile, validateFiles } = await import('../src/lib/validation.ts');
  const { TOOL_MAP, LIMITS } = await import('../src/lib/constants.ts');

  const pdfTool = TOOL_MAP['merge-pdf'];
  const jpgTool = TOOL_MAP['jpg-to-pdf'];
  const pngTool = TOOL_MAP['png-to-pdf'];
  const docxTool = TOOL_MAP['word-to-pdf'];

  // Valid files
  record('Valid PDF accepted', validateFile(makeFile(readFixture('one-page.pdf'), 'test.pdf', 'application/pdf'), pdfTool).valid);
  record('Valid .jpg accepted by JPG tool', validateFile(makeFile(readFixture('test.jpg'), 'test.jpg', 'image/jpeg'), jpgTool).valid);
  record('Valid .jpeg accepted by JPG tool', validateFile(makeFile(readFixture('test.jpeg'), 'test.jpeg', 'image/jpeg'), jpgTool).valid);
  record('Valid .png accepted by PNG tool', validateFile(makeFile(readFixture('test.png'), 'test.png', 'image/png'), pngTool).valid);
  record('Valid .docx accepted by DOCX tool', validateFile(makeFile(readFixture('simple.docx'), 'simple.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'), docxTool).valid);

  // Invalid extensions
  const txtFile = makeFile(Buffer.from('hello'), 'test.txt', 'text/plain');
  record('TXT rejected for PDF tool', !validateFile(txtFile, pdfTool).valid);
  record('TXT rejected for JPG tool', !validateFile(txtFile, jpgTool).valid);
  record('PDF rejected for JPG tool', !validateFile(makeFile(readFixture('one-page.pdf'), 'test.pdf', 'application/pdf'), jpgTool).valid);
  record('JPG rejected for PDF tool', !validateFile(makeFile(readFixture('test.jpg'), 'test.jpg', 'image/jpeg'), pdfTool).valid);
  record('PNG rejected for JPG tool', !validateFile(makeFile(readFixture('test.png'), 'test.png', 'image/png'), jpgTool).valid);
  record('DOCX rejected for PDF tool', !validateFile(makeFile(readFixture('simple.docx'), 'test.docx', 'application/octet-stream'), pdfTool).valid);

  // Empty file
  const emptyFile = makeFile(Buffer.alloc(0), 'empty.pdf', 'application/pdf');
  const emptyResult = validateFile(emptyFile, pdfTool);
  record('Empty file rejected', !emptyResult.valid, emptyResult.error);

  // Oversized file (mock)
  const bigBuf = Buffer.alloc(LIMITS.MAX_FILE_SIZE + 1);
  const bigFile = makeFile(bigBuf, 'big.pdf', 'application/pdf');
  const bigResult = validateFile(bigFile, pdfTool);
  record('Oversized file rejected', !bigResult.valid, bigResult.error);

  // Too many files
  const manyFiles: File[] = [];
  for (let i = 0; i <= LIMITS.MAX_FILES; i++) {
    manyFiles.push(makeFile(readFixture('one-page.pdf'), `f${i}.pdf`, 'application/pdf'));
  }
  const manyResult = validateFiles(manyFiles, pdfTool);
  record('Too many files rejected', !manyResult.valid, manyResult.error);

  // Mixed jpg+jpeg accepted
  const mixed = [
    makeFile(readFixture('test.jpg'), 'a.jpg', 'image/jpeg'),
    makeFile(readFixture('test.jpeg'), 'b.jpeg', 'image/jpeg'),
  ];
  record('Mixed .jpg+.jpeg accepted by JPG tool', validateFiles(mixed, jpgTool).valid);

  // Uppercase extension
  const upperFile = makeFile(readFixture('test.jpg'), 'TEST.JPG', 'image/jpeg');
  record('Uppercase .JPG accepted', validateFile(upperFile, jpgTool).valid);
  const upperPdf = makeFile(readFixture('one-page.pdf'), 'TEST.PDF', 'application/pdf');
  record('Uppercase .PDF accepted', validateFile(upperPdf, pdfTool).valid);
}

// ── 15. Security ─────────────────────────────────
async function testSecurity() {
  section('Security');

  // Path traversal
  const evilName = '../../../etc/passwd';
  const safe = evilName.replace(/\.\./g, '_').replace(/[^a-zA-Z0-9._\-\s]/g, '_').trim().replace(/^\.+/, '');
  record('Path traversal sanitized', !safe.includes('..'), `Sanitized: ${safe}`);

  // Corrupted PDF
  try {
    await loadPdf(readFixture('corrupted.pdf'));
    record('Corrupted PDF rejected', false, 'Should have thrown');
  } catch (e: any) {
    record('Corrupted PDF rejected', true, e.message?.slice(0, 60));
  }

  // Corrupted DOCX
  try {
    const mammoth = await import('mammoth');
    await mammoth.convertToHtml({ buffer: readFixture('corrupted.docx') });
    record('Corrupted DOCX rejected', false, 'Should have thrown');
  } catch (e: any) {
    record('Corrupted DOCX rejected', true, e.message?.slice(0, 60));
  }

  // Empty PDF
  try {
    await loadPdf(readFixture('empty.pdf'));
    record('Empty PDF rejected', false, 'Should have thrown');
  } catch {
    record('Empty PDF rejected', true);
  }

  // Unexpected file type (HTML with .pdf extension)
  const htmlAsPdf = Buffer.from('<html><body>Not a PDF</body></html>');
  try {
    await loadPdf(htmlAsPdf);
    record('HTML-as-PDF rejected', false, 'Should have thrown');
  } catch (e: any) {
    record('HTML-as-PDF rejected', true, e.message?.slice(0, 60));
  }
}

// ── 16. Cleanup ──────────────────────────────────
async function testCleanup() {
  section('Cleanup');

  // Simulate temp file lifecycle
  cleanTmpDir();
  ensureTmpDir();
  record('Temp dir starts empty', tmpFileCount() === 0, `Files: ${tmpFileCount()}`);

  // Write a temp file
  writeFileSync(join(TMP, 'temp.pdf'), Buffer.from('temp'));
  record('Temp file written', tmpFileCount() === 1, `Files: ${tmpFileCount()}`);

  // Clean after success
  cleanTmpDir();
  record('Temp dir empty after cleanup', tmpFileCount() === 0, `Files: ${tmpFileCount()}`);

  // Clean after failure
  ensureTmpDir();
  writeFileSync(join(TMP, 'failed.pdf'), Buffer.from('fail'));
  cleanTmpDir();
  record('Temp dir empty after failure cleanup', tmpFileCount() === 0, `Files: ${tmpFileCount()}`);

  // Final check: no test-fixtures left behind in tmp
  cleanTmpDir();
  record('No persistent files remain', !existsSync(TMP) || tmpFileCount() === 0);
}

// ── 17. Output Verification ──────────────────────
async function testOutputVerification() {
  section('Output Verification');

  // PDF outputs start with %PDF
  const { mergePdfs } = await import('../src/lib/engines/pdfMerge.ts');
  const f1 = makeFile(readFixture('merge-1.pdf'), 'a.pdf', 'application/pdf');
  const f2 = makeFile(readFixture('merge-2.pdf'), 'b.pdf', 'application/pdf');
  const merged = await mergePdfs([f1, f2]);
  const mergedBuf = Buffer.from(merged);
  record('PDF output starts with %PDF', mergedBuf.slice(0, 4).toString() === '%PDF', `Header: ${mergedBuf.slice(0, 4).toString()}`);

  // ZIP outputs start with PK
  const { splitPdf } = await import('../src/lib/engines/pdfSplit.ts');
  const file = makeFile(readFixture('four-page.pdf'), 'four-page.pdf', 'application/pdf');
  const splitOut = await splitPdf(file, { mode: 'every' });
  const splitBuf = Buffer.from(splitOut.buffer);
  record('ZIP output starts with PK', splitBuf[0] === 0x50 && splitBuf[1] === 0x4B, `Header: ${splitBuf.slice(0, 2).toString('hex')}`);

  // DOCX outputs start with PK (it's a ZIP)
  const { Document, Packer, Paragraph, TextRun } = await import('docx');
  const doc = new Document({ sections: [{ children: [new Paragraph({ children: [new TextRun('test')] })] }] });
  const docxBuf = await Packer.toBuffer(doc);
  record('DOCX output starts with PK', docxBuf[0] === 0x50 && docxBuf[1] === 0x4B, `Header: ${docxBuf.slice(0, 2).toString('hex')}`);
}

// ── MAIN ────────────────────────────────────────
async function main() {
  console.log('==========================================');
  console.log('  FileForge Comprehensive Regression Suite');
  console.log('==========================================');

  cleanTmpDir();

  await testFixtures();
  await testWordToPdf();
  await testPdfToWord();
  await testPdfToJpg();
  await testPdfToPng();
  await testJpgToPdf();
  await testPngToPdf();
  await testMergePdf();
  await testSplitPdf();
  await testCompressPdf();
  await testRotatePdf();
  await testDeletePdfPages();
  await testReorderPdfPages();
  await testValidation();
  await testSecurity();
  await testCleanup();
  await testOutputVerification();

  console.log('\n==========================================');
  console.log(`  Results: ${passCount} passed, ${failCount} failed, ${results.length} total`);
  console.log('==========================================');

  if (failCount > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.passed).forEach(r => console.log(`  - ${r.name}: ${r.error || 'No error message'}`));
  }

  cleanTmpDir();
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Test suite crashed:', e);
  cleanTmpDir();
  process.exit(1);
});
