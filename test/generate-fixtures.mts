import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx';
import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const OUT = join(process.cwd(), 'test-fixtures');
mkdirSync(OUT, { recursive: true });

async function createOnePagePdf(name: string) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.addPage([595, 842]);
  page.drawText('Hello FileForge — Page 1', { x: 50, y: 750, size: 24, font, color: rgb(0, 0, 0) });
  page.drawText('This is a text PDF for testing.', { x: 50, y: 700, size: 14, font, color: rgb(0.1, 0.1, 0.1) });
  const bytes = await pdf.save();
  writeFileSync(join(OUT, name), Buffer.from(bytes));
}

async function createMultiPagePdf(name: string, pages: number) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= pages; i++) {
    const page = pdf.addPage([595, 842]);
    page.drawText(`Page ${i}`, { x: 50, y: 750, size: 24, font, color: rgb(0, 0, 0) });
    page.drawText(`Content of page ${i} for testing.`, { x: 50, y: 700, size: 14, font, color: rgb(0.1, 0.1, 0.1) });
  }
  const bytes = await pdf.save();
  writeFileSync(join(OUT, name), Buffer.from(bytes));
}

async function createLargePdf(name: string) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= 20; i++) {
    const page = pdf.addPage([595, 842]);
    page.drawText(`Page ${i}`, { x: 50, y: 750, size: 24, font, color: rgb(0, 0, 0) });
    for (let j = 0; j < 30; j++) {
      page.drawText(`Line ${j} of text content on page ${i}. `.repeat(5), {
        x: 50, y: 700 - j * 20, size: 10, font, color: rgb(0.2, 0.2, 0.2),
      });
    }
  }
  const bytes = await pdf.save();
  writeFileSync(join(OUT, name), Buffer.from(bytes));
}

async function createScannedPdf(name: string) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  page.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: rgb(0.9, 0.9, 0.85) });
  const bytes = await pdf.save();
  writeFileSync(join(OUT, name), Buffer.from(bytes));
}

async function createSimpleDocx(name: string) {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ children: [new TextRun({ text: 'Simple Document', bold: true, size: 32 })] }),
        new Paragraph({ children: [new TextRun({ text: 'This is a simple DOCX for testing.' })] }),
        new Paragraph({ children: [new TextRun({ text: 'It has multiple paragraphs.' })] }),
      ],
    }],
  });
  const buf = await Packer.toBuffer(doc);
  writeFileSync(join(OUT, name), buf);
}

async function createHeadingDocx(name: string) {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'Main Heading' })] }),
        new Paragraph({ children: [new TextRun({ text: 'Text under heading.' })] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: 'Sub Heading' })] }),
        new Paragraph({ children: [new TextRun({ text: 'More text here.' })] }),
      ],
    }],
  });
  const buf = await Packer.toBuffer(doc);
  writeFileSync(join(OUT, name), buf);
}

async function createTableDocx(name: string) {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ children: [new TextRun({ text: 'Table Document', bold: true, size: 32 })] }),
        new Table({
          rows: [
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('Header A')], width: { size: 50, type: WidthType.PERCENTAGE } }),
              new TableCell({ children: [new Paragraph('Header B')], width: { size: 50, type: WidthType.PERCENTAGE } }),
            ]}),
            new TableRow({ children: [
              new TableCell({ children: [new Paragraph('Cell 1')] }),
              new TableCell({ children: [new Paragraph('Cell 2')] }),
            ]}),
          ],
        }),
      ],
    }],
  });
  const buf = await Packer.toBuffer(doc);
  writeFileSync(join(OUT, name), buf);
}

async function createImageDocx(name: string) {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ children: [new TextRun({ text: 'Image Document', bold: true, size: 32 })] }),
        new Paragraph({ children: [new TextRun({ text: 'This document references an image placeholder.' })] }),
      ],
    }],
  });
  const buf = await Packer.toBuffer(doc);
  writeFileSync(join(OUT, name), buf);
}

async function createDocxWithSpaces(name: string) {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ children: [new TextRun({ text: 'Document with spaces in filename', bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: 'Testing spaces and special chars.' })] }),
      ],
    }],
  });
  const buf = await Packer.toBuffer(doc);
  writeFileSync(join(OUT, name), buf);
}

function createImagesWithImageMagick() {
  const cmds = [
    ['test.jpg', '-size 200x200 xc:red'],
    ['test.jpeg', '-size 200x200 xc:blue'],
    ['image with spaces.jpeg', '-size 200x200 xc:green'],
    ['test.png', '-size 200x200 xc:purple'],
    ['test2.png', '-size 200x200 xc:orange'],
  ];
  for (const [name, args] of cmds) {
    try {
      execSync(`convert ${args} "${join(OUT, name)}"`, { stdio: 'pipe' });
    } catch {
      console.error(`  Failed to create ${name}`);
    }
  }
}

async function main() {
  console.log('Generating test fixtures...');

  await createOnePagePdf('one-page.pdf');
  await createMultiPagePdf('four-page.pdf', 4);
  await createMultiPagePdf('ten-page.pdf', 10);
  await createLargePdf('large.pdf');
  await createScannedPdf('scanned.pdf');
  await createMultiPagePdf('merge-1.pdf', 2);
  await createMultiPagePdf('merge-2.pdf', 3);
  await createMultiPagePdf('merge-3.pdf', 1);

  await createSimpleDocx('simple.docx');
  await createHeadingDocx('heading.docx');
  await createTableDocx('table.docx');
  await createImageDocx('image-doc.docx');
  await createDocxWithSpaces('document with spaces.docx');

  createImagesWithImageMagick();

  writeFileSync(join(OUT, 'corrupted.pdf'), Buffer.from('Not a real PDF'));
  writeFileSync(join(OUT, 'corrupted.docx'), Buffer.from('Not a real DOCX'));
  writeFileSync(join(OUT, 'empty.pdf'), Buffer.alloc(0));
  writeFileSync(join(OUT, 'empty.jpg'), Buffer.alloc(0));

  console.log('Test fixtures created in', OUT);
}

main().catch((e) => { console.error('Fixture generation failed:', e); process.exit(1); });
