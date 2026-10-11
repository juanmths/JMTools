import { Check, Download, FileText, Loader2, RefreshCw, Scissors, Upload } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import { useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { formatBytes } from '../../lib/utils'

export default function SplitPdfPage() {
  const [file, setFile] = useState<File>()
  const [pageCount, setPageCount] = useState<number>(0)
  const [rangeInput, setRangeInput] = useState('1')
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
      const count = doc.getPageCount()
      setPageCount(count)
      setRangeInput(`1-${Math.min(2, count)}`)
      setDownloadUrl(undefined)
    } catch {
      setError('Gagal membaca dokumen PDF. Pastikan file tidak rusak atau ber-password.')
    }
  }

  // Parse page range like "1-3, 5" into 0-indexed page numbers
  const parseRange = (str: string, max: number): number[] => {
    const pages = new Set<number>()
    const parts = str.split(',')

    for (const part of parts) {
      const trimmed = part.trim()
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-')
        const start = parseInt(startStr, 10)
        const end = parseInt(endStr, 10)
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            if (i >= 1 && i <= max) pages.add(i - 1)
          }
        }
      } else {
        const p = parseInt(trimmed, 10)
        if (!isNaN(p) && p >= 1 && p <= max) {
          pages.add(p - 1)
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b)
  }

  const splitPdf = async () => {
    if (!file) return
    const indices = parseRange(rangeInput, pageCount)
    if (indices.length === 0) {
      setError('Masukkan nomor atau rentang halaman yang valid (contoh: 1-3 atau 1, 3).')
      return
    }

    setProcessing(true)
    setError(undefined)

    try {
      const buffer = await file.arrayBuffer()
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
      const newDoc = await PDFDocument.create()

      const copied = await newDoc.copyPages(srcDoc, indices)
      copied.forEach((page) => newDoc.addPage(page))

      const bytes = await newDoc.save({ useObjectStreams: true })
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })

      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
      setDownloadUrl(URL.createObjectURL(blob))
      setDownloadSize(blob.size)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memisahkan dokumen PDF.')
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

  const selectedIndices = parseRange(rangeInput, pageCount)

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
          <Scissors className="size-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Pisahkan PDF (Split PDF)</h1>
        <p className="mt-2 text-slate-500">
          Ambil atau ekstrak rentang halaman tertentu dari dokumen PDF menjadi berkas baru yang mandiri.
        </p>
      </div>

      {error && <Alert>{error}</Alert>}

      {downloadUrl ? (
        <Card className="mx-auto max-w-lg space-y-6 p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Check className="size-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">PDF Berhasil Dipisahkan!</h2>
            <p className="mt-1 text-sm text-slate-500">
              Dokumen baru berisi {selectedIndices.length} halaman terpilih ({formatBytes(downloadSize ?? 0)})
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={downloadUrl}
              download={`${file?.name.replace(/\.[^.]+$/, '')}-split.pdf`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <Download className="size-5" /> Unduh PDF Baru
            </a>
            <Button variant="secondary" size="lg" onClick={resetAll}>
              <RefreshCw className="size-4" /> Pisahkan Berkas Lain
            </Button>
          </div>
        </Card>
      ) : !file ? (
        <label
          className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60"
        >
          <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFile} />
          <div className="grid size-16 place-items-center rounded-2xl bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-300">
            <Upload className="size-8" />
          </div>
          <p className="mt-4 text-lg font-semibold">Tarik berkas PDF yang ingin dipisahkan ke sini</p>
          <p className="mt-1 text-sm text-slate-500">
            atau <span className="font-semibold text-indigo-600 underline-offset-2 group-hover:underline dark:text-indigo-400">Pilih berkas dari perangkat</span>
          </p>
          <p className="mt-3 text-xs text-slate-400">Hanya format PDF</p>
        </label>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Card Info & Visual */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <FileText className="size-5 text-indigo-600" />
                <div>
                  <p className="truncate font-semibold max-w-[220px] sm:max-w-xs">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {pageCount} total halaman · {formatBytes(file.size)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="md" onClick={resetAll}>
                Ganti Berkas
              </Button>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pratinjau Halaman ({pageCount} Halaman)
              </p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 max-h-[320px] overflow-y-auto p-2 border border-slate-100 rounded-xl dark:border-slate-800">
                {Array.from({ length: pageCount }).map((_, i) => {
                  const isSelected = selectedIndices.includes(i)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        const pageNum = i + 1
                        if (isSelected) {
                          setRangeInput((prev) =>
                            prev
                              .split(',')
                              .map((s) => s.trim())
                              .filter((s) => s !== `${pageNum}`)
                              .join(', ') || '1'
                          )
                        } else {
                          setRangeInput((prev) => (prev ? `${prev}, ${pageNum}` : `${pageNum}`))
                        }
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/30 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'
                      }`}
                    >
                      <FileText className={`size-4 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`} />
                      <span className="mt-1">Hal {i + 1}</span>
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Halaman berwarna biru adalah halaman yang akan diekstrak ke dokumen baru.
              </p>
            </div>
          </Card>

          {/* Pengaturan Pemisahan */}
          <Card className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Pilih Halaman</h2>
              <p className="text-xs text-slate-500">Ketik rentang halaman atau klik kotak pratinjau</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Rentang Halaman
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="Contoh: 1-3 atau 1, 4, 6"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 font-mono"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Gunakan tanda minus (-) untuk rentang, dan koma (,) untuk halaman acak.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-white">Hasil Ekstrak:</span>
                <p className="mt-0.5">
                  {selectedIndices.length} halaman akan disimpan ke file baru: [
                  {selectedIndices.map((i) => i + 1).join(', ') || 'tidak ada'}].
                </p>
              </div>
            </div>

            <Button
              size="lg"
              disabled={processing || selectedIndices.length === 0}
              onClick={splitPdf}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Mengekstrak Halaman...
                </>
              ) : (
                <>
                  <Scissors className="size-4" /> Pisahkan & Ekstrak ({selectedIndices.length} Halaman)
                </>
              )}
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
