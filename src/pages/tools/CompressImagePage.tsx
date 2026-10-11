import JSZip from 'jszip'
import {
  Archive,
  Download,
  FileImage,
  ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { consumeCredit } from '../../lib/authStore'
import { formatBytes } from '../../lib/utils'

interface ImageItem {
  id: string
  file: File
  previewUrl: string
  dimensions?: { width: number; height: number }
  compressedBlob?: Blob
  compressedUrl?: string
  status: 'idle' | 'compressing' | 'done' | 'error'
  error?: string
}

export default function CompressImagePage() {
  const [items, setItems] = useState<ImageItem[]>([])
  const [quality, setQuality] = useState<number>(75)
  const [targetMime, setTargetMime] = useState<'image/jpeg' | 'image/webp'>('image/jpeg')
  const [processing, setProcessing] = useState(false)
  const [progressText, setProgressText] = useState('')
  const [globalError, setGlobalError] = useState<string>()
  const [zipDownloading, setZipDownloading] = useState(false)

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return

    setGlobalError(undefined)
    const newItems: ImageItem[] = []

    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i]
      if (!f.type.startsWith('image/')) continue

      const url = URL.createObjectURL(f)
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

      const item: ImageItem = {
        id,
        file: f,
        previewUrl: url,
        status: 'idle',
      }

      const img = new Image()
      img.onload = () => {
        setItems((prev) =>
          prev.map((it) =>
            it.id === id ? { ...it, dimensions: { width: img.naturalWidth, height: img.naturalHeight } } : it,
          ),
        )
      }
      img.src = url

      newItems.push(item)
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems])
    }
  }

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id)
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
        if (target.compressedUrl) URL.revokeObjectURL(target.compressedUrl)
      }
      return prev.filter((it) => it.id !== id)
    })
  }

  const compressSingle = async (item: ImageItem): Promise<{ blob: Blob; url: string }> => {
    const img = new Image()
    img.src = item.previewUrl
    await new Promise((res, rej) => {
      img.onload = res
      img.onerror = rej
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D tidak tersedia.')

    if (targetMime === 'image/jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(img, 0, 0)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b)
          else reject(new Error('Gagal mengompres gambar.'))
        },
        targetMime,
        quality / 100,
      )
    })

    const url = URL.createObjectURL(blob)
    return { blob, url }
  }

  const compressAll = async () => {
    if (items.length === 0) return

    const { allowed } = consumeCredit()
    if (!allowed) return

    setProcessing(true)
    setGlobalError(undefined)

    const updated = [...items]

    for (let i = 0; i < updated.length; i++) {
      const it = updated[i]
      setProgressText(`Mengompres berkas ${i + 1} dari ${updated.length} (${it.file.name})...`)
      it.status = 'compressing'
      setItems([...updated])

      try {
        const { blob, url } = await compressSingle(it)
        it.compressedBlob = blob
        it.compressedUrl = url
        it.status = 'done'
      } catch (err) {
        it.status = 'error'
        it.error = err instanceof Error ? err.message : 'Gagal'
      }

      setItems([...updated])
    }

    setProcessing(false)
    setProgressText('')
  }

  const downloadAllAsZip = async () => {
    const doneItems = items.filter((it) => it.compressedBlob && it.status === 'done')
    if (doneItems.length === 0) return

    setZipDownloading(true)
    try {
      const zip = new JSZip()
      const ext = targetMime === 'image/webp' ? '.webp' : '.jpg'

      doneItems.forEach((it, idx) => {
        const cleanName = it.file.name.replace(/\.[^.]+$/, '')
        const fileName = `${cleanName}-kompres-${idx + 1}${ext}`
        if (it.compressedBlob) {
          zip.file(fileName, it.compressedBlob)
        }
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(zipBlob)
      link.download = `jmtools-gambar-terkompresi-${Date.now()}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      setGlobalError('Gagal membuat paket ZIP.')
    } finally {
      setZipDownloading(false)
    }
  }

  const resetAll = () => {
    items.forEach((it) => {
      URL.revokeObjectURL(it.previewUrl)
      if (it.compressedUrl) URL.revokeObjectURL(it.compressedUrl)
    })
    setItems([])
    setGlobalError(undefined)
  }

  // Aggregate stats
  const totalOriginalSize = items.reduce((acc, it) => acc + it.file.size, 0)
  const doneItems = items.filter((it) => it.status === 'done' && it.compressedBlob)
  const totalCompressedSize = doneItems.reduce((acc, it) => acc + (it.compressedBlob?.size || 0), 0)
  const totalSavedPercent =
    totalOriginalSize > 0 && totalCompressedSize > 0
      ? Math.max(0, Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100))
      : 0

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800">
          <Zap className="size-3.5" /> Kompresi Multi-Berkas Canggih
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Kompres Banyak Gambar Sekaligus (Batch)
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">
          Unggah banyak gambar JPG, PNG, atau WebP sekaligus. Perkecil ukuran berkas secara otomatis dengan visual tetap jernih dan unduh dalam satu berkas ZIP.
        </p>
      </div>

      {globalError && <Alert tone="error">{globalError}</Alert>}

      {items.length === 0 ? (
        <Card className="p-8 sm:p-14 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 transition-colors">
          <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <ImageIcon className="size-10" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Tarik & Taruh Banyak Gambar di Sini
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Mendukung kompresi banyak berkas sekaligus (JPG, PNG, WebP) hingga resolusi 4K.
          </p>

          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-500 transition-all hover:scale-105">
            <Upload className="size-4" /> Pilih Gambar (Bisa Banyak Sekaligus)
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
        <div className="space-y-6">
          {/* Controls Bar & Global Settings */}
          <Card className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileImage className="size-5 text-emerald-600" /> Daftar Antrean ({items.length} Berkas)
                </h3>
                <p className="text-xs text-slate-500">
                  Total ukuran awal: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatBytes(totalOriginalSize)}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  <Plus className="size-3.5 text-emerald-600" /> Tambah Gambar
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handleFiles}
                  />
                </label>
                <Button variant="ghost" size="md" className="text-xs text-rose-600" onClick={resetAll}>
                  <RefreshCw className="size-3.5" /> Bersihkan Semua
                </Button>
              </div>
            </div>

            {/* Quality Presets & Slider */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Level Kompresi:</label>
                <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                  {[
                    { label: 'Kecil', val: 50 },
                    { label: 'Seimbang', val: 75 },
                    { label: 'Tinggi', val: 90 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setQuality(p.val)}
                      className={`rounded-xl py-2 px-1 text-center text-xs font-bold transition-all ${
                        quality === p.val
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {p.label} ({p.val}%)
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 text-xs">
                <div className="flex justify-between font-semibold">
                  <span>Kualitas Presisi:</span>
                  <span className="text-emerald-600 font-bold">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="95"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Format Simpan:</label>
                <div className="flex gap-2 mt-1.5">
                  {[
                    { id: 'image/jpeg' as const, label: 'JPG (Standar)' },
                    { id: 'image/webp' as const, label: 'WebP (Ultra Ringan)' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setTargetMime(fmt.id)}
                      className={`flex-1 rounded-xl py-2 px-2 text-xs font-bold transition-all ${
                        targetMime === fmt.id
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                {doneItems.length > 0 ? (
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ✅ {doneItems.length} dari {items.length} gambar selesai dikompres. Total hemat: {totalSavedPercent}%!
                  </span>
                ) : (
                  <span>Siap mengompres {items.length} berkas gambar.</span>
                )}
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                {doneItems.length > 1 && (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="flex-1 sm:flex-none border-emerald-600 text-emerald-700 dark:text-emerald-300 font-bold text-xs"
                    onClick={downloadAllAsZip}
                    disabled={zipDownloading}
                  >
                    {zipDownloading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Menyiapkan ZIP...
                      </>
                    ) : (
                      <>
                        <Archive className="size-4" /> Unduh Semua ({doneItems.length} File .ZIP)
                      </>
                    )}
                  </Button>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 font-bold text-xs"
                  onClick={compressAll}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> {progressText || 'Memproses...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" /> Kompres Semua ({items.length} Berkas)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item, idx) => {
              const savedItemPercent =
                item.compressedBlob
                  ? Math.max(0, Math.round(((item.file.size - item.compressedBlob.size) / item.file.size) * 100))
                  : 0

              return (
                <div
                  key={item.id}
                  className="relative flex flex-col justify-between rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 shadow-sm"
                >
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/60 p-1.5 text-white hover:bg-rose-600 transition-colors"
                    title="Hapus gambar ini"
                  >
                    <Trash2 className="size-3.5" />
                  </button>

                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate" title={item.file.name}>
                        {item.file.name}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Asli: {formatBytes(item.file.size)}</span>
                        {item.dimensions && (
                          <span>{item.dimensions.width}×{item.dimensions.height}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Compression Status / Result */}
                  <div className="mt-3 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                    {item.status === 'compressing' && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 py-1">
                        <Loader2 className="size-3.5 animate-spin" /> Sedang diproses...
                      </div>
                    )}

                    {item.status === 'done' && item.compressedBlob && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatBytes(item.compressedBlob.size)}
                          </span>
                          <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                            -{savedItemPercent}%
                          </span>
                        </div>
                        <a
                          href={item.compressedUrl}
                          download={`${item.file.name.replace(/\.[^.]+$/, '')}-kompres.${targetMime === 'image/webp' ? 'webp' : 'jpg'}`}
                          className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors"
                        >
                          <Download className="size-3.5" /> Unduh Berkas
                        </a>
                      </div>
                    )}

                    {item.status === 'error' && (
                      <p className="text-xs text-rose-600 font-semibold">{item.error || 'Gagal'}</p>
                    )}

                    {item.status === 'idle' && (
                      <p className="text-[11px] text-slate-400 italic py-1">Menunggu kompresi...</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900">
          <Zap className="size-5 text-emerald-600 mb-2" />
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">100% Cepat & Lokal</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Kompresi berjalan langsung di peramban Anda dengan Canvas API performa tinggi tanpa perlu antre di server.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900">
          <Sparkles className="size-5 text-emerald-600 mb-2" />
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Hasil Visual Jernih</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Algoritma kompresi pintar membuang data piksel redundan tanpa membuat gambar terlihat buram.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900">
          <Archive className="size-5 text-emerald-600 mb-2" />
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Ekspor Paket ZIP</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Unduh puluhan gambar hasil kompresi sekaligus dalam satu arsip ZIP rapi dengan satu klik.
          </p>
        </div>
      </div>
    </div>
  )
}
