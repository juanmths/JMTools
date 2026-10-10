import type { FormatId, FormatKind } from '../../lib/formats'

export type Step = 'upload' | 'format' | 'settings' | 'processing' | 'result'
export const STEPS: Step[] = ['upload', 'format', 'settings', 'processing', 'result']

export interface UploadedFile {
  id: string
  name: string
  size: number
  /** Type detected by magic bytes, not by extension */
  type: FormatId
  kind: FormatKind
  width?: number
  height?: number
  /** Page count (PDF) */
  pages?: number
  previewUrl?: string
}

export interface ImageSettings {
  quality: number
  width?: number
  height?: number
  lockAspect: boolean
  stripMetadata: boolean
  background: string
}

export type PdfCompressionLevel = 'low' | 'recommended' | 'extreme'

export interface PdfSettings {
  level: PdfCompressionLevel
  grayscale: boolean
  stripMetadata: boolean
}

export interface ConvertRequest {
  fileId: string
  target: FormatId
  settings?: ImageSettings
  pdfSettings?: PdfSettings
}

export type JobStatus = 'processing' | 'done' | 'error' | 'cancelled'

export interface Job {
  id: string
  fileId: string
  fileName: string
  sourceType: FormatId
  target: FormatId
  status: JobStatus
  /** Human-readable pipeline stages, e.g. ["Mengubah ukuran", "Mengompres", "Mengekspor ke PNG"] */
  stages: string[]
  stageIndex: number
  inputSize: number
  outputSize?: number
  width?: number
  height?: number
  quality?: number
  pages?: number
  compressionLevel?: PdfCompressionLevel
  expiresAt?: number
  downloadUrl?: string
  error?: string
}
