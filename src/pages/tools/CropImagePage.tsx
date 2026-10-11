import {
  Check,
  Crop,
  Download,
  ImageIcon,
  Loader2,
  RefreshCw,
  Upload,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { formatBytes } from '../../lib/utils'

type AspectPreset = 'free' | '1:1' | '16:9' | '4:3' | '9:16'

export default function CropImagePage() {
  const [file, setFile] = useState<File>()
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [imgElement, setImgElement] = useState<HTMLImageElement>()
  const [preset, setPreset] = useState<AspectPreset>('free')

  // Crop box parameters in percentages (0 to 100)
  const [cropX, setCropX] = useState<number>(10)
  const [cropY, setCropY] = useState<number>(10)
  const [cropW, setCropW] = useState<number>(80)
  const [cropH, setCropH] = useState<number>(80)

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string>()
  const [resultBlob, setResultBlob] = useState<Blob>()
  const [resultUrl, setResultUrl] = useState<string>()

  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

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
      setImgElement(img)
      setCropX(10)
      setCropY(10)
      setCropW(80)
      setCropH(80)
    }
    img.src = url
  }

  // Adjust crop dimensions when preset changes
  useEffect(() => {
    if (!imgElement) return
    const imgRatio = imgElement.naturalWidth / imgElement.naturalHeight

    if (preset === '1:1') {
      if (imgRatio >= 1) {
        // wider than tall
        const h = 80
        const w = (h / imgRatio)
        setCropW(Math.min(100, Math.round(w)))
        setCropH(h)
      } else {
        const w = 80
        const h = (w * imgRatio)
        setCropW(w)
        setCropH(Math.min(100, Math.round(h)))
      }
      setCropX(10)
      setCropY(10)
    } else if (preset === '16:9') {
      const targetRatio = 16 / 9
      const w = 80
      const h = (w / targetRatio) * imgRatio
      setCropW(w)
      setCropH(Math.min(90, Math.round(h)))
      setCropX(10)
      setCropY(10)
    } else if (preset === '4:3') {
      const targetRatio = 4 / 3
      const w = 80
      const h = (w / targetRatio) * imgRatio
      setCropW(w)
      setCropH(Math.min(90, Math.round(h)))
      setCropX(10)
      setCropY(10)
    } else if (preset === '9:16') {
      const targetRatio = 9 / 16
      const h = 80
      const w = (h * targetRatio) / imgRatio
      setCropW(Math.min(90, Math.max(20, Math.round(w))))
      setCropH(h)
      setCropX(10)
      setCropY(10)
    }
  }, [preset, imgElement])

  // Live Canvas Preview of Cropped Result
  useEffect(() => {
    if (!imgElement || !previewCanvasRef.current) return
    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const realX = (cropX / 100) * imgElement.naturalWidth
    const realY = (cropY / 100) * imgElement.naturalHeight
    const realW = (cropW / 100) * imgElement.naturalWidth
    const realH = (cropH / 100) * imgElement.naturalHeight

    if (realW <= 0 || realH <= 0) return

    canvas.width = Math.max(1, Math.round(realW))
    canvas.height = Math.max(1, Math.round(realH))

    ctx.drawImage(imgElement, realX, realY, realW, realH, 0, 0, canvas.width, canvas.height)
  }, [imgElement, cropX, cropY, cropW, cropH])

  const executeCrop = async () => {
    if (!imgElement || !file) return
    setProcessing(true)
    setError(undefined)

    try {
      const realX = (cropX / 100) * imgElement.naturalWidth
      const realY = (cropY / 100) * imgElement.naturalHeight
      const realW = (cropW / 100) * imgElement.naturalWidth
      const realH = (cropH / 100) * imgElement.naturalHeight

      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(realW))
      canvas.height = Math.max(1, Math.round(realH))
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas 2D gagal diinisialisasi.')

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(imgElement, realX, realY, realW, realH, 0, 0, canvas.width, canvas.height)

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b)
            else reject(new Error('Gagal memotong gambar.'))
          },
          'image/jpeg',
          0.92,
        )
      })

      if (resultUrl) URL.revokeObjectURL(resultUrl)
      setResultBlob(blob)
      setResultUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memotong gambar.')
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
    setResultBlob(undefined)
    setResultUrl(undefined)
    setError(undefined)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:ring-violet-800">
          <Crop className="size-3.5" /> Potong Gambar Presisi
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Potong Gambar (Crop IMAGE)
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Pangkas area tertentu pada foto Anda dengan pilihan rasio persegi (1:1), 16:9, story (9:16), atau bebas.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {!file ? (
        <Card className="p-8 sm:p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-500 transition-colors">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
            <ImageIcon className="size-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            Pilih Berkas Gambar untuk Dipotong
          </h3>
          <p className="mt-1 text-sm text-slate-500">Mendukung format JPG, PNG, WEBP, dan GIF</p>

          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-violet-500 transition-all">
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
          <Card className="md:col-span-1 space-y-5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Crop className="size-4 text-violet-600" /> Pilihan Rasio Aspek
            </h3>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'free' as const, label: 'Bebas' },
                { id: '1:1' as const, label: '1:1 (Persegi)' },
                { id: '16:9' as const, label: '16:9 (Layar)' },
                { id: '4:3' as const, label: '4:3 (Standar)' },
                { id: '9:16' as const, label: '9:16 (Story)' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreset(p.id)}
                  className={`rounded-xl py-2 px-3 text-xs font-semibold transition-all ${
                    preset === p.id
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Sliders for Position and Size */}
            <div className="space-y-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Lebar Area Potong:</span>
                  <span className="text-violet-600 font-bold">{cropW}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={cropW}
                  onChange={(e) => setCropW(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Tinggi Area Potong:</span>
                  <span className="text-violet-600 font-bold">{cropH}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={cropH}
                  onChange={(e) => setCropH(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Posisi Horizontal (X):</span>
                  <span className="text-violet-600 font-bold">{cropX}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, 100 - cropW)}
                  value={cropX}
                  onChange={(e) => setCropX(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Posisi Vertikal (Y):</span>
                  <span className="text-violet-600 font-bold">{cropY}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, 100 - cropH)}
                  value={cropY}
                  onChange={(e) => setCropY(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>
            </div>

            <Button variant="ghost" size="md" className="w-full text-xs" onClick={resetAll}>
              <RefreshCw className="size-3.5" /> Ganti Gambar Lain
            </Button>
          </Card>

          {/* Interactive Preview Canvas */}
          <Card className="md:col-span-2 space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Pratinjau Hasil Potongan</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Area yang terlihat di bawah ini adalah hasil potongan akhir yang akan disimpan.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl bg-slate-950/5 p-4 text-center dark:bg-slate-950/40">
              <canvas
                ref={previewCanvasRef}
                className="mx-auto max-h-80 w-auto rounded-xl object-contain shadow-lg ring-1 ring-slate-200 dark:ring-slate-800"
              />
            </div>

            {!resultBlob ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-violet-600 hover:bg-violet-500"
                onClick={executeCrop}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="size-5 animate-spin" /> Memproses Potongan...
                  </>
                ) : (
                  <>
                    <Crop className="size-5" /> Potong & Siapkan Berkas
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4 rounded-2xl bg-violet-50/70 p-5 ring-1 ring-violet-200 dark:bg-violet-950/40 dark:ring-violet-800">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-violet-600 text-white">
                    <Check className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-violet-900 dark:text-violet-100">
                      Gambar Berhasil Dipotong!
                    </h4>
                    <p className="text-xs text-violet-700 dark:text-violet-300">
                      Ukuran berkas hasil: <span className="font-extrabold">{formatBytes(resultBlob.size)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={resultUrl}
                    download={`${file.name.replace(/\.[^.]+$/, '')}-potong.jpg`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-violet-500 transition-all"
                  >
                    <Download className="size-4" /> Unduh Gambar Hasil Potongan
                  </a>
                  <Button variant="secondary" size="md" onClick={() => setResultBlob(undefined)}>
                    Sesuaikan Lagi
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
