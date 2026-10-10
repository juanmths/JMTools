/**
 * Mock implementation of the converter API contract:
 *
 *   POST   /api/upload              -> uploadFile
 *   GET    /api/formats?from=jpg    -> getFormats
 *   POST   /api/convert             -> convert
 *   GET    /api/jobs/:id            -> getJob
 *   GET    /api/jobs/:id/download   -> Job.downloadUrl
 *   DELETE /api/jobs/:id            -> deleteJob
 *
 * Images are genuinely resized/compressed in the browser (canvas) so the UI
 * shows real numbers. Documents are simulated. Replace this module with HTTP
 * calls when the backend (Sharp/ImageMagick + cleanup worker) is ready.
 */
import { detectFormat } from '../../lib/fileType'
import { encodeImage } from '../../lib/imageEncode'
import { FILE_TTL_MS, FORMATS, isPdfCompress, MAX_FILE_SIZE, TARGETS, type FormatId } from '../../lib/formats'
import { formatBytes } from '../../lib/utils'
import type { ConvertRequest, ImageSettings, Job, PdfSettings, UploadedFile } from './types'

interface StoredFile {
  meta: UploadedFile
  blob: Blob
  timer: number
}
interface StoredJob {
  job: Job
  cancelled: boolean
  timer?: number
}

const files = new Map<string, StoredFile>()
const jobs = new Map<string, StoredJob>()

const uid = () => crypto.randomUUID().replace(/-/g, '').slice(0, 12)

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t)
        reject(new DOMException('Dibatalkan', 'AbortError'))
      },
      { once: true },
    )
  })
}

function outputName(name: string, target: FormatId) {
  const base = name.replace(/\.[^.]+$/, '')
  return `${base}-jmtools${FORMATS[target].extensions[0]}`
}

function removeFile(id: string) {
  const f = files.get(id)
  if (!f) return
  clearTimeout(f.timer)
  if (f.meta.previewUrl) URL.revokeObjectURL(f.meta.previewUrl)
  files.delete(id)
}

function removeJob(id: string) {
  const j = jobs.get(id)
  if (!j) return
  clearTimeout(j.timer)
  if (j.job.downloadUrl) URL.revokeObjectURL(j.job.downloadUrl)
  jobs.delete(id)
}

function resolveDimensions(meta: UploadedFile, s?: ImageSettings) {
  const width = s?.width ?? meta.width ?? 1
  const height = s?.height ?? meta.height ?? 1
  return { width, height }
}

async function runImageJob(stored: StoredJob, source: StoredFile, settings: ImageSettings | undefined) {
  const { job } = stored
  const { width, height } = resolveDimensions(source.meta, settings)
  const quality = settings?.quality ?? 80
  const check = () => {
    if (stored.cancelled) throw new DOMException('Dibatalkan', 'AbortError')
  }

  job.stageIndex = 0 // resize
  await delay(500)
  check()
  job.stageIndex = 1 // compress
  const blob = await encodeImage(source.blob, {
    target: job.target,
    width,
    height,
    quality,
    background: settings?.background ?? '#ffffff',
  })
  await delay(400)
  check()
  job.stageIndex = 2 // export
  await delay(400)
  check()

  Object.assign(job, {
    outputSize: blob.size,
    width,
    height,
    quality: job.target === 'png' ? undefined : quality,
    downloadUrl: URL.createObjectURL(blob),
  })
}

async function runDocumentJob(stored: StoredJob, source: StoredFile) {
  const { job } = stored
  for (let i = 0; i < job.stages.length; i++) {
    job.stageIndex = i
    await delay(700)
    if (stored.cancelled) throw new DOMException('Dibatalkan', 'AbortError')
  }
  // Demo only: real conversion happens on the backend.
  const blob = new Blob([source.blob], { type: FORMATS[job.target].mime })
  Object.assign(job, { outputSize: blob.size, downloadUrl: URL.createObjectURL(blob) })
}

/**
 * Mock PDF compression: re-saves the PDF with object streams and optionally
 * strips metadata (lossless structural optimisation, done for real via pdf-lib).
 * The backend will additionally downsample embedded images to the level's DPI
 * and apply grayscale (e.g. Ghostscript -dPDFSETTINGS=/screen|/ebook|/printer).
 */
async function runPdfCompressJob(stored: StoredJob, source: StoredFile, settings: PdfSettings) {
  const { job } = stored
  const check = () => {
    if (stored.cancelled) throw new DOMException('Dibatalkan', 'AbortError')
  }
  const { PDFDocument } = await import('pdf-lib')

  job.stageIndex = 0 // analyse
  const doc = await PDFDocument.load(await source.blob.arrayBuffer(), { ignoreEncryption: true }).catch(() => {
    throw new Error('PDF tidak dapat dibaca. Berkas mungkin rusak.')
  })
  if (doc.isEncrypted) throw new Error('PDF dilindungi kata sandi dan tidak dapat dikompres.')
  await delay(500)
  check()

  job.stageIndex = 1 // compress images & objects
  if (settings.stripMetadata) {
    doc.setTitle('')
    doc.setAuthor('')
    doc.setSubject('')
    doc.setKeywords([])
    doc.setCreator('')
    doc.setProducer('JMTools')
  }
  const bytes = await doc.save({ useObjectStreams: true })
  await delay(600)
  check()

  job.stageIndex = 2 // optimise & write
  await delay(400)
  check()

  // Never return a bigger file than the original — keep the original if already optimal.
  const blob = bytes.byteLength < source.blob.size ? new Blob([bytes as BlobPart], { type: 'application/pdf' }) : source.blob
  Object.assign(job, {
    outputSize: blob.size,
    pages: doc.getPageCount(),
    compressionLevel: settings.level,
    downloadUrl: URL.createObjectURL(blob),
  })
}

async function countPdfPages(file: Blob): Promise<number | undefined> {
  try {
    const { PDFDocument } = await import('pdf-lib')
    const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true, updateMetadata: false })
    return doc.getPageCount()
  } catch {
    return undefined
  }
}

export const api = {
  async uploadFile(file: File, onProgress: (pct: number) => void, signal?: AbortSignal): Promise<UploadedFile> {
    if (file.size > MAX_FILE_SIZE) throw new Error(`Berkas melebihi batas ${formatBytes(MAX_FILE_SIZE)}.`)
    const type = await detectFormat(file)
    if (!type) throw new Error('Format berkas tidak didukung atau berkas rusak.')

    // Simulated network upload
    const chunks = 12
    for (let i = 1; i <= chunks; i++) {
      await delay(50, signal)
      onProgress(Math.round((i / chunks) * 100))
    }

    const kind = FORMATS[type].kind
    let width: number | undefined
    let height: number | undefined
    let previewUrl: string | undefined
    let pages: number | undefined
    if (kind === 'image') {
      try {
        const bmp = await createImageBitmap(file)
        width = bmp.width
        height = bmp.height
        bmp.close()
      } catch {
        throw new Error('Gambar tidak dapat dibaca. Berkas mungkin rusak.')
      }
      previewUrl = URL.createObjectURL(file)
    } else if (type === 'pdf') {
      pages = await countPdfPages(file)
    }

    const id = uid()
    const meta: UploadedFile = { id, name: file.name, size: file.size, type, kind, width, height, pages, previewUrl }
    files.set(id, { meta, blob: file, timer: window.setTimeout(() => removeFile(id), FILE_TTL_MS) })
    return meta
  },

  async getFormats(from: FormatId): Promise<FormatId[]> {
    return TARGETS[from]
  },

  /** Size estimate for the settings panel (≈). */
  async estimateSize(fileId: string, target: FormatId, settings: ImageSettings): Promise<number> {
    const f = files.get(fileId)
    if (!f) throw new Error('Berkas tidak ditemukan.')
    const { width, height } = resolveDimensions(f.meta, settings)
    const blob = await encodeImage(f.blob, { target, width, height, quality: settings.quality, background: settings.background })
    return blob.size
  },

  async convert(req: ConvertRequest): Promise<{ jobId: string }> {
    const source = files.get(req.fileId)
    if (!source) throw new Error('Berkas asli sudah dihapus dari server. Silakan unggah ulang.')
    if (!TARGETS[source.meta.type].includes(req.target)) throw new Error('Format target tidak valid.')

    const label = FORMATS[req.target].label
    const isImage = FORMATS[req.target].kind === 'image'
    const isCompress = isPdfCompress(source.meta.type, req.target)
    const id = uid()
    const job: Job = {
      id,
      fileId: req.fileId,
      fileName: outputName(source.meta.name, req.target),
      sourceType: source.meta.type,
      target: req.target,
      status: 'processing',
      stages: isImage
        ? ['Mengubah ukuran', 'Mengompres', `Mengekspor ke ${label}`]
        : isCompress
          ? ['Menganalisis dokumen', 'Mengompres gambar & objek', 'Mengoptimalkan PDF']
          : ['Menganalisis dokumen', 'Mengonversi konten', `Mengekspor ke ${label}`],
      stageIndex: 0,
      inputSize: source.meta.size,
    }
    const stored: StoredJob = { job, cancelled: false }
    jobs.set(id, stored)
    // Keep the source alive while it is being used.
    clearTimeout(source.timer)
    source.timer = window.setTimeout(() => removeFile(source.meta.id), FILE_TTL_MS)

    void (async () => {
      try {
        if (isImage) await runImageJob(stored, source, req.settings)
        else if (isCompress) await runPdfCompressJob(stored, source, req.pdfSettings ?? { level: 'recommended', grayscale: false, stripMetadata: true })
        else await runDocumentJob(stored, source)
        job.status = 'done'
        job.expiresAt = Date.now() + FILE_TTL_MS
        stored.timer = window.setTimeout(() => removeJob(id), FILE_TTL_MS)
      } catch (e) {
        if (stored.cancelled) job.status = 'cancelled'
        else {
          job.status = 'error'
          job.error = e instanceof Error ? e.message : 'Konversi gagal.'
        }
      }
    })()

    return { jobId: id }
  },

  async getJob(id: string): Promise<Job | null> {
    const j = jobs.get(id)
    return j ? { ...j.job } : null
  },

  async cancelJob(id: string): Promise<void> {
    const j = jobs.get(id)
    if (j) j.cancelled = true
    removeJob(id)
  },

  /** Delete result + original immediately. */
  async deleteJob(id: string): Promise<void> {
    const j = jobs.get(id)
    if (j) removeFile(j.job.fileId)
    removeJob(id)
  },

  async deleteFile(id: string): Promise<void> {
    removeFile(id)
  },
}
