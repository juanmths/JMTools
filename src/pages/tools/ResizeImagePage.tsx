import {
  Check,
  Download,
  FileImage,
  ImageIcon,
  Loader2,
  Lock,
  Maximize2,
  RefreshCw,
  Scaling,
  Unlock,
  Upload,
} from 'lucide-react'
import { useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { consumeCredit } from '../../lib/authStore'
import { formatBytes } from '../../lib/utils'

export default function ResizeImagePage() {
  const [file, setFile] = useState<File>()
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>()
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const [lockRatio, setLockRatio] = useState<boolean>(true)
  const [aspectRatio, setAspectRatio] = useState<number>(1)
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string>()
  const [resultBlob, setResultBlob] = useState<Blob>()
  const [resultUrl, setResultUrl] = useState<string>()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setError('File harus berformat gambar.')
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)

    setError(undefined)
    setFile(f)
    setResultBlob(undefined)
    setResultUrl(undefined)

    const url = URL.createObjectURL(f)
    setPreviewUrl(url)

    const img = new Image()
    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      setOriginalDimensions({ width: w, height: h })
      setWidth(w)
      setHeight(h)
      setAspectRatio(w / h)
    }
    img.src = url
  }

  const handleWidthChange = (val: number) => {
    setWidth(val)
    if (lockRatio && aspectRatio > 0) {
      setHeight(Math.round(val / aspectRatio))
    }
  }

  const handleHeightChange = (val: number) => {
    setHeight(val)
    if (lockRatio && aspectRatio > 0) {
      setWidth(Math.round(val * aspectRatio))
    }
  }

  const handleScalePercent = (percent: number) => {
    if (!originalDimensions) return
    const w = Math.round((originalDimensions.width * percent) / 100)
    const h = Math.round((originalDimensions.height * percent) / 100)
    setWidth(w)
    setHeight(h)
  }

  const resize = async () => {
    if (!file || !previewUrl || width <= 0 || height <= 0) return
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
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas 2D tidak tersedia.')

      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b)
            else reject(new Error('Gagal mengubah ukuran gambar.'))
          },
          format,
          0.9,
        )
      })

      if (resultUrl) URL.revokeObjectURL(resultUrl)
      setResultBlob(blob)
      setResultUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses gambar.')
    } finally {
      setProcessing(false)
    }
  }

  const resetAll = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(undefined)
    setPreviewUrl(undefined)
    setOriginalDimensions(undefined)
    setResultBlob(undefined)
    setResultUrl(undefined)
    setError(undefined)
  }

  const getExt = () => {
    if (format === 'image/png') return '.png'
    if (format === 'image/webp') return '.webp'
    return '.jpg'
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-800">
          <Scaling className="size-3.5" /> Ubah Dimensi Gambar
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Ubah Ukuran Gambar (Resize IMAGE)
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Ubah lebar dan tinggi gambar dalam piksel atau persentase dengan tetap menjaga rasio aspek proporsional.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {!file ? (
        <Card className="p-8 sm:p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 transition-colors">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <ImageIcon className="size-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            Pilih Berkas Gambar untuk Diubah Ukuran
          </h3>
          <p className="mt-1 text-sm text-slate-500">Mendukung JPG, PNG, WEBP, GIF, dan SVG</p>

          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-500 transition-all">
            <Upload className="size-4" /> Pilih Gambar
            <input
              type="file"
              accept="image/*"
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
              <FileImage className="size-4 text-blue-600" /> Pratinjau Gambar
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
                <span>Ukuran file:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatBytes(file.size)}</span>
              </div>
              {originalDimensions && (
                <div className="flex justify-between">
                  <span>Dimensi asli:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {originalDimensions.width} × {originalDimensions.height} px
                  </span>
                </div>
              )}
            </div>

            <Button variant="ghost" size="md" className="w-full text-xs" onClick={resetAll}>
              <RefreshCw className="size-3.5" /> Ganti Gambar Lain
            </Button>
          </Card>

          {/* Controls Panel */}
          <Card className="md:col-span-2 space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Pengaturan Dimensi Baru</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ketik ukuran baru dalam piksel atau gunakan persentase skala cepat.
              </p>
            </div>

            {/* Skala Persentase Cepat */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Skala Cepat:
              </label>
              <div className="mt-1.5 grid grid-cols-4 gap-2">
                {[
                  { label: '25%', val: 25 },
                  { label: '50%', val: 50 },
                  { label: '75%', val: 75 },
                  { label: 'Asli (100%)', val: 100 },
                ].map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => handleScalePercent(s.val)}
                    className="rounded-xl border border-slate-200 bg-slate-50 py-2 text-center text-xs font-semibold text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Piksel Lebar & Tinggi */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Lebar (Width px):
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={width || ''}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tinggi (Height px):
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={height || ''}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Kunci Rasio Aspek */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60">
              <div className="flex items-center gap-2.5">
                {lockRatio ? (
                  <Lock className="size-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Unlock className="size-4 text-slate-400" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Kunci Rasio Aspek (Aspect Ratio)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Mencegah gambar menjadi gepeng atau melar saat salah satu sisi diubah.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={lockRatio}
                onChange={(e) => setLockRatio(e.target.checked)}
                className="size-4 accent-blue-600 rounded"
              />
            </div>

            {/* Format Hasil */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Format Simpan:
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'image/jpeg' as const, label: 'JPG' },
                  { id: 'image/png' as const, label: 'PNG' },
                  { id: 'image/webp' as const, label: 'WebP' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      format === f.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tombol Eksekusi */}
            {!resultBlob ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-500"
                onClick={resize}
                disabled={processing || width <= 0 || height <= 0}
              >
                {processing ? (
                  <>
                    <Loader2 className="size-5 animate-spin" /> Sedang Mengubah Ukuran...
                  </>
                ) : (
                  <>
                    <Maximize2 className="size-5" /> Ubah Ukuran Gambar Sekarang
                  </>
                )}
              </Button>
            ) : (
              /* Success View */
              <div className="space-y-4 rounded-2xl bg-blue-50/70 p-5 ring-1 ring-blue-200 dark:bg-blue-950/40 dark:ring-blue-800">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-blue-600 text-white">
                    <Check className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-blue-900 dark:text-blue-100">
                      Ukuran Gambar Berhasil Diubah!
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Dimensi baru: <span className="font-extrabold">{width} × {height} px</span> ({formatBytes(resultBlob.size)})
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={resultUrl}
                    download={`${file.name.replace(/\.[^.]+$/, '')}-${width}x${height}${getExt()}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-500 transition-all"
                  >
                    <Download className="size-4" /> Unduh Gambar ({width}×{height})
                  </a>
                  <Button variant="secondary" size="md" onClick={() => setResultBlob(undefined)}>
                    Ubah Ukuran Lagi
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
