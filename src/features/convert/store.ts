import { create } from 'zustand'
import type { FormatId } from '../../lib/formats'
import type { ImageSettings, PdfSettings, UploadedFile } from './types'

export interface UploadProgress {
  name: string
  size: number
  progress: number
}

const defaultSettings = (file?: UploadedFile): ImageSettings => ({
  quality: 80,
  width: file?.width,
  height: file?.height,
  lockAspect: true,
  stripMetadata: true,
  background: '#ffffff',
})

const defaultPdfSettings = (): PdfSettings => ({ level: 'recommended', grayscale: false, stripMetadata: true })

interface ConvertStore {
  file?: UploadedFile
  targetFormat?: FormatId
  settings: ImageSettings
  pdfSettings: PdfSettings
  jobId?: string
  upload: UploadProgress | null
  uploadError?: string

  setFile: (file: UploadedFile) => void
  setTarget: (target: FormatId) => void
  updateSettings: (patch: Partial<ImageSettings>) => void
  updatePdfSettings: (patch: Partial<PdfSettings>) => void
  resetSettings: () => void
  setJobId: (id?: string) => void
  setUpload: (u: UploadProgress | null) => void
  setUploadError: (e?: string) => void
  reset: () => void
}

export const useConvertStore = create<ConvertStore>((set, get) => ({
  settings: defaultSettings(),
  pdfSettings: defaultPdfSettings(),
  upload: null,

  setFile: (file) =>
    set({ file, targetFormat: undefined, jobId: undefined, settings: defaultSettings(file), pdfSettings: defaultPdfSettings(), uploadError: undefined }),
  setTarget: (targetFormat) => set({ targetFormat }),
  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
  updatePdfSettings: (patch) => set((s) => ({ pdfSettings: { ...s.pdfSettings, ...patch } })),
  resetSettings: () => set({ settings: defaultSettings(get().file), pdfSettings: defaultPdfSettings() }),
  setJobId: (jobId) => set({ jobId }),
  setUpload: (upload) => set({ upload }),
  setUploadError: (uploadError) => set({ uploadError }),
  reset: () =>
    set({
      file: undefined,
      targetFormat: undefined,
      jobId: undefined,
      settings: defaultSettings(),
      pdfSettings: defaultPdfSettings(),
      upload: null,
      uploadError: undefined,
    }),
}))
