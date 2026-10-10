import type { FormatId } from './formats'

const startsWith = (bytes: Uint8Array, sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b)
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0))

/**
 * Detect the real file type from its magic bytes (not the extension).
 * The backend must repeat this check; this is for instant UI feedback.
 */
export async function detectFormat(file: Blob & { name?: string }): Promise<FormatId | null> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer())

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'jpg'
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return 'png'
  if (startsWith(bytes, ascii('RIFF')) && startsWith(bytes, ascii('WEBP'), 8)) return 'webp'
  if (startsWith(bytes, ascii('GIF8'))) return 'gif'
  if (startsWith(bytes, ascii('BM'))) return 'bmp'
  if (startsWith(bytes, ascii('%PDF'))) return 'pdf'
  // DOCX is a ZIP container; rely on the extension to disambiguate from other ZIPs.
  if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) && file.name?.toLowerCase().endsWith('.docx')) return 'docx'

  return null
}
