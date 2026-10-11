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
  Minimize2,
  Palette,
  PenTool,
  Presentation,
  RotateCw,
  Scaling,
  Scissors,
  ShieldAlert,
  Smile,
  Split,
  Stamp,
  Unlock,
  Wrench,
} from 'lucide-react'

export type ToolKind = 'pdf' | 'image'

export type ToolCategory =
  // PDF
  | 'organize'
  | 'optimize'
  | 'convert-to'
  | 'convert-from'
  | 'edit'
  | 'security'
  // IMAGE
  | 'img-optimize'
  | 'img-modify'
  | 'img-convert'
  | 'img-creative'

export interface ToolDef {
  id: string
  title: string
  shortTitle: string
  description: string
  category: ToolCategory
  kind: ToolKind
  icon: LucideIcon
  color: string // Tailwind color class for icon background/text
  badge?: string
  isInteractive?: boolean // Whether it has custom client-side dedicated UI
  route: string
}

export interface CategoryDef {
  id: ToolCategory
  kind: ToolKind
  title: string
  description: string
}

export const CATEGORIES: CategoryDef[] = [
  // --- PDF KATEGORI ---
  { id: 'organize', kind: 'pdf', title: 'Kelola PDF', description: 'Gabungkan, pisahkan, putar, dan atur halaman dokumen Anda' },
  { id: 'optimize', kind: 'pdf', title: 'Optimasi & Kompres', description: 'Perkecil ukuran dan perbaiki file PDF dengan mudah' },
  { id: 'edit', kind: 'pdf', title: 'Edit & Tanda Air', description: 'Tambahkan teks, watermark, nomor halaman, atau hapus watermark' },
  { id: 'convert-to', kind: 'pdf', title: 'Konversi ke PDF', description: 'Ubah gambar dan dokumen Office menjadi format PDF' },
  { id: 'convert-from', kind: 'pdf', title: 'Konversi dari PDF', description: 'Ubah PDF menjadi gambar atau dokumen yang dapat diedit' },
  { id: 'security', kind: 'pdf', title: 'Keamanan Dokumen', description: 'Kunci dengan password, buka proteksi, dan beri tanda tangan' },

  // --- GAMBAR KATEGORI (iLoveIMG Style) ---
  { id: 'img-optimize', kind: 'image', title: 'Kompres Gambar', description: 'Perkecil ukuran berkas JPG, PNG, WebP tanpa merusak kualitas' },
  { id: 'img-modify', kind: 'image', title: 'Ubah & Potong Foto', description: 'Ubah ukuran dimensi, potong rasio, dan putar orientasi gambar' },
  { id: 'img-convert', kind: 'image', title: 'Konversi Gambar', description: 'Ubah format gambar antara JPG, PNG, dan WebP dengan cepat' },
  { id: 'img-creative', kind: 'image', title: 'Edit & Kreatif', description: 'Beri tanda air watermark, sesuaikan filter foto, dan buat meme lucu' },
]

export const ALL_TOOLS: ToolDef[] = [
  // ==========================================
  // --- ALAT GAMBAR (iLoveIMG STYLE) ---
  // ==========================================
  {
    id: 'compress-image',
    title: 'Kompres Gambar',
    shortTitle: 'Kompres Gambar',
    description: 'Kurangi ukuran gambar JPG, PNG, dan WebP hingga 85% dengan kualitas prima.',
    category: 'img-optimize',
    kind: 'image',
    icon: Minimize2,
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    badge: 'Populer',
    isInteractive: true,
    route: '/tools/compress-image',
  },
  {
    id: 'resize-image',
    title: 'Ubah Ukuran Gambar',
    shortTitle: 'Resize Gambar',
    description: 'Ubah dimensi piksel lebar dan tinggi atau persentase skala foto dengan rasio terkunci.',
    category: 'img-modify',
    kind: 'image',
    icon: Scaling,
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    badge: 'Populer',
    isInteractive: true,
    route: '/tools/resize-image',
  },
  {
    id: 'crop-image',
    title: 'Potong Gambar',
    shortTitle: 'Potong Gambar',
    description: 'Pangkas area tertentu pada foto dengan pilihan rasio persegi (1:1), 16:9, story, atau bebas.',
    category: 'img-modify',
    kind: 'image',
    icon: Crop,
    color: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
    isInteractive: true,
    route: '/tools/crop-image',
  },
  {
    id: 'rotate-image',
    title: 'Putar Gambar',
    shortTitle: 'Putar Gambar',
    description: 'Putar foto 90°, 180°, atau balik posisi secara horizontal (cermin) dan vertikal.',
    category: 'img-modify',
    kind: 'image',
    icon: RotateCw,
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    isInteractive: true,
    route: '/tools/rotate-image',
  },
  {
    id: 'convert-to-jpg',
    title: 'Konversi ke JPG',
    shortTitle: 'Ubah ke JPG',
    description: 'Ubah gambar PNG, WebP, GIF, SVG, atau BMP menjadi format standar JPG.',
    category: 'img-convert',
    kind: 'image',
    icon: Image,
    color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400',
    isInteractive: true,
    route: '/tools/convert-image',
  },
  {
    id: 'convert-from-jpg',
    title: 'Konversi dari JPG',
    shortTitle: 'JPG ke PNG/WebP',
    description: 'Ubah format file JPG menjadi PNG transparan atau format WebP yang sangat ringan.',
    category: 'img-convert',
    kind: 'image',
    icon: ImageDown,
    color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400',
    isInteractive: true,
    route: '/tools/convert-image',
  },
  {
    id: 'watermark-image',
    title: 'Watermark Gambar',
    shortTitle: 'Tanda Air Foto',
    description: 'Tambahkan stempel teks hak cipta, nama brand, atau tanda air transparan pada foto.',
    category: 'img-creative',
    kind: 'image',
    icon: Stamp,
    color: 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950/60 dark:text-fuchsia-400',
    isInteractive: true,
    route: '/tools/watermark-image',
  },
  {
    id: 'edit-image',
    title: 'Editor Foto & Filter',
    shortTitle: 'Edit Foto',
    description: 'Sesuaikan kecerahan, kontras, saturasi warna, filter monokrom, dan efek vintage.',
    category: 'img-creative',
    kind: 'image',
    icon: Palette,
    color: 'bg-pink-50 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400',
    badge: 'Baru',
    isInteractive: true,
    route: '/tools/edit-image',
  },
  {
    id: 'meme-generator',
    title: 'Pembuat Meme',
    shortTitle: 'Meme Generator',
    description: 'Buat meme lucu dengan teks atas dan bawah klasik bergaris tepi hitam tebal.',
    category: 'img-creative',
    kind: 'image',
    icon: Smile,
    color: 'bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400',
    badge: 'Seru',
    isInteractive: true,
    route: '/tools/meme-generator',
  },

  // ==========================================
  // --- ALAT PDF (iLovePDF STYLE) ---
  // ==========================================
  // --- KELOLA PDF ---
  {
    id: 'merge-pdf',
    title: 'Gabungkan PDF',
    shortTitle: 'Merge PDF',
    description: 'Gabungkan beberapa file PDF menjadi satu dokumen urut dalam hitungan detik.',
    category: 'organize',
    kind: 'pdf',
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
    kind: 'pdf',
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
    kind: 'pdf',
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
    kind: 'pdf',
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
    kind: 'pdf',
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
    kind: 'pdf',
    icon: Wrench,
    color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400',
    route: '/tools/compress-pdf',
  },

  // --- EDIT & WATERMARK ---
  {
    id: 'edit-pdf',
    title: 'Edit PDF',
    shortTitle: 'Edit PDF',
    description: 'Tambahkan teks baru, catatan, bentuk, atau tanda tangan ke dalam halaman dokumen PDF.',
    category: 'edit',
    kind: 'pdf',
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
    kind: 'pdf',
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
    kind: 'pdf',
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
    kind: 'pdf',
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
    kind: 'pdf',
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
    kind: 'pdf',
    icon: Image,
    color: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
    badge: 'Populer',
    isInteractive: true,
    route: '/tools/jpg-to-pdf',
  },
  {
    id: 'word-to-pdf',
    title: 'Word ke PDF',
    shortTitle: 'Word ke PDF',
    description: 'Konversi file DOCX/DOC Microsoft Word menjadi dokumen PDF yang tidak bisa diedit.',
    category: 'convert-to',
    kind: 'pdf',
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
    kind: 'pdf',
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
    kind: 'pdf',
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
    kind: 'pdf',
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
    kind: 'pdf',
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
    kind: 'pdf',
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
    kind: 'pdf',
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
    kind: 'pdf',
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
    kind: 'pdf',
    icon: ShieldAlert,
    color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
    isInteractive: true,
    route: '/tools/edit-pdf',
  },
]
