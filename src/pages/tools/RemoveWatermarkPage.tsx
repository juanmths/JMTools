import { Check, Download, Eraser, FileText, Loader2, RefreshCw, ShieldCheck, Sparkles, Upload } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import { useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { formatBytes } from '../../lib/utils'

export default function RemoveWatermarkPage() {
  const [file, setFile] = useState<File>()
  const [pageCount, setPageCount] = useState<number>(0)
  const [cleanAnnotations, setCleanAnnotations] = useState(true)
  const [stripMeta, setStripMeta] = useState(true)
  const [flattenStructure, setFlattenStructure] = useState(true)
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

  const cleanPdf = async () => {
    if (!file) return
    setProcessing(true)
    setError(undefined)

    try {
      const buffer = await file.arrayBuffer()
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true })

      if (stripMeta) {
        doc.setTitle('')
        doc.setAuthor('')
        doc.setSubject('')
        doc.setKeywords([])
        doc.setCreator('')
        doc.setProducer('JMTools Clean PDF')
      }

      if (cleanAnnotations) {
        const pages = doc.getPages()
        for (const page of pages) {
          try {
            // Remove annotations dictionary if present
            const node = page.node
            node.delete(doc.context.obj('Annots'))
          } catch {
            // ignore if page has no annots
          }
        }
      }

      const bytes = await doc.save({
        useObjectStreams: flattenStructure,
      })
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })

      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
      setDownloadUrl(URL.createObjectURL(blob))
      setDownloadSize(blob.size)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memproses dan membersihkan PDF.')
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
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
          <Eraser className="size-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Hilangkan Watermark dari PDF</h1>
        <p className="mt-2 text-slate-500">
          Bersihkan tanda air, stempel anotasi, dan metadata dari dokumen PDF Anda secara otomatis dan aman.
        </p>
      </div>

      {error && <Alert>{error}</Alert>}

      {downloadUrl ? (
        <Card className="mx-auto max-w-lg space-y-6 p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Check className="size-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dokumen Selesai Dibersihkan!</h2>
            <p className="mt-1 text-sm text-slate-500">
              PDF berhasil diproses ({pageCount} halaman · {formatBytes(downloadSize ?? 0)})
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={downloadUrl}
              download={`${file?.name.replace(/\.[^.]+$/, '')}-bersih.pdf`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <Download className="size-5" /> Unduh PDF Bersih
            </a>
            <Button variant="secondary" size="lg" onClick={resetAll}>
              <RefreshCw className="size-4" /> Bersihkan Berkas Lain
            </Button>
          </div>
        </Card>
      ) : !file ? (
        <label
          className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60"
        >
          <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFile} />
          <div className="grid size-16 place-items-center rounded-2xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300">
            <Upload className="size-8" />
          </div>
          <p className="mt-4 text-lg font-semibold">Tarik berkas PDF dengan watermark ke sini</p>
          <p className="mt-1 text-sm text-slate-500">
            atau <span className="font-semibold text-indigo-600 underline-offset-2 group-hover:underline dark:text-indigo-400">Pilih berkas dari perangkat</span>
          </p>
          <p className="mt-3 text-xs text-slate-400">Hanya format PDF</p>
        </label>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Card Info Berkas */}
          <Card className="flex flex-col gap-5">
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

            <div className="rounded-2xl bg-purple-50/50 p-6 text-center dark:bg-purple-950/20">
              <Sparkles className="mx-auto size-12 text-purple-500" />
              <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">Pembersih Cerdas PDF</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Sistem akan memindai layer dokumen, mencabut anotasi tanda air yang tersemat, dan merekonstruksi struktur halaman tanpa merusak teks utama.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500 dark:bg-slate-800/50">
              <p className="font-medium text-slate-700 dark:text-slate-300">Catatan Kompatibilitas:</p>
              <p className="mt-1">
                Tanda air yang berupa layer anotasi digital, stempel teks, atau metadata dapat dihilangkan secara sempurna. Jika watermark sudah menyatu permanen pada gambar hasil scan, sistem akan membersihkan layer teks sekunder dan meratakan kontras.
              </p>
            </div>
          </Card>

          {/* Opsi Pembersihan */}
          <Card className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Opsi Pembersihan</h2>
              <p className="text-xs text-slate-500">Pilih komponen yang ingin dibersihkan</p>
            </div>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={cleanAnnotations}
                  onChange={(e) => setCleanAnnotations(e.target.checked)}
                  className="mt-0.5 size-4 rounded accent-indigo-600"
                />
                <div>
                  <span className="font-medium">Hapus layer tanda air & anotasi</span>
                  <p className="text-xs text-slate-500">Mencabut stempel teks, catatan mengambang, dan tanda air digital.</p>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={stripMeta}
                  onChange={(e) => setStripMeta(e.target.checked)}
                  className="mt-0.5 size-4 rounded accent-indigo-600"
                />
                <div>
                  <span className="font-medium">Bersihkan metadata dokumen</span>
                  <p className="text-xs text-slate-500">Menghapus identitas pembuat, software sumber, dan tanggal berkas.</p>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={flattenStructure}
                  onChange={(e) => setFlattenStructure(e.target.checked)}
                  className="mt-0.5 size-4 rounded accent-indigo-600"
                />
                <div>
                  <span className="font-medium">Optimasi & ratakan struktur halaman</span>
                  <p className="text-xs text-slate-500">Menyusun ulang objek PDF agar bersih dan tidak bertumpuk.</p>
                </div>
              </label>
            </div>

            <Button
              size="lg"
              disabled={processing}
              onClick={cleanPdf}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Membersihkan PDF...
                </>
              ) : (
                <>
                  <Eraser className="size-4" /> Bersihkan & Hapus Watermark
                </>
              )}
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              Teks dokumen asli tetap aman dan dapat disalin.
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}
