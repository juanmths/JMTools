export type FormatId = 'jpg' | 'png' | 'webp' | 'gif' | 'bmp' | 'pdf' | 'docx'
export type FormatKind = 'image' | 'document'

export interface FormatInfo {
  id: FormatId
  label: string
  kind: FormatKind
  mime: string
  extensions: string[]
  hint: string
  recommended?: boolean
}

export const FORMATS: Record<FormatId, FormatInfo> = {
  jpg: { id: 'jpg', label: 'JPG', kind: 'image', mime: 'image/jpeg', extensions: ['.jpg', '.jpeg'], hint: 'Kompatibel di mana saja' },
  png: { id: 'png', label: 'PNG', kind: 'image', mime: 'image/png', extensions: ['.png'], hint: 'Lossless, mendukung transparansi' },
  webp: { id: 'webp', label: 'WEBP', kind: 'image', mime: 'image/webp', extensions: ['.webp'], hint: 'Ukuran terkecil untuk web', recommended: true },
  gif: { id: 'gif', label: 'GIF', kind: 'image', mime: 'image/gif', extensions: ['.gif'], hint: 'Animasi sederhana' },
  bmp: { id: 'bmp', label: 'BMP', kind: 'image', mime: 'image/bmp', extensions: ['.bmp'], hint: 'Bitmap tanpa kompresi' },
  pdf: { id: 'pdf', label: 'PDF', kind: 'document', mime: 'application/pdf', extensions: ['.pdf'], hint: 'Siap cetak & dibagikan' },
  docx: {
    id: 'docx',
    label: 'DOCX',
    kind: 'document',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.docx'],
    hint: 'Bisa diedit di Microsoft Word',
  },
}

/** Valid output formats per detected input format. */
export const TARGETS: Record<FormatId, FormatId[]> = {
  jpg: ['jpg', 'png', 'webp'],
  png: ['png', 'jpg', 'webp'],
  webp: ['webp', 'jpg', 'png'],
  gif: ['png', 'jpg', 'webp'],
  bmp: ['png', 'jpg', 'webp'],
  pdf: ['pdf', 'docx'],
  docx: ['pdf'],
}

export const MAX_FILE_SIZE = 50 * 1024 * 1024
export const FILE_TTL_MS = 15 * 60 * 1000
export const MAX_DIMENSION = 10000

export const isImageFormat = (f?: FormatId | null): boolean => !!f && FORMATS[f].kind === 'image'

/** react-dropzone `accept` map for a list of formats. */
export function acceptFor(formats: FormatId[] = Object.keys(FORMATS) as FormatId[]): Record<string, string[]> {
  return Object.fromEntries(formats.map((f) => [FORMATS[f].mime, FORMATS[f].extensions]))
}

export function matchesAccept(file: File, formats?: FormatId[]): boolean {
  if (!formats) return true
  const name = file.name.toLowerCase()
  return formats.some((f) => FORMATS[f].mime === file.type || FORMATS[f].extensions.some((e) => name.endsWith(e)))
}

export interface Tool {
  from: FormatId
  to: FormatId
}

export const POPULAR_TOOLS: Tool[] = [
  { from: 'jpg', to: 'png' },
  { from: 'png', to: 'jpg' },
  { from: 'jpg', to: 'webp' },
  { from: 'png', to: 'webp' },
  { from: 'webp', to: 'jpg' },
  { from: 'jpg', to: 'jpg' },
  { from: 'pdf', to: 'pdf' },
  { from: 'pdf', to: 'docx' },
  { from: 'docx', to: 'pdf' },
]

/** Same-format tools get a friendly slug, e.g. `compress-pdf`. */
export const toolSlug = ({ from, to }: Tool) => (from === to ? `compress-${from}` : `${from}-to-${to}`)

export function toolTitle({ from, to }: Tool): string {
  if (from === to) return FORMATS[from].kind === 'image' ? `Kompres & Resize ${FORMATS[from].label}` : `Kompres ${FORMATS[from].label}`
  return `${FORMATS[from].label} ke ${FORMATS[to].label}`
}

export function parseToolSlug(slug?: string): Tool | null {
  const compress = slug?.match(/^compress-([a-z]+)$/)
  const convert = slug?.match(/^([a-z]+)-to-([a-z]+)$/)
  const [from, to] = (compress ? [compress[1], compress[1]] : convert ? [convert[1], convert[2]] : []) as FormatId[]
  if (!from || !(from in FORMATS) || !(to in FORMATS) || !TARGETS[from].includes(to)) return null
  return { from, to }
}

/** PDF → PDF means "compress PDF". */
export const isPdfCompress = (source?: FormatId, target?: FormatId): boolean => source === 'pdf' && target === 'pdf'

/** Whether the wizard shows the "Pengaturan" step for this combination. */
export const hasSettingsStep = (source?: FormatId, target?: FormatId): boolean => isImageFormat(target) || isPdfCompress(source, target)
