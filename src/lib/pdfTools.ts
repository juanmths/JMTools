import type { LucideIcon } from 'lucide-react'
import {
  Crop,
  Eraser,
  FileArchive,
  FileCode,
  FileSignature,
  FileSpreadsheet,
  FileText,
  Hash,
  Image,
  ImageDown,
  Layers,
  Lock,
  PenTool,
  Presentation,
  RotateCw,
  Scissors,
  ShieldAlert,
  Split,
  Stamp,
  Unlock,
  Wrench,
} from 'lucide-react'

export type ToolCategory = 'organize' | 'optimize' | 'convert-to' | 'convert-from' | 'edit' | 'security'

export interface ToolDef {
  id: string
  title: string
  shortTitle: string
  description: string
  category: ToolCategory
  icon: LucideIcon
  color: string // Tailwind color class for icon background/text
  badge?: string
  isInteractive?: boolean // Whether it has custom client-side dedicated UI
  route: string
}

export interface CategoryDef {
  id: ToolCategory
  title: string
  description: string
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'organize', title: 'Kelola PDF', description: 'Gabungkan, pisahkan, putar, dan atur halaman dokumen Anda' },
  { id: 'optimize', title: 'Optimasi & Kompres', description: 'Perkecil ukuran dan perbaiki file PDF dengan mudah' },
  { id: 'edit', title: 'Edit & Tanda Air', description: 'Tambahkan teks, watermark, nomor halaman, atau hapus watermark' },
  { id: 'convert-to', title: 'Konversi ke PDF', description: 'Ubah gambar dan dokumen Office menjadi format PDF' },
  { id: 'convert-from', title: 'Konversi dari PDF', description: 'Ubah PDF menjadi gambar atau dokumen yang dapat diedit' },
  { id: 'security', title: 'Keamanan Dokumen', description: 'Kunci dengan password, buka proteksi, dan beri tanda tangan' },
]

export const ALL_TOOLS: ToolDef[] = [
  // --- KELOLA PDF ---
  {
    id: 'merge-pdf',
    title: 'Gabungkan PDF',
    shortTitle: 'Merge PDF',
    description: 'Gabungkan beberapa file PDF menjadi satu dokumen urut dalam hitungan detik.',
    category: 'organize',
    icon: Layers,
    color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    badge: 'Populer',
    isInteractive: true,
    route: '/tools/merge-pdf',
  },
  {
    id: 'split-pdf',
    title: 'Pisahkan PDF',
    shortTitle: 'Split PDF',
    description: 'Pisahkan rentang halaman tertentu atau simpan halaman terpilih sebagai PDF baru.',
    category: 'organize',
    icon: Scissors,
    color: 'bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400',
    badge: 'Populer',
    isInteractive: true,
    route: '/tools/split-pdf',
  },
  {
    id: 'rotate-pdf',
    title: 'Putar PDF',
    shortTitle: 'Rotate PDF',
    description: 'Putar halaman PDF ke orientasi yang benar (90°, 180°, atau 270°).',
    category: 'organize',
    icon: RotateCw,
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    isInteractive: true,
    route: '/tools/rotate-pdf',
  },
  {
    id: 'remove-pages',
    title: 'Hapus Halaman PDF',
    shortTitle: 'Hapus Halaman',
    description: 'Pilih dan buang halaman yang tidak diperlukan dari dokumen PDF Anda.',
    category: 'organize',
    icon: Split,
    color: 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400',
    isInteractive: true,
    route: '/tools/split-pdf',
  },

  // --- OPTIMASI PDF ---
  {
    id: 'compress-pdf',
    title: 'Kompres PDF',
    shortTitle: 'Kompres PDF',
    description: 'Kurangi ukuran file PDF dengan tetap mempertahankan kualitas teks dan gambar.',
    category: 'optimize',
    icon: FileArchive,
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    badge: 'Populer',
    route: '/tools/compress-pdf',
  },
  {
    id: 'repair-pdf',
    title: 'Perbaiki PDF',
    shortTitle: 'Repair PDF',
    description: 'Pulihkan struktur file PDF yang rusak agar dapat dibuka kembali secara normal.',
    category: 'optimize',
    icon: Wrench,
    color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400',
    route: '/tools/compress-pdf',
  },

  // --- EDIT & WATERMARK ---
  {
    id: 'edit-pdf',
    title: 'Edit PDF',
    shortTitle: 'Edit PDF',
    description: 'Tambahkan teks baru, catatan, bentuk, atau gambar ke dalam halaman dokumen PDF.',
    category: 'edit',
    icon: PenTool,
    color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
    badge: 'Baru',
    isInteractive: true,
    route: '/tools/edit-pdf',
  },
  {
    id: 'remove-watermark',
    title: 'Hilangkan Watermark',
    shortTitle: 'Hapus Watermark',
    description: 'Bersihkan tanda air, stempel teks, dan layer mengganggu dari dokumen PDF.',
    category: 'edit',
    icon: Eraser,
    color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
    badge: 'Favorit',
    isInteractive: true,
    route: '/tools/remove-watermark',
  },
  {
    id: 'add-watermark',
    title: 'Tambah Watermark',
    shortTitle: 'Tambah Watermark',
    description: 'Beri stempel teks hak cipta atau tanda air kustom di semua halaman PDF.',
    category: 'edit',
    icon: Stamp,
    color: 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950/60 dark:text-fuchsia-400',
    isInteractive: true,
    route: '/tools/add-watermark',
  },
  {
    id: 'page-numbers',
    title: 'Nomor Halaman',
    shortTitle: 'Nomor Halaman',
    description: 'Tambahkan penomoran halaman otomatis dengan posisi dan font pilihan Anda.',
    category: 'edit',
    icon: Hash,
    color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400',
    isInteractive: true,
    route: '/tools/add-watermark',
  },
  {
    id: 'crop-pdf',
    title: 'Potong PDF (Crop)',
    shortTitle: 'Potong PDF',
    description: 'Pangkas margin atau area halaman tertentu pada dokumen PDF Anda.',
    category: 'edit',
    icon: Crop,
    color: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
    isInteractive: true,
    route: '/tools/rotate-pdf',
  },

  // --- KONVERSI KE PDF ---
  {
    id: 'jpg-to-pdf',
    title: 'JPG ke PDF',
    shortTitle: 'JPG ke PDF',
    description: 'Ubah gambar JPG, PNG, atau WEBP menjadi satu file dokumen PDF rapi.',
    category: 'convert-to',
    icon: Image,
    color: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
    badge: 'Populer',
    route: '/tools/jpg-to-pdf',
  },
  {
    id: 'word-to-pdf',
    title: 'Word ke PDF',
    shortTitle: 'Word ke PDF',
    description: 'Konversi file DOCX/DOC Microsoft Word menjadi dokumen PDF yang tidak bisa diedit.',
    category: 'convert-to',
    icon: FileText,
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    route: '/tools/docx-to-pdf',
  },
  {
    id: 'excel-to-pdf',
    title: 'Excel ke PDF',
    shortTitle: 'Excel ke PDF',
    description: 'Ubah spreadsheet XLSX menjadi tabel PDF siap cetak dengan tata letak rapi.',
    category: 'convert-to',
    icon: FileSpreadsheet,
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    route: '/tools/docx-to-pdf',
  },
  {
    id: 'ppt-to-pdf',
    title: 'PowerPoint ke PDF',
    shortTitle: 'PPT ke PDF',
    description: 'Ubah file presentasi PPTX menjadi dokumen slide PDF yang mudah dibagikan.',
    category: 'convert-to',
    icon: Presentation,
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    route: '/tools/docx-to-pdf',
  },

  // --- KONVERSI DARI PDF ---
  {
    id: 'pdf-to-jpg',
    title: 'PDF ke JPG',
    shortTitle: 'PDF ke JPG',
    description: 'Ekstrak setiap halaman dokumen PDF Anda menjadi gambar JPG berkualitas tinggi.',
    category: 'convert-from',
    icon: ImageDown,
    color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/60 dark:text-yellow-400',
    route: '/tools/pdf-to-jpg',
  },
  {
    id: 'pdf-to-word',
    title: 'PDF ke Word',
    shortTitle: 'PDF ke Word',
    description: 'Konversi dokumen PDF menjadi file Word (DOCX) yang dapat diedit teksnya.',
    category: 'convert-from',
    icon: FileCode,
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    badge: 'Populer',
    route: '/tools/pdf-to-docx',
  },

  // --- KEAMANAN DOKUMEN ---
  {
    id: 'protect-pdf',
    title: 'Kunci PDF (Password)',
    shortTitle: 'Kunci PDF',
    description: 'Enkripsi dokumen PDF Anda dengan password agar tidak bisa dibuka sembarangan.',
    category: 'security',
    icon: Lock,
    color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    isInteractive: true,
    route: '/tools/protect-pdf',
  },
  {
    id: 'unlock-pdf',
    title: 'Buka Kunci PDF',
    shortTitle: 'Buka Kunci',
    description: 'Hapus password dan batasan keamanan dari dokumen PDF Anda.',
    category: 'security',
    icon: Unlock,
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    isInteractive: true,
    route: '/tools/protect-pdf',
  },
  {
    id: 'sign-pdf',
    title: 'Tanda Tangan PDF',
    shortTitle: 'Tanda Tangan',
    description: 'Bubuhkan paraf atau tanda tangan digital langsung pada halaman dokumen.',
    category: 'security',
    icon: FileSignature,
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    isInteractive: true,
    route: '/tools/edit-pdf',
  },
  {
    id: 'redact-pdf',
    title: 'Sensor PDF (Redact)',
    shortTitle: 'Sensor PDF',
    description: 'Tutupi informasi sensitif atau nomor identitas secara permanen dari dokumen.',
    category: 'security',
    icon: ShieldAlert,
    color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
    isInteractive: true,
    route: '/tools/edit-pdf',
  },
]
