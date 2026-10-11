import {
  ArrowDown,
  Check,
  Download,
  FileImage,
  ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { consumeCredit } from '../../lib/authStore'
import { formatBytes } from '../../lib/utils'

export default function CompressImagePage() {
  const [file, setFile] = useState<File>()
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>()
  const [quality, setQuality] = useState<number>(75)
  const [targetMime, setTargetMime] = useState<string>('image/jpeg')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string>()
  const [compressedBlob, setCompressedBlob] = useState<Blob>()
  const [compressedUrl, setCompressedUrl] = useState<string>()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setError('File harus berformat gambar (JPG, PNG, WebP, dll).')
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (compressedUrl) URL.revokeObjectURL(compressedUrl)

    setError(undefined)
    setFile(f)
    setCompressedBlob(undefined)
    setCompressedUrl(undefined)

    const url = URL.createObjectURL(f)
    setPreviewUrl(url)

    // Deteksi target format default (PNG -> WebP atau JPG agar bisa dikompres)
    if (f.type === 'image/png') {
      setTargetMime('image/webp')
    } else {
      setTargetMime(f.type === 'image/webp' ? 'image/webp' : 'image/jpeg')
    }

    const img = new Image()
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.src = url
  }

  const compress = async () => {
    if (!file || !previewUrl) return
    const { allowed } = consumeCredit()
    if (!allowed) return

    setProcessing(true)
    setError(undefined)

    try {
      const img = new Image()
      img.src = previewUrl
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

      if (compressedUrl) URL.revokeObjectURL(compressedUrl)
      setCompressedBlob(blob)
      setCompressedUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengompres gambar.')
    } finally {
      setProcessing(false)
    }
  }

  const resetAll = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (compressedUrl) URL.revokeObjectURL(compressedUrl)
    setFile(undefined)
    setPreviewUrl(undefined)
    setDimensions(undefined)
    setCompressedBlob(undefined)
    setCompressedUrl(undefined)
    setError(undefined)
  }

  const savedPercent =
    file && compressedBlob
      ? Math.max(0, Math.round(((file.size - compressedBlob.size) / file.size) * 100))
      : 0

  const getTargetExt = () => {
    if (targetMime === 'image/webp') return '.webp'
    if (targetMime === 'image/png') return '.png'
    return '.jpg'
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800">
          <Zap className="size-3.5" /> Kompres Gambar Online Cepat
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Kompres Gambar (JPG, PNG, WebP)
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Perkecil ukuran file gambar Anda hingga 85% dengan tetap menjaga ketajaman visual terbaik.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {!file ? (
        <Card className="p-8 sm:p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 transition-colors">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <ImageIcon className="size-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            Pilih atau Tarik Berkas Gambar ke Sini
          </h3>
          <p className="mt-1 text-sm text-slate-500">Mendukung format JPG, JPEG, PNG, dan WebP hingga 50 MB</p>

          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all">
            <Upload className="size-4" /> Pilih Gambar
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="sr-only"
              onChange={handleFile}
            />
          </label>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Preview Panel */}
          <Card className="md:col-span-1 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileImage className="size-4 text-emerald-600" /> Pratinjau Gambar
            </h3>

            {previewUrl && (
              <div className="overflow-hidden rounded-xl bg-slate-100 p-2 text-center dark:bg-slate-800">
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="mx-auto max-h-56 w-auto rounded-lg object-contain"
                />
              </div>
            )}

            <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-3">
              <div className="flex justify-between">
                <span>Nama berkas:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                  {file.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ukuran asli:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatBytes(file.size)}</span>
              </div>
              {dimensions && (
                <div className="flex justify-between">
                  <span>Resolusi:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {dimensions.width} × {dimensions.height} px
                  </span>
                </div>
              )}
            </div>

            <Button variant="ghost" size="md" className="w-full text-xs" onClick={resetAll}>
              <RefreshCw className="size-3.5" /> Ganti Gambar Lain
            </Button>
          </Card>

          {/* Controls & Result Panel */}
          <Card className="md:col-span-2 space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Pengaturan Tingkat Kompresi</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sesuaikan rasio kompresi untuk mendapatkan ukuran file yang Anda inginkan.
              </p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Maksimal', val: 50, desc: 'Ukuran terkecil' },
                { label: 'Direkomendasikan', val: 75, desc: 'Kualitas terbaik' },
                { label: 'Ringan', val: 90, desc: 'Kualitas tinggi' },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setQuality(p.val)}
                  className={`rounded-xl p-3 text-left border transition-all ${
                    quality === p.val
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="font-bold text-xs">{p.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{p.desc} ({p.val}%)</p>
                </button>
              ))}
            </div>

            {/* Custom Slider */}
            <div className="space-y-2 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Kualitas Kompresi:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                step="5"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Lebih Kecil (Kualitas Rendah)</span>
                <span>Visual Tajam (Ukuran Lebih Besar)</span>
              </div>
            </div>

            {/* Target Output Format */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Format Hasil Kompresi:
              </label>
              <div className="flex gap-2">
                {[
                  { mime: 'image/jpeg', label: 'JPG' },
                  { mime: 'image/webp', label: 'WebP (Sangat Ringan)' },
                ].map((fmt) => (
                  <button
                    key={fmt.mime}
                    type="button"
                    onClick={() => setTargetMime(fmt.mime)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      targetMime === fmt.mime
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Compression Action Button */}
            {!compressedBlob ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-500"
                onClick={compress}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="size-5 animate-spin" /> Sedang Mengompres Gambar...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-5" /> Kompres Gambar Sekarang
                  </>
                )}
              </Button>
            ) : (
              /* Success / Result View */
              <div className="space-y-4 rounded-2xl bg-emerald-50/70 p-5 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:ring-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white">
                    <Check className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-100">
                      Gambar Berhasil Dikompres!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Ukuran berkas berkurang sebesar{' '}
                      <span className="font-extrabold">{savedPercent}%</span>!
                    </p>
                  </div>
                </div>

                {/* Size Comparison Card */}
                <div className="grid grid-cols-2 gap-3 rounded-xl bg-white p-3 ring-1 ring-emerald-100 dark:bg-slate-900 dark:ring-slate-800">
                  <div className="text-center border-r border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Sebelum</p>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold">
                      Sesudah ({savedPercent > 0 ? `-${savedPercent}%` : 'Sama'})
                    </p>
                    <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatBytes(compressedBlob.size)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={compressedUrl}
                    download={`${file.name.replace(/\.[^.]+$/, '')}-kompres${getTargetExt()}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-500 transition-all"
                  >
                    <Download className="size-4" /> Unduh Gambar ({formatBytes(compressedBlob.size)})
                  </a>
                  <Button variant="secondary" size="md" onClick={() => setCompressedBlob(undefined)}>
                    Sesuaikan Lagi
                  </Button>
                </div>
              </div>
            )}
          </Card>
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
          <ArrowDown className="size-5 text-emerald-600 mb-2" />
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Hemat Kuota & Penyimpanan</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Sangat cocok untuk upload foto formulir CPNS, website toko online, email, atau sosial media.
          </p>
        </div>
      </div>
    </div>
  )
}
