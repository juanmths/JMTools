import type { PdfCompressionLevel } from './types'

export interface PdfLevelInfo {
  id: PdfCompressionLevel
  label: string
  description: string
  /** Target resolution for embedded images (backend: Ghostscript -dPDFSETTINGS / image downsampling) */
  dpi: number
  /** Typical size reduction range in %, used only for the UI estimate */
  reduction: [number, number]
}

export const PDF_LEVELS: PdfLevelInfo[] = [
  { id: 'low', label: 'Ringan', description: 'Kualitas tinggi, cocok untuk dicetak', dpi: 300, reduction: [10, 30] },
  { id: 'recommended', label: 'Direkomendasikan', description: 'Seimbang antara kualitas dan ukuran', dpi: 150, reduction: [40, 70] },
  { id: 'extreme', label: 'Ekstrem', description: 'Ukuran terkecil, kualitas gambar menurun', dpi: 72, reduction: [70, 90] },
]

export const pdfLevel = (id: PdfCompressionLevel) => PDF_LEVELS.find((l) => l.id === id)!
