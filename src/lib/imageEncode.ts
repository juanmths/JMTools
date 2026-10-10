import { FORMATS, type FormatId } from './formats'

export interface EncodeOptions {
  target: FormatId
  width: number
  height: number
  /** 1–100, ignored for lossless formats */
  quality: number
  /** Fill colour for transparent areas when exporting to JPG */
  background: string
}

/**
 * Client-side resize → compress → export pipeline using canvas.
 * Mirrors what the backend engine (Sharp/ImageMagick) will do and is used
 * by the mock API and for live size estimates.
 */
export async function encodeImage(source: Blob, opts: EncodeOptions): Promise<Blob> {
  const bitmap = await createImageBitmap(source)
  const canvas = document.createElement('canvas')
  canvas.width = opts.width
  canvas.height = opts.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas tidak tersedia di browser ini.')

  if (opts.target === 'jpg') {
    ctx.fillStyle = opts.background
    ctx.fillRect(0, 0, opts.width, opts.height)
  }
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, opts.width, opts.height)
  bitmap.close()

  const mime = FORMATS[opts.target].mime
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('Gagal mengekspor gambar.'))
        if (blob.type !== mime) return reject(new Error(`Browser ini tidak mendukung ekspor ke ${FORMATS[opts.target].label}.`))
        resolve(blob)
      },
      mime,
      opts.quality / 100,
    )
  })
}
