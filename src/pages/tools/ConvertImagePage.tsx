import {
  ArrowRight,
  Check,
  Download,
  FileImage,
  ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
} from 'lucide-react'
import { useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { formatBytes } from '../../lib/utils'

type FormatTarget = 'image/jpeg' | 'image/png' | 'image/webp'

export default function ConvertImagePage() {
  const [file, setFile] = useState<File>()
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [targetFormat, setTargetFormat] = useState<FormatTarget>('image/jpeg')
  const [bgColor, setBgColor] = useState<string>('#ffffff')
  const [quality, setQuality] = useState<number>(85)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string>()
  const [resultBlob, setResultBlob] = useState<Blob>()
  const [resultUrl, setResultUrl] = useState<string>()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setError('File harus berformat gambar (PNG, JPG, WebP, GIF, dll).')
      return
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)

    setError(undefined)
    setFile(f)
    setResultBlob(undefined)
    setResultUrl(undefined)

    // Suggest default target opposite of current
    if (f.type === 'image/jpeg') {
      setTargetFormat('image/png')
    } else {
      setTargetFormat('image/jpeg')
    }

    const url = URL.createObjectURL(f)
    setPreviewUrl(url)
  }

  const convertImage = async () => {
    if (!file || !previewUrl) return
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

      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b)
            else reject(new Error('Gagal mengonversi format gambar.'))
          },
          targetFormat,
          targetFormat === 'image/png' ? undefined : quality / 100,
        )
      })

      if (resultUrl) URL.revokeObjectURL(resultUrl)
      setResultBlob(blob)
      setResultUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat konversi gambar.')
    } finally {
      setProcessing(false)
    }
  }

  const resetAll = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(undefined)
    setPreviewUrl(undefined)
    setResultBlob(undefined)
    setResultUrl(undefined)
    setError(undefined)
  }

  const getTargetExt = () => {
    if (targetFormat === 'image/jpeg') return '.jpg'
    if (targetFormat === 'image/png') return '.png'
    return '.webp'
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:ring-cyan-800">
          <Sparkles className="size-3.5" /> Konversi Format Gambar Cepat
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Konversi Format Gambar (Convert IMAGE)
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Ubah format gambar antara JPG, PNG, dan WebP secara instan tanpa kehilangan kualitas grafis.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {!file ? (
        <Card className="p-8 sm:p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 transition-colors">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400">
            <ImageIcon className="size-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            Pilih Berkas Gambar untuk Dikonversi
          </h3>
          <p className="mt-1 text-sm text-slate-500">Mendukung format PNG, JPG, JPEG, WebP, GIF, dan SVG</p>

          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-cyan-500 transition-all">
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
          {/* File Card */}
          <Card className="md:col-span-1 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FileImage className="size-4 text-cyan-600" /> Informasi Berkas Asli
            </h3>

            {previewUrl && (
              <div className="overflow-hidden rounded-xl bg-slate-100 p-2 text-center dark:bg-slate-800">
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="mx-auto max-h-52 w-auto rounded-lg object-contain"
                />
              </div>
            )}

            <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-3">
              <div className="flex justify-between">
                <span>Nama berkas:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                  {file.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Format asli:</span>
                <span className="font-semibold uppercase text-cyan-600 dark:text-cyan-400">{file.type.split('/')[1] || 'IMAGE'}</span>
              </div>
              <div className="flex justify-between">
                <span>Ukuran:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatBytes(file.size)}</span>
              </div>
            </div>

            <Button variant="ghost" size="md" className="w-full text-xs" onClick={resetAll}>
              <RefreshCw className="size-3.5" /> Ganti Gambar Lain
            </Button>
          </Card>

          {/* Settings Card */}
          <Card className="md:col-span-2 space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Pilih Format Tujuan</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih format yang Anda inginkan untuk menyimpan gambar ini.
              </p>
            </div>

            {/* Target Format Radio */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: 'image/jpeg' as const,
                  label: 'Ke JPG',
                  desc: 'Paling umum, ukuran efisien',
                  tag: '.jpg',
                },
                {
                  id: 'image/png' as const,
                  label: 'Ke PNG',
                  desc: 'Mendukung transparan (lossless)',
                  tag: '.png',
                },
                {
                  id: 'image/webp' as const,
                  label: 'Ke WebP',
                  desc: 'Format modern sangat ringan',
                  tag: '.webp',
                },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setTargetFormat(fmt.id)}
                  className={`rounded-2xl p-4 text-left border transition-all ${
                    targetFormat === fmt.id
                      ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-900 dark:text-cyan-200 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="inline-block rounded-md bg-cyan-100 dark:bg-cyan-900/60 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:text-cyan-300">
                    {fmt.tag}
                  </span>
                  <p className="font-bold text-sm mt-2">{fmt.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{fmt.desc}</p>
                </button>
              ))}
            </div>

            {/* Target Options */}
            {targetFormat === 'image/jpeg' && (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 text-xs">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Warna Latar Transparan:</p>
                  <p className="text-[11px] text-slate-500">
                    Karena JPG tidak mendukung transparansi, bagian transparan akan diisi warna ini.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="size-8 rounded-lg cursor-pointer border-0"
                  />
                  <span className="font-mono">{bgColor}</span>
                </div>
              </div>
            )}

            {targetFormat !== 'image/png' && (
              <div className="space-y-1.5 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 text-xs">
                <div className="flex justify-between font-semibold">
                  <span>Kualitas Gambar:</span>
                  <span className="text-cyan-600 font-bold">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-cyan-600"
                />
              </div>
            )}

            {!resultBlob ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
                onClick={convertImage}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="size-5 animate-spin" /> Sedang Mengonversi...
                  </>
                ) : (
                  <>
                    <ArrowRight className="size-5" /> Konversi Sekarang
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4 rounded-2xl bg-cyan-50/70 p-5 ring-1 ring-cyan-200 dark:bg-cyan-950/40 dark:ring-cyan-800">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-cyan-600 text-white">
                    <Check className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-cyan-900 dark:text-cyan-100">
                      Gambar Berhasil Dikonversi ke {getTargetExt().toUpperCase().replace('.', '')}!
                    </h4>
                    <p className="text-xs text-cyan-700 dark:text-cyan-300">
                      Ukuran berkas hasil: <span className="font-extrabold">{formatBytes(resultBlob.size)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={resultUrl}
                    download={`${file.name.replace(/\.[^.]+$/, '')}-jmtools${getTargetExt()}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-cyan-500 transition-all"
                  >
                    <Download className="size-4" /> Unduh Gambar ({getTargetExt().toUpperCase()})
                  </a>
                  <Button variant="secondary" size="md" onClick={() => setResultBlob(undefined)}>
                    Konversi Lain
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
