import {
  Check,
  Download,
  FlipHorizontal,
  FlipVertical,
  ImageIcon,
  Loader2,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Upload,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { formatBytes } from '../../lib/utils'

export default function RotateImagePage() {
  const [file, setFile] = useState<File>()
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [imgElement, setImgElement] = useState<HTMLImageElement>()

  // Transform states
  const [rotation, setRotation] = useState<number>(0) // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false)
  const [flipV, setFlipV] = useState<boolean>(false)

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string>()
  const [resultBlob, setResultBlob] = useState<Blob>()
  const [resultUrl, setResultUrl] = useState<string>()

  const canvasRef = useRef<HTMLCanvasElement>(null)

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
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setResultBlob(undefined)
    setResultUrl(undefined)

    const url = URL.createObjectURL(f)
    setPreviewUrl(url)

    const img = new Image()
    img.onload = () => setImgElement(img)
    img.src = url
  }

  // Draw rotated/flipped image to canvas
  useEffect(() => {
    if (!imgElement || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isPerpendicular = rotation === 90 || rotation === 270
    canvas.width = isPerpendicular ? imgElement.naturalHeight : imgElement.naturalWidth
    canvas.height = isPerpendicular ? imgElement.naturalWidth : imgElement.naturalHeight

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    ctx.drawImage(
      imgElement,
      -imgElement.naturalWidth / 2,
      -imgElement.naturalHeight / 2,
      imgElement.naturalWidth,
      imgElement.naturalHeight,
    )
    ctx.restore()
  }, [imgElement, rotation, flipH, flipV])

  const rotateCw = () => setRotation((r) => (r + 90) % 360)
  const rotateCcw = () => setRotation((r) => (r + 270) % 360)
  const toggleFlipH = () => setFlipH((h) => !h)
  const toggleFlipV = () => setFlipV((v) => !v)

  const saveRotatedImage = async () => {
    if (!canvasRef.current || !file) return
    setProcessing(true)
    setError(undefined)

    try {
      const canvas = canvasRef.current
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b)
            else reject(new Error('Gagal merender gambar.'))
          },
          'image/jpeg',
          0.92,
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
    setImgElement(undefined)
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setResultBlob(undefined)
    setResultUrl(undefined)
    setError(undefined)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800">
          <RotateCw className="size-3.5" /> Putar & Balik Posisi Foto
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Putar Gambar (Rotate IMAGE)
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Putar orientasi foto 90°, 180°, 270°, atau balik cermin horizontal dan vertikal secara instan.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {!file ? (
        <Card className="p-8 sm:p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 transition-colors">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <ImageIcon className="size-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            Pilih Berkas Gambar untuk Diputar
          </h3>
          <p className="mt-1 text-sm text-slate-500">Mendukung format JPG, PNG, WEBP, dan GIF</p>

          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-amber-500 transition-all">
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
          {/* Controls Panel */}
          <Card className="md:col-span-1 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Kontrol Rotasi & Cermin</h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={rotateCw}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2">
                  <RotateCw className="size-4 text-amber-600" /> Putar Kanan (+90°)
                </span>
                <span className="text-slate-400">90°</span>
              </button>

              <button
                type="button"
                onClick={rotateCcw}
                className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="size-4 text-amber-600" /> Putar Kiri (-90°)
                </span>
                <span className="text-slate-400">270°</span>
              </button>

              <button
                type="button"
                onClick={toggleFlipH}
                className={`w-full flex items-center justify-between rounded-xl border p-3 text-xs font-bold transition-all ${
                  flipH
                    ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FlipHorizontal className="size-4 text-amber-600" /> Balik Horizontal
                </span>
                <span className="text-slate-400">{flipH ? 'Aktif' : 'Normal'}</span>
              </button>

              <button
                type="button"
                onClick={toggleFlipV}
                className={`w-full flex items-center justify-between rounded-xl border p-3 text-xs font-bold transition-all ${
                  flipV
                    ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FlipVertical className="size-4 text-amber-600" /> Balik Vertikal
                </span>
                <span className="text-slate-400">{flipV ? 'Aktif' : 'Normal'}</span>
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/60 space-y-1">
              <div className="flex justify-between">
                <span>Rotasi saat ini:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{rotation}°</span>
              </div>
              <div className="flex justify-between">
                <span>Ukuran asli:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatBytes(file.size)}</span>
              </div>
            </div>

            <Button variant="ghost" size="md" className="w-full text-xs" onClick={resetAll}>
              <RefreshCw className="size-3.5" /> Ganti Gambar Lain
            </Button>
          </Card>

          {/* Canvas Live Preview */}
          <Card className="md:col-span-2 space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Pratinjau Orientasi</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pratinjau real-time hasil rotasi dan pembalikan posisi gambar.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl bg-slate-950/5 p-4 text-center dark:bg-slate-950/40">
              <canvas
                ref={canvasRef}
                className="mx-auto max-h-80 w-auto rounded-xl object-contain shadow-lg ring-1 ring-slate-200 dark:ring-slate-800"
              />
            </div>

            {!resultBlob ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-amber-600 hover:bg-amber-500"
                onClick={saveRotatedImage}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="size-5 animate-spin" /> Memproses Gambar...
                  </>
                ) : (
                  <>
                    <RotateCw className="size-5" /> Simpan Posisi Baru
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4 rounded-2xl bg-amber-50/70 p-5 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:ring-amber-800">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-amber-600 text-white">
                    <Check className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-amber-900 dark:text-amber-100">
                      Posisi Gambar Berhasil Disimpan!
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Rotasi {rotation}° telah diaplikasikan ke berkas Anda.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={resultUrl}
                    download={`${file.name.replace(/\.[^.]+$/, '')}-rotasi.jpg`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-amber-500 transition-all"
                  >
                    <Download className="size-4" /> Unduh Gambar Hasil Rotasi
                  </a>
                  <Button variant="secondary" size="md" onClick={() => setResultBlob(undefined)}>
                    Putar Lagi
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
