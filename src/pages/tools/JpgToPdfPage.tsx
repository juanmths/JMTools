import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  FileText,
  Image as ImageIcon,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import { useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { consumeCredit } from '../../lib/authStore'
import { formatBytes } from '../../lib/utils'

interface ImageCard {
  id: string
  file: File
  previewUrl: string
}

type PageOrientation = 'portrait' | 'landscape'
type PageSize = 'A4' | 'letter' | 'fit'
type MarginSize = 'none' | 'small' | 'large'

export default function JpgToPdfPage() {
  const [images, setImages] = useState<ImageCard[]>([])
  const [orientation, setOrientation] = useState<PageOrientation>('portrait')
  const [pageSize, setPageSize] = useState<PageSize>('A4')
  const [margin, setMargin] = useState<MarginSize>('small')
  const [processing, setProcessing] = useState(false)
  const [progressText, setProgressText] = useState('')
  const [error, setError] = useState<string>()
  const [downloadUrl, setDownloadUrl] = useState<string>()
  const [pdfSize, setPdfSize] = useState<number>()

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    if (!list || list.length === 0) return

    setError(undefined)
    const newCards: ImageCard[] = []

    for (let i = 0; i < list.length; i++) {
      const f = list[i]
      if (!f.type.startsWith('image/')) continue

      const url = URL.createObjectURL(f)
      newCards.push({
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file: f,
        previewUrl: url,
      })
    }

    if (newCards.length > 0) {
      setImages((prev) => [...prev, ...newCards])
      setDownloadUrl(undefined)
    }
  }

  const moveCard = (index: number, dir: 'left' | 'right') => {
    const target = dir === 'left' ? index - 1 : index + 1
    if (target < 0 || target >= images.length) return
    const updated = [...images]
    const temp = updated[index]
    updated[index] = updated[target]
    updated[target] = temp
    setImages(updated)
    setDownloadUrl(undefined)
  }

  const removeCard = (id: string) => {
    setImages((prev) => {
      const target = prev.find((it) => it.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((it) => it.id !== id)
    })
    setDownloadUrl(undefined)
  }

  const generatePdf = async () => {
    if (images.length === 0) return

    const { allowed } = consumeCredit()
    if (!allowed) return

    setProcessing(true)
    setError(undefined)
    setProgressText('Menyiapkan dokumen PDF baru...')

    try {
      const pdfDoc = await PDFDocument.create()

      // Dimensions in points (72 points = 1 inch)
      const A4_WIDTH = 595.28
      const A4_HEIGHT = 841.89
      const LETTER_WIDTH = 612.0
      const LETTER_HEIGHT = 792.0

      for (let i = 0; i < images.length; i++) {
        setProgressText(`Menambahkan halaman ${i + 1} dari ${images.length}...`)
        const card = images[i]
        const arrayBuffer = await card.file.arrayBuffer()

        let embeddedImage
        if (card.file.type === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(arrayBuffer)
        } else {
          // JPEG or converted
          embeddedImage = await pdfDoc.embedJpg(arrayBuffer)
        }

        const imgWidth = embeddedImage.width
        const imgHeight = embeddedImage.height

        let targetPageWidth = A4_WIDTH
        let targetPageHeight = A4_HEIGHT

        if (pageSize === 'letter') {
          targetPageWidth = LETTER_WIDTH
          targetPageHeight = LETTER_HEIGHT
        } else if (pageSize === 'fit') {
          targetPageWidth = imgWidth
          targetPageHeight = imgHeight
        }

        // Adjust for orientation
        if (pageSize !== 'fit') {
          if (orientation === 'landscape') {
            const temp = targetPageWidth
            targetPageWidth = targetPageHeight
            targetPageHeight = temp
          }
        }

        const page = pdfDoc.addPage([targetPageWidth, targetPageHeight])

        // Margin calculation
        let marginPoints = 0
        if (margin === 'small') marginPoints = 20
        if (margin === 'large') marginPoints = 50
        if (pageSize === 'fit') marginPoints = 0

        const availableWidth = targetPageWidth - marginPoints * 2
        const availableHeight = targetPageHeight - marginPoints * 2

        // Scale image to fit within available page dimensions maintaining aspect ratio
        const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight)
        const finalWidth = imgWidth * scale
        const finalHeight = imgHeight * scale

        // Center on page
        const xPos = marginPoints + (availableWidth - finalWidth) / 2
        const yPos = marginPoints + (availableHeight - finalHeight) / 2

        page.drawImage(embeddedImage, {
          x: xPos,
          y: yPos,
          width: finalWidth,
          height: finalHeight,
        })
      }

      setProgressText('Menyimpan dokumen PDF...')
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })

      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
      setDownloadUrl(URL.createObjectURL(blob))
      setPdfSize(blob.size)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghasilkan PDF dari gambar.')
    } finally {
      setProcessing(false)
      setProgressText('')
    }
  }

  const resetAll = () => {
    images.forEach((it) => URL.revokeObjectURL(it.previewUrl))
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setImages([])
    setDownloadUrl(undefined)
    setError(undefined)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-800">
          <Layers className="size-3.5" /> Konverter Foto ke Dokumen PDF
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Ubah Gambar ke PDF (JPG ke PDF)
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Satukan banyak foto JPG, PNG, atau WebP menjadi satu dokumen PDF siap cetak dengan tata letak halaman rapi.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {images.length === 0 ? (
        <Card className="p-8 sm:p-14 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 transition-colors">
          <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
            <ImageIcon className="size-10" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Pilih atau Tarik Berkas Foto ke Sini
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Mendukung penggabungan banyak foto KTP, kwitansi, ijazah, atau dokumen ke format PDF standar.
          </p>

          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-sky-500 transition-all hover:scale-105">
            <Upload className="size-4" /> Pilih Foto (Bisa Banyak Sekaligus)
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              multiple
              className="sr-only"
              onChange={handleFiles}
            />
          </label>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Settings Panel */}
          <Card className="md:col-span-1 space-y-5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="size-4 text-sky-600" /> Tata Letak Halaman PDF
            </h3>

            {/* Orientasi */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Orientasi Halaman:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'portrait' as const, label: 'Potret (Tegak)' },
                  { id: 'landscape' as const, label: 'Lanskap (Mendatar)' },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setOrientation(o.id)}
                    className={`rounded-xl py-2 px-2 text-xs font-bold transition-all ${
                      orientation === o.id
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ukuran Halaman */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ukuran Kertas:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'A4' as const, label: 'A4' },
                  { id: 'letter' as const, label: 'Letter' },
                  { id: 'fit' as const, label: 'Pas Gambar' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPageSize(s.id)}
                    className={`rounded-xl py-2 px-1 text-center text-xs font-bold transition-all ${
                      pageSize === s.id
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Margin */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Margin Batas Tepi:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'none' as const, label: 'Tanpa' },
                  { id: 'small' as const, label: 'Kecil' },
                  { id: 'large' as const, label: 'Lebar' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMargin(m.id)}
                    className={`rounded-xl py-2 px-1 text-center text-xs font-bold transition-all ${
                      margin === m.id
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 dark:border-slate-800 space-y-2">
              <label className="cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
                <Plus className="size-4 text-sky-600" /> Tambah Foto Lagi
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handleFiles}
                />
              </label>
              <Button variant="ghost" size="md" className="w-full text-xs text-rose-600" onClick={resetAll}>
                <RefreshCw className="size-3.5" /> Kosongkan Semua
              </Button>
            </div>
          </Card>

          {/* Cards Gallery & Generator Action */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Urutan Halaman ({images.length} Foto)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Gunakan panah kiri/kanan untuk menyesuaikan urutan halaman dalam PDF.
                  </p>
                </div>
              </div>

              {/* Grid of reorderable images */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto p-1">
                {images.map((card, idx) => (
                  <div
                    key={card.id}
                    className="relative rounded-2xl bg-slate-50 p-2.5 ring-1 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-700 space-y-2"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-900">
                      <img
                        src={card.previewUrl}
                        alt={card.file.name}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute top-2 left-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white">
                        Halaman {idx + 1}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate" title={card.file.name}>
                      {card.file.name}
                    </p>

                    {/* Actions: Move Left, Move Right, Delete */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveCard(idx, 'left')}
                          disabled={idx === 0}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-30 dark:hover:bg-slate-700"
                          title="Geser ke kiri"
                        >
                          <ArrowLeft className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveCard(idx, 'right')}
                          disabled={idx === images.length - 1}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-30 dark:hover:bg-slate-700"
                          title="Geser ke kanan"
                        >
                          <ArrowRight className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCard(card.id)}
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                        title="Hapus"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {!downloadUrl ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-sky-600 hover:bg-sky-500 font-bold"
                  onClick={generatePdf}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="size-5 animate-spin" /> {progressText || 'Memproses PDF...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-5" /> Gabungkan & Ekspor ke PDF ({images.length} Halaman)
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-4 rounded-2xl bg-sky-50/70 p-5 ring-1 ring-sky-200 dark:bg-sky-950/40 dark:ring-sky-800">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-sky-600 text-white">
                      <Check className="size-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-sky-900 dark:text-sky-100">
                        Dokumen PDF Berhasil Dibuat!
                      </h4>
                      <p className="text-xs text-sky-700 dark:text-sky-300">
                        {images.length} halaman siap diunduh ({pdfSize ? formatBytes(pdfSize) : ''}).
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={downloadUrl}
                      download={`jmtools-dokumen-${images.length}-halaman.pdf`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-sky-500 transition-all"
                    >
                      <Download className="size-4" /> Unduh Dokumen PDF
                    </a>
                    <Button variant="secondary" size="md" onClick={() => setDownloadUrl(undefined)}>
                      Sesuaikan Lagi
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
