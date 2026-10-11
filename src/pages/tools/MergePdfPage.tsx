import { ArrowDown, ArrowUp, Check, Download, FileText, Layers, Loader2, Plus, RefreshCw, Trash2, Upload, X } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import { useCallback, useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { consumeCredit } from '../../lib/authStore'
import { formatBytes } from '../../lib/utils'

interface PdfItem {
  id: string
  file: File
  pages: number
}

export default function MergePdfPage() {
  const [items, setItems] = useState<PdfItem[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string>()
  const [downloadUrl, setDownloadUrl] = useState<string>()
  const [downloadSize, setDownloadSize] = useState<number>()

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError(undefined)
    const newItems: PdfItem[] = []

    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        continue
      }
      try {
        const buffer = await file.arrayBuffer()
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true })
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          pages: doc.getPageCount(),
        })
      } catch {
        setError(`Gagal membaca berkas ${file.name}. Pastikan berkas tidak rusak atau terenkripsi.`)
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems])
      setDownloadUrl(undefined)
    }
  }, [])

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return
    const updated = [...items]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setItems(updated)
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleMerge = async () => {
    if (items.length < 2) {
      setError('Pilih minimal 2 berkas PDF untuk digabungkan.')
      return
    }

    const { allowed } = consumeCredit()
    if (!allowed) return

    setProcessing(true)
    setError(undefined)
    setProgress('Menyiapkan dokumen baru...')

    try {
      const mergedPdf = await PDFDocument.create()

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        setProgress(`Menggabungkan berkas ${i + 1} dari ${items.length} (${item.file.name})...`)
        const buffer = await item.file.arrayBuffer()
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true })
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      setProgress('Menyimpan dan mengoptimalkan dokumen gabungan...')
      const mergedBytes = await mergedPdf.save({ useObjectStreams: true })
      const blob = new Blob([mergedBytes as BlobPart], { type: 'application/pdf' })

      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      setDownloadSize(blob.size)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan saat menggabungkan PDF.')
    } finally {
      setProcessing(false)
      setProgress('')
    }
  }

  const resetAll = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setItems([])
    setDownloadUrl(undefined)
    setDownloadSize(undefined)
    setError(undefined)
  }

  const totalPages = items.reduce((acc, cur) => acc + cur.pages, 0)
  const totalSize = items.reduce((acc, cur) => acc + cur.file.size, 0)

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
          <Layers className="size-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Gabungkan PDF (Merge PDF)</h1>
        <p className="mt-2 text-slate-500">
          Pilih atau seret beberapa berkas PDF sekaligus. Atur urutan berkas sesuai keinginan dan gabungkan menjadi satu.
        </p>
      </div>

      {error && <Alert>{error}</Alert>}

      {downloadUrl ? (
        <Card className="mx-auto max-w-lg space-y-6 p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Check className="size-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">PDF Berhasil Digabungkan!</h2>
            <p className="mt-1 text-sm text-slate-500">
              {items.length} berkas berhasil disatukan ({totalPages} total halaman · {formatBytes(downloadSize ?? 0)})
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={downloadUrl}
              download="jmtools-gabungan.pdf"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <Download className="size-5" /> Unduh PDF Gabungan
            </a>
            <Button variant="secondary" size="lg" onClick={resetAll}>
              <RefreshCw className="size-4" /> Gabung Lainnya
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {items.length === 0 ? (
            <label
              className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60"
            >
              <input
                type="file"
                multiple
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              <div className="grid size-16 place-items-center rounded-2xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300">
                <Upload className="size-8" />
              </div>
              <p className="mt-4 text-lg font-semibold">Tarik beberapa berkas PDF ke sini</p>
              <p className="mt-1 text-sm text-slate-500">
                atau <span className="font-semibold text-indigo-600 underline-offset-2 group-hover:underline dark:text-indigo-400">Pilih berkas dari perangkat</span>
              </p>
              <p className="mt-3 text-xs text-slate-400">Dapat memilih banyak berkas sekaligus</p>
            </label>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Urutan Berkas PDF ({items.length})</h2>
                  <p className="text-xs text-slate-500">
                    Total: {totalPages} halaman · {formatBytes(totalSize)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                    <Plus className="size-4 text-indigo-600" /> Tambah PDF
                    <input
                      type="file"
                      multiple
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    />
                  </label>
                  <Button variant="ghost" onClick={resetAll} title="Kosongkan daftar">
                    <X className="size-4" /> Reset
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <Card key={item.id} className="flex items-center gap-3 p-4">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {index + 1}
                    </span>
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium" title={item.file.name}>
                        {item.file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.pages} halaman · {formatBytes(item.file.size)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveItem(index, 'up')}
                        title="Geser ke atas"
                        aria-label={`Geser ${item.file.name} ke atas`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20 dark:hover:bg-slate-800"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        disabled={index === items.length - 1}
                        onClick={() => moveItem(index, 'down')}
                        title="Geser ke bawah"
                        aria-label={`Geser ${item.file.name} ke bawah`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20 dark:hover:bg-slate-800"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        title="Hapus dari daftar"
                        aria-label={`Hapus ${item.file.name}`}
                        className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <Button size="lg" disabled={processing || items.length < 2} onClick={handleMerge} className="w-full sm:w-auto">
                  {processing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> {progress || 'Memproses...'}
                    </>
                  ) : (
                    <>
                      <Layers className="size-5" /> Gabungkan {items.length} PDF Sekarang
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
