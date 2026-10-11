import { Check, Download, FileText, Loader2, RefreshCw, RotateCcw, RotateCw, Upload } from 'lucide-react'
import { degrees, PDFDocument } from 'pdf-lib'
import { useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { formatBytes } from '../../lib/utils'

export default function RotatePdfPage() {
  const [file, setFile] = useState<File>()
  const [pageCount, setPageCount] = useState<number>(0)
  const [rotationAngle, setRotationAngle] = useState<number>(90) // 90, 180, 270
  const [targetScope, setTargetScope] = useState<'all' | 'odd' | 'even'>('all')
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

  const rotatePdf = async () => {
    if (!file) return
    setProcessing(true)
    setError(undefined)

    try {
      const buffer = await file.arrayBuffer()
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true })
      const pages = doc.getPages()

      pages.forEach((page, index) => {
        const pageNum = index + 1
        const shouldRotate =
          targetScope === 'all' ||
          (targetScope === 'odd' && pageNum % 2 !== 0) ||
          (targetScope === 'even' && pageNum % 2 === 0)

        if (shouldRotate) {
          const currentRotation = page.getRotation().angle
          page.setRotation(degrees((currentRotation + rotationAngle) % 360))
        }
      })

      const bytes = await doc.save({ useObjectStreams: true })
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })

      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
      setDownloadUrl(URL.createObjectURL(blob))
      setDownloadSize(blob.size)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memutar halaman PDF.')
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
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
          <RotateCw className="size-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Putar Halaman PDF (Rotate PDF)</h1>
        <p className="mt-2 text-slate-500">
          Ubah orientasi halaman PDF yang miring atau terbalik ke arah kanan (90°), kiri (90°), atau 180°.
        </p>
      </div>

      {error && <Alert>{error}</Alert>}

      {downloadUrl ? (
        <Card className="mx-auto max-w-lg space-y-6 p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Check className="size-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Halaman Berhasil Diputar!</h2>
            <p className="mt-1 text-sm text-slate-500">
              Dokumen siap diunduh ({pageCount} halaman · {formatBytes(downloadSize ?? 0)})
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={downloadUrl}
              download={`${file?.name.replace(/\.[^.]+$/, '')}-rotated.pdf`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <Download className="size-5" /> Unduh PDF Diputar
            </a>
            <Button variant="secondary" size="lg" onClick={resetAll}>
              <RefreshCw className="size-4" /> Putar Berkas Lain
            </Button>
          </div>
        </Card>
      ) : !file ? (
        <label
          className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60"
        >
          <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFile} />
          <div className="grid size-16 place-items-center rounded-2xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300">
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
          {/* Card Info & Visual Preview */}
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

            <div className="flex aspect-[4/3] max-h-[380px] w-full items-center justify-center rounded-xl bg-slate-50 p-6 dark:bg-slate-800/50">
              <div
                className="flex aspect-[3/4] w-48 flex-col items-center justify-center rounded-lg border-2 border-indigo-400 bg-white p-4 shadow transition-transform duration-300 dark:bg-slate-900"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              >
                <div className="h-4 w-3/4 rounded bg-indigo-200 dark:bg-indigo-800" />
                <div className="mt-3 h-2 w-full rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-1 h-2 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-1 h-2 w-full rounded bg-slate-200 dark:bg-slate-700" />
                <span className="mt-6 text-xs font-bold text-indigo-600">HALAMAN 1</span>
              </div>
            </div>
            <p className="text-center text-xs text-slate-400">
              Pratinjau orientasi setelah diputar {rotationAngle} derajat searah jarum jam.
            </p>
          </Card>

          {/* Opsi Rotasi */}
          <Card className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Arah Putaran</h2>
              <p className="text-xs text-slate-500">Pilih sudut dan halaman target</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRotationAngle(90)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-3 text-xs font-semibold ${
                    rotationAngle === 90
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'border-slate-200'
                  }`}
                >
                  <RotateCw className="size-5" />
                  Kanan (90°)
                </button>
                <button
                  type="button"
                  onClick={() => setRotationAngle(180)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-3 text-xs font-semibold ${
                    rotationAngle === 180
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'border-slate-200'
                  }`}
                >
                  <RefreshCw className="size-5" />
                  Balik (180°)
                </button>
                <button
                  type="button"
                  onClick={() => setRotationAngle(270)}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-3 text-xs font-semibold ${
                    rotationAngle === 270
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'border-slate-200'
                  }`}
                >
                  <RotateCcw className="size-5" />
                  Kiri (270°)
                </button>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Terapkan Pada
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: `Semua Halaman (${pageCount} Halaman)` },
                    { id: 'odd', label: 'Hanya Halaman Ganjil (1, 3, 5, ...)' },
                    { id: 'even', label: 'Hanya Halaman Genap (2, 4, 6, ...)' },
                  ].map((s) => (
                    <label
                      key={s.id}
                      className="flex cursor-pointer items-center gap-2 rounded-xl p-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <input
                        type="radio"
                        name="scope"
                        checked={targetScope === s.id}
                        onChange={() => setTargetScope(s.id as typeof targetScope)}
                        className="accent-indigo-600"
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <Button size="lg" disabled={processing} onClick={rotatePdf} className="w-full">
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Memutar Halaman...
                </>
              ) : (
                <>
                  <RotateCw className="size-4" /> Putar & Simpan PDF Sekarang
                </>
              )}
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
