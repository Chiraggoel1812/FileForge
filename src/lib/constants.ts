export const LIMITS = {
  MAX_FILE_SIZE: 25 * 1024 * 1024,
  MAX_TOTAL_SIZE: 100 * 1024 * 1024,
  MAX_FILES: 20,
};

export type FileCategory = 'convert' | 'pdf-tools';

export type ToolId =
  | 'word-to-pdf'
  | 'pdf-to-word'
  | 'pdf-to-jpg'
  | 'pdf-to-png'
  | 'jpg-to-pdf'
  | 'png-to-pdf'
  | 'merge-pdf'
  | 'split-pdf'
  | 'compress-pdf'
  | 'rotate-pdf'
  | 'delete-pdf-pages'
  | 'reorder-pdf-pages';

export interface ToolMeta {
  id: ToolId;
  title: string;
  seoTitle: string;
  description: string;
  category: FileCategory;
  icon: string;
  accept: string[];
  multiple: boolean;
  accent: string;
}

export const TOOLS: ToolMeta[] = [
  {
    id: 'word-to-pdf',
    title: 'Word to PDF',
    seoTitle: 'Free Word to PDF Converter',
    description: 'Convert DOCX documents into PDF files.',
    category: 'convert',
    icon: 'FileText',
    accept: ['.docx'],
    multiple: false,
    accent: 'from-blue-500 to-blue-600',
  },
  {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    seoTitle: 'Free PDF to Word Converter',
    description: 'Convert PDF into editable Word documents.',
    category: 'convert',
    icon: 'FileType',
    accept: ['.pdf'],
    multiple: false,
    accent: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'pdf-to-jpg',
    title: 'PDF to JPG',
    seoTitle: 'Free PDF to JPG Converter',
    description: 'Convert each PDF page into a JPG image.',
    category: 'convert',
    icon: 'Image',
    accept: ['.pdf'],
    multiple: false,
    accent: 'from-amber-500 to-orange-500',
  },
  {
    id: 'pdf-to-png',
    title: 'PDF to PNG',
    seoTitle: 'Free PDF to PNG Converter',
    description: 'Convert each PDF page into a PNG image.',
    category: 'convert',
    icon: 'Image',
    accept: ['.pdf'],
    multiple: false,
    accent: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'jpg-to-pdf',
    title: 'JPG to PDF',
    seoTitle: 'Free JPG to PDF Converter',
    description: 'Combine JPG/JPEG images into a single PDF.',
    category: 'convert',
    icon: 'ImagePlus',
    accept: ['.jpg', '.jpeg'],
    multiple: true,
    accent: 'from-rose-500 to-pink-500',
  },
  {
    id: 'png-to-pdf',
    title: 'PNG to PDF',
    seoTitle: 'Free PNG to PDF Converter',
    description: 'Combine PNG images into a single PDF.',
    category: 'convert',
    icon: 'ImagePlus',
    accept: ['.png'],
    multiple: true,
    accent: 'from-violet-500 to-purple-500',
  },
  {
    id: 'merge-pdf',
    title: 'Merge PDF',
    seoTitle: 'Free PDF Merger',
    description: 'Combine multiple PDFs into one file.',
    category: 'pdf-tools',
    icon: 'Combine',
    accept: ['.pdf'],
    multiple: true,
    accent: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'split-pdf',
    title: 'Split PDF',
    seoTitle: 'Free PDF Splitter',
    description: 'Extract pages or split into ranges.',
    category: 'pdf-tools',
    icon: 'Scissors',
    accept: ['.pdf'],
    multiple: false,
    accent: 'from-orange-500 to-red-500',
  },
  {
    id: 'compress-pdf',
    title: 'Compress PDF',
    seoTitle: 'Free PDF Compressor',
    description: 'Reduce PDF file size.',
    category: 'pdf-tools',
    icon: 'Minimize2',
    accept: ['.pdf'],
    multiple: false,
    accent: 'from-green-500 to-emerald-500',
  },
  {
    id: 'rotate-pdf',
    title: 'Rotate PDF',
    seoTitle: 'Free PDF Rotator',
    description: 'Rotate all pages 90°, 180°, or 270°.',
    category: 'pdf-tools',
    icon: 'RotateCw',
    accept: ['.pdf'],
    multiple: false,
    accent: 'from-sky-500 to-blue-500',
  },
  {
    id: 'delete-pdf-pages',
    title: 'Delete PDF Pages',
    seoTitle: 'Free PDF Page Deleter',
    description: 'Remove unwanted pages from a PDF.',
    category: 'pdf-tools',
    icon: 'Trash2',
    accept: ['.pdf'],
    multiple: false,
    accent: 'from-red-500 to-rose-500',
  },
  {
    id: 'reorder-pdf-pages',
    title: 'Reorder PDF Pages',
    seoTitle: 'Free PDF Page Reorderer',
    description: 'Drag and drop to rearrange pages.',
    category: 'pdf-tools',
    icon: 'Move',
    accept: ['.pdf'],
    multiple: false,
    accent: 'from-fuchsia-500 to-pink-500',
  },
];

export const TOOL_MAP: Record<string, ToolMeta> = Object.fromEntries(
  TOOLS.map((t) => [t.id, t])
);
