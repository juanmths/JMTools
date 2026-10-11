import { Check, Download, FileText, Loader2, PenTool, RefreshCw, Upload } from 'lucide-react'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { formatBytes } from '../../lib/utils'

export default function EditPdfPage() {
  const [file, setFile] = useState<File>()
  const [pageCount, setPageCount] = useState<number>(0)
  const [customText, setCustomText] = useState('')
  const [stampType, setStampType] = useState<'text' | 'approved' | 'paid' | 'confidential'>('approved')
  const [position, setPosition] = useState<'top-right' | 'center' | 'bottom-right'>('bottom-right')
  const [targetPage, setTargetPage] = useState<number>(1)
  const [fontSize, setFontSize] = useState(16)
  const [colorHex, setColorHex] = useState('#16a34a') // green for approved
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

  const handleApplyEdit = async () => {
    if (!file) return
    setProcessing(true)
    setError(undefined)

    try {
      const buffer = await file.arrayBuffer()
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true })
      const font = await doc.embedFont(StandardFonts.HelveticaBold)
      const pages = doc.getPages()
      const color = hexToRgb(colorHex)

      let renderedText = customText.trim()
      if (stampType === 'approved') renderedText = `[DISETUJUI - ${new Date().toLocaleDateString('id-ID')}]`
      else if (stampType === 'paid') renderedText = `[LUNAS - ${new Date().toLocaleDateString('id-ID')}]`
      else if (stampType === 'confidential') renderedText = '[RAHASIA & DILINDUNGI]'

      if (!renderedText) {
        setError('Masukkan teks yang ingin ditambahkan ke dokumen.')
        setProcessing(false)
        return
      }

      const pIndex = Math.min(Math.max(1, targetPage), pageCount) - 1
      const page = pages[pIndex]
      const { width, height } = page.getSize()
      const textWidth = font.widthOfTextAtSize(renderedText, fontSize)
      const textHeight = font.heightAtSize(fontSize)

      let x = width - textWidth - 40
      let y = 40
      if (position === 'top-right') {
        x = width - textWidth - 40
        y = height - textHeight - 40
      } else if (position === 'center') {
        x = (width - textWidth) / 2
        y = (height - textHeight) / 2
      }

      page.drawText(renderedText, {
        x: Math.max(20, x),
        y: Math.max(20, y),
        size: fontSize,
        font,
        color,
      })

      const bytes = await doc.save({ useObjectStreams: true })
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })

      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
      setDownloadUrl(URL.createObjectURL(blob))
      setDownloadSize(blob.size)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengedit dokumen PDF.')
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
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          <PenTool className="size-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Dokumen PDF</h1>
        <p className="mt-2 text-slate-500">
          Tambahkan teks baru, stempel verifikasi (DISETUJUI/LUNAS), tanggal, dan catatan pada halaman PDF Anda.
        </p>
      </div>

      {error && <Alert>{error}</Alert>}

      {downloadUrl ? (
        <Card className="mx-auto max-w-lg space-y-6 p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Check className="size-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">PDF Berhasil Diedit!</h2>
            <p className="mt-1 text-sm text-slate-500">
              Dokumen tersimpan dengan elemen baru ({pageCount} halaman · {formatBytes(downloadSize ?? 0)})
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={downloadUrl}
              download={`${file?.name.replace(/\.[^.]+$/, '')}-edit.pdf`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <Download className="size-5" /> Unduh PDF Diedit
            </a>
            <Button variant="secondary" size="lg" onClick={resetAll}>
              <RefreshCw className="size-4" /> Edit Berkas Lain
            </Button>
          </div>
        </Card>
      ) : !file ? (
        <label
          className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60"
        >
          <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFile} />
          <div className="grid size-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300">
            <Upload className="size-8" />
          </div>
          <p className="mt-4 text-lg font-semibold">Tarik berkas PDF yang ingin diedit ke sini</p>
          <p className="mt-1 text-sm text-slate-500">
            atau <span className="font-semibold text-indigo-600 underline-offset-2 group-hover:underline dark:text-indigo-400">Pilih berkas dari perangkat</span>
          </p>
          <p className="mt-3 text-xs text-slate-400">Hanya format PDF</p>
        </label>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Card Info & Pratinjau */}
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

            <div className="relative flex aspect-[3/4] max-h-[420px] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-inner dark:border-slate-700 dark:bg-slate-800/80">
              <div className="absolute inset-x-8 top-8 space-y-2 opacity-30 select-none">
                <div className="h-4 w-3/4 rounded bg-slate-300 dark:bg-slate-600" />
                <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Teks / Stempel Preview */}
              <div
                className={`absolute select-none font-bold tracking-wide rounded-md px-2 py-1 shadow-sm ${
                  position === 'top-right'
                    ? 'top-6 right-6'
                    : position === 'center'
                      ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                      : 'bottom-6 right-6'
                }`}
                style={{
                  color: colorHex,
                  border: `2px solid ${colorHex}`,
                  fontSize: `${fontSize}px`,
                }}
              >
                {stampType === 'approved'
                  ? `[DISETUJUI - ${new Date().toLocaleDateString('id-ID')}]`
                  : stampType === 'paid'
                    ? `[LUNAS - ${new Date().toLocaleDateString('id-ID')}]`
                    : stampType === 'confidential'
                      ? '[RAHASIA]'
                      : customText || 'Teks Tambahan'}
              </div>
            </div>
            <p className="text-center text-xs text-slate-400">
              Elemen akan dicetak pada halaman ke-{targetPage} dari {pageCount} halaman.
            </p>
          </Card>

          {/* Opsi Editor */}
          <Card className="space-y-5">
            <div>
              <h2 className="text-lg font-bold">Elemen Tambahan</h2>
              <p className="text-xs text-slate-500">Pilih stempel atau teks bebas</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Jenis Elemen
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStampType('approved')
                      setColorHex('#16a34a')
                    }}
                    className={`rounded-xl border p-2 text-xs font-medium ${
                      stampType === 'approved'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950'
                        : 'border-slate-200'
                    }`}
                  >
                    ✓ DISETUJUI
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStampType('paid')
                      setColorHex('#2563eb')
                    }}
                    className={`rounded-xl border p-2 text-xs font-medium ${
                      stampType === 'paid'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950'
                        : 'border-slate-200'
                    }`}
                  >
                    ★ LUNAS
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStampType('confidential')
                      setColorHex('#dc2626')
                    }}
                    className={`rounded-xl border p-2 text-xs font-medium ${
                      stampType === 'confidential'
                        ? 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950'
                        : 'border-slate-200'
                    }`}
                  >
                    🔒 RAHASIA
                  </button>
                  <button
                    type="button"
                    onClick={() => setStampType('text')}
                    className={`rounded-xl border p-2 text-xs font-medium ${
                      stampType === 'text'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950'
                        : 'border-slate-200'
                    }`}
                  >
                    ✎ Teks Kustom
                  </button>
                </div>
              </div>

              {stampType === 'text' && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Teks Kustom
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Ketik teks yang ingin ditempelkan..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Posisi di Halaman
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'top-right', label: 'Kanan Atas' },
                    { id: 'center', label: 'Tengah' },
                    { id: 'bottom-right', label: 'Kanan Bawah' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPosition(p.id as typeof position)}
                      className={`rounded-xl border p-2 text-[11px] font-medium ${
                        position === p.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950'
                          : 'border-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Target Halaman
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={pageCount}
                    value={targetPage}
                    onChange={(e) => setTargetPage(Math.min(pageCount, Math.max(1, Number(e.target.value))))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Ukuran Teks ({fontSize}px)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={48}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <Button
              size="lg"
              disabled={processing || (stampType === 'text' && !customText.trim())}
              onClick={handleApplyEdit}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Menyimpan Perubahan...
                </>
              ) : (
                <>
                  <PenTool className="size-4" /> Terapkan & Unduh PDF
                </>
              )}
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
