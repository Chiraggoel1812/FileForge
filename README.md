# FileForge

Simple. Free. Private.

FileForge is a browser-based PDF and document toolbox. File processing is performed locally in the browser; the application does not upload selected files to a FileForge processing server.

## Tools

- Word to PDF (DOCX)
- PDF to Word (text-based PDFs)
- PDF to JPG / PNG
- JPG / JPEG to PDF
- PNG to PDF
- Merge, split, compress, rotate, delete and reorder PDF pages

## Limits

- 25 MB per file
- 100 MB combined request/selection
- 20 files per multi-file operation

## Important conversion notes

- PDF to Word extracts selectable PDF text; scanned/image-only PDFs are rejected instead of pretending OCR was performed.
- PDF compression is lossless. It rewrites the PDF structure and returns the original when the rewritten file is not smaller. It does not rasterize pages.
- Word to PDF produces a clean, searchable PDF from readable DOCX text, headings, lists and tables. Complex Word-only layout features may not map one-to-one to PDF.

## Verification

Run `npm run typecheck`, `npm run build`, and `npm test` after dependencies are installed. The regression suite is intended to verify output validity, page counts, file types, ordering and invalid-input handling.
