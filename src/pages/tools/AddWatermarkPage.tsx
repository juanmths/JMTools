import { Check, Download, FileText, Loader2, RefreshCw, Stamp, Upload } from 'lucide-react'
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { formatBytes } from '../../lib/utils'

export default function AddWatermarkPage() {
  const [file, setFile] = useState<File>()
  const [pageCount, setPageCount] = useState<number>(0)
  const [text, setText] = useState('RAHASIA')
  const [opacity, setOpacity] = useState(25) // percentage
  const [fontSize, setFontSize] = useState(48)
  const [rotation, setRotation] = useState<'diagonal' | 'horizontal'>('diagonal')
  const [colorHex, setColorHex] = useState('#dc2626') // default red
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string>()
  const [downloadUrl, setDownloadUrl] = useState<string>()
  const [downloadSize, setDownloadSize] = useState<number>()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setError(undefined)
    try {
      const buffer = await f.arrayBuffer()
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true })
      setFile(f)
      setPageCount(doc.getPageCount())
      setDownloadUrl(undefined)
    } catch {
      setError('Gagal membaca dokumen PDF. Pastikan file tidak rusak atau ber-password.')
    }
  }

  const hexToRgb = (hex: string) => {
    const cleaned = hex.replace('#', '')
    const r = parseInt(cleaned.substring(0, 2), 16) / 255
    const g = parseInt(cleaned.substring(2, 4), 16) / 255
    const b = parseInt(cleaned.substring(4, 6), 16) / 255
    return rgb(r, g, b)
  }

  const applyWatermark = async () => {
    if (!file || !text.trim()) return
    setProcessing(true)
    setError(undefined)

    try {
      const buffer = await file.arrayBuffer()
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true })
      const font = await doc.embedFont(StandardFonts.HelveticaBold)
      const pages = doc.getPages()
      const color = hexToRgb(colorHex)
      const angle = rotation === 'diagonal' ? 45 : 0
      const textWidth = font.widthOfTextAtSize(text, fontSize)
      const textHeight = font.heightAtSize(fontSize)

      for (const page of pages) {
        const { width, height } = page.getSize()
        const x = (width - textWidth) / 2
        const y = (height - textHeight) / 2

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color,
          opacity: opacity / 100,
          rotate: degrees(angle),
        })
      }

      const bytes = await doc.save({ useObjectStreams: true })
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })

      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
      setDownloadUrl(URL.createObjectURL(blob))
      setDownloadSize(blob.size)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menambahkan watermark pada PDF.')
    } finally {
      setProcessing(false)
    }
  }

  const resetAll = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setFile(undefined)
    setDownloadUrl(undefined)
    setDownloadSize(undefined)
    setError(undefined)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950/60 dark:text-fuchsia-400">
          <Stamp className="size-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Tambah Watermark ke PDF</h1>
        <p className="mt-2 text-slate-500">
          Lindungi dokumen Anda dengan stempel tanda air kustom. Atur teks, transparansi, warna, dan sudut kemiringan.
        </p>
      </div>

      {error && <Alert>{error}</Alert>}

      {downloadUrl ? (
        <Card className="mx-auto max-w-lg space-y-6 p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Check className="size-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Watermark Berhasil Diterapkan!</h2>
            <p className="mt-1 text-sm text-slate-500">
              Dokumen siap diunduh ({pageCount} halaman · {formatBytes(downloadSize ?? 0)})
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={downloadUrl}
              download={`${file?.name.replace(/\.[^.]+$/, '')}-watermark.pdf`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <Download className="size-5" /> Unduh PDF
            </a>
            <Button variant="secondary" size="lg" onClick={resetAll}>
              <RefreshCw className="size-4" /> Watermark Berkas Lain
            </Button>
          </div>
        </Card>
      ) : !file ? (
        <label
          className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60"
        >
          <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFile} />
          <div className="grid size-16 place-items-center rounded-2xl bg-fuchsia-50 text-fuchsia-600 transition-colors group-hover:bg-fuchsia-100 dark:bg-fuchsia-950 dark:text-fuchsia-300">
            <Upload className="size-8" />
          </div>
          <p className="mt-4 text-lg font-semibold">Tarik berkas PDF ke sini</p>
          <p className="mt-1 text-sm text-slate-500">
            atau <span className="font-semibold text-indigo-600 underline-offset-2 group-hover:underline dark:text-indigo-400">Pilih berkas dari perangkat</span>
          </p>
          <p className="mt-3 text-xs text-slate-400">Hanya format PDF</p>
        </label>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Pratinjau Card */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-indigo-600" />
                <div>
                  <p className="truncate font-semibold max-w-[220px] sm:max-w-xs">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {pageCount} halaman · {formatBytes(file.size)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="md" onClick={resetAll}>
                Ganti Berkas
              </Button>
            </div>

            {/* Simulasi Tampilan Halaman PDF */}
            <div className="relative flex aspect-[3/4] max-h-[420px] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-inner dark:border-slate-700 dark:bg-slate-800/80">
              <div className="absolute inset-x-8 top-8 space-y-2 opacity-30 select-none">
                <div className="h-4 w-3/4 rounded bg-slate-300 dark:bg-slate-600" />
                <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Watermark Overlay Visual */}
              <div
                className="pointer-events-none select-none font-bold tracking-wider"
                style={{
                  color: colorHex,
                  opacity: opacity / 100,
                  fontSize: `${Math.min(fontSize, 40)}px`,
                  transform: rotation === 'diagonal' ? 'rotate(-45deg)' : 'none',
                }}
              >
                {text || 'CONTOH WATERMARK'}
              </div>
            </div>
            <p className="text-center text-xs text-slate-400">
              Watermark akan diterapkan pada seluruh {pageCount} halaman dokumen.
            </p>
          </Card>

          {/* Pengaturan Panel */}
          <Card className="space-y-5">
            <div>
              <h2 className="text-lg font-bold">Pengaturan Tanda Air</h2>
              <p className="text-xs text-slate-500">Sesuaikan teks dan tampilan tanda air</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Teks Watermark
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Misal: DRAF, RAHASIA, NAMA ANDA"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
                <div className="mt-1 flex flex-wrap gap-1">
                  {['RAHASIA', 'DRAF', 'SALINAN', 'CONTOH'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setText(preset)}
                      className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Transparansi / Opasitas ({opacity}%)
                </label>
                <input
                  type="range"
                  min={5}
                  max={90}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Samar (5%)</span>
                  <span>Jelas (90%)</span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Ukuran Teks ({fontSize}px)
                </label>
                <input
                  type="range"
                  min={20}
                  max={72}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Orientasi / Posisi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation('diagonal')}
                    className={`rounded-xl border p-2.5 text-xs font-medium transition-colors ${
                      rotation === 'diagonal'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                    }`}
                  >
                    ↗ Diagonal (45°)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation('horizontal')}
                    className={`rounded-xl border p-2.5 text-xs font-medium transition-colors ${
                      rotation === 'horizontal'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                    }`}
                  >
                    → Mendatar (0°)
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Warna Teks
                </label>
                <div className="flex items-center gap-2">
                  {['#dc2626', '#2563eb', '#475569', '#16a34a', '#ca8a04'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColorHex(c)}
                      aria-label={`Pilih warna ${c}`}
                      className={`size-7 rounded-full border-2 transition-transform ${
                        colorHex === c ? 'scale-110 border-slate-900 shadow dark:border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="size-7 cursor-pointer rounded border-0 bg-transparent"
                    title="Pilih warna kustom"
                  />
                </div>
              </div>
            </div>

            <Button
              size="lg"
              disabled={processing || !text.trim()}
              onClick={applyWatermark}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Menerapkan Watermark...
                </>
              ) : (
                <>
                  <Stamp className="size-4" /> Terapkan Watermark Sekarang
                </>
              )}
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
