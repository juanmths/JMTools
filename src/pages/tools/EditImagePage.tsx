import {
  Check,
  Download,
  ImageIcon,
  Loader2,
  Palette,
  RefreshCw,
  Sliders,
  Sparkles,
  Upload,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { formatBytes } from '../../lib/utils'

export default function EditImagePage() {
  const [file, setFile] = useState<File>()
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [imgElement, setImgElement] = useState<HTMLImageElement>()

  // Filter adjustments
  const [brightness, setBrightness] = useState<number>(100) // %
  const [contrast, setContrast] = useState<number>(100) // %
  const [saturation, setSaturation] = useState<number>(100) // %
  const [grayscale, setGrayscale] = useState<number>(0) // %
  const [sepia, setSepia] = useState<number>(0) // %
  const [blur, setBlur] = useState<number>(0) // px

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
    setResultBlob(undefined)
    setResultUrl(undefined)
    resetFilters()

    const url = URL.createObjectURL(f)
    setPreviewUrl(url)

    const img = new Image()
    img.onload = () => setImgElement(img)
    img.src = url
  }

  const resetFilters = () => {
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setGrayscale(0)
    setSepia(0)
    setBlur(0)
  }

  const applyPreset = (preset: 'normal' | 'bw' | 'vintage' | 'vivid' | 'dramatic') => {
    switch (preset) {
      case 'normal':
        resetFilters()
        break
      case 'bw':
        setBrightness(100)
        setContrast(120)
        setSaturation(0)
        setGrayscale(100)
        setSepia(0)
        setBlur(0)
        break
      case 'vintage':
        setBrightness(95)
        setContrast(110)
        setSaturation(80)
        setGrayscale(0)
        setSepia(75)
        setBlur(0)
        break
      case 'vivid':
        setBrightness(105)
        setContrast(115)
        setSaturation(140)
        setGrayscale(0)
        setSepia(0)
        setBlur(0)
        break
      case 'dramatic':
        setBrightness(90)
        setContrast(135)
        setSaturation(115)
        setGrayscale(0)
        setSepia(15)
        setBlur(0)
        break
    }
  }

  // Draw filtered image onto canvas
  useEffect(() => {
    if (!imgElement || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = imgElement.naturalWidth
    canvas.height = imgElement.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%) blur(${blur}px)`
    ctx.drawImage(imgElement, 0, 0)
    ctx.filter = 'none'
  }, [imgElement, brightness, contrast, saturation, grayscale, sepia, blur])

  const saveEditedPhoto = async () => {
    if (!canvasRef.current || !file) return
    setProcessing(true)
    setError(undefined)

    try {
      const canvas = canvasRef.current
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b)
            else reject(new Error('Gagal merender foto.'))
          },
          'image/jpeg',
          0.92,
        )
      })

      if (resultUrl) URL.revokeObjectURL(resultUrl)
      setResultBlob(blob)
      setResultUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan foto.')
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
    resetFilters()
    setError(undefined)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700 ring-1 ring-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:ring-pink-800">
          <Palette className="size-3.5" /> Editor Foto & Filter Artistik
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Edit Foto (Photo Editor & Filter)
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Sempurnakan foto Anda dengan efek pencahayaan, saturasi warna, filter monokrom, dan vintage langsung di peramban.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {!file ? (
        <Card className="p-8 sm:p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-pink-500 transition-colors">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400">
            <ImageIcon className="size-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            Pilih Berkas Foto untuk Diedit
          </h3>
          <p className="mt-1 text-sm text-slate-500">Mendukung format JPG, PNG, WEBP, dan GIF</p>

          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-pink-500 transition-all">
            <Upload className="size-4" /> Pilih Foto
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
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="size-4 text-pink-600" /> Filter & Penyesuaian
            </h3>

            {/* Presets */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Filter Instan:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'normal' as const, label: 'Normal' },
                  { id: 'vivid' as const, label: 'Vivid' },
                  { id: 'vintage' as const, label: 'Vintage' },
                  { id: 'bw' as const, label: 'B & W' },
                  { id: 'dramatic' as const, label: 'Dramatis' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-[11px] font-bold text-slate-700 hover:border-pink-500 hover:bg-pink-50 hover:text-pink-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Adjustment Sliders */}
            <div className="space-y-3 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Kecerahan (Brightness):</span>
                  <span className="text-pink-600 font-bold">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-pink-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Kontras (Contrast):</span>
                  <span className="text-pink-600 font-bold">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-pink-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Saturasi Warna:</span>
                  <span className="text-pink-600 font-bold">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-pink-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Efek Sepia (Nostalgia):</span>
                  <span className="text-pink-600 font-bold">{sepia}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sepia}
                  onChange={(e) => setSepia(Number(e.target.value))}
                  className="w-full accent-pink-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Kelembutan (Blur):</span>
                  <span className="text-pink-600 font-bold">{blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={blur}
                  onChange={(e) => setBlur(Number(e.target.value))}
                  className="w-full accent-pink-600"
                />
              </div>
            </div>

            <Button variant="secondary" size="md" className="w-full text-xs" onClick={resetFilters}>
              Reset Semua Filter
            </Button>

            <Button variant="ghost" size="md" className="w-full text-xs" onClick={resetAll}>
              <RefreshCw className="size-3.5" /> Ganti Gambar Lain
            </Button>
          </Card>

          {/* Canvas Live Preview */}
          <Card className="md:col-span-2 space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Pratinjau Hasil Edit</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Semua filter diaplikasikan secara langsung di peramban tanpa mengurangi resolusi gambar asli.
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
                className="w-full bg-pink-600 hover:bg-pink-500"
                onClick={saveEditedPhoto}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="size-5 animate-spin" /> Merender Foto...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-5" /> Simpan Hasil Edit
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4 rounded-2xl bg-pink-50/70 p-5 ring-1 ring-pink-200 dark:bg-pink-950/40 dark:ring-pink-800">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-pink-600 text-white">
                    <Check className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-pink-900 dark:text-pink-100">
                      Foto Berhasil Disimpan!
                    </h4>
                    <p className="text-xs text-pink-700 dark:text-pink-300">
                      Ukuran berkas hasil: <span className="font-extrabold">{formatBytes(resultBlob.size)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={resultUrl}
                    download={`${file.name.replace(/\.[^.]+$/, '')}-edit.jpg`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-pink-500 transition-all"
                  >
                    <Download className="size-4" /> Unduh Foto Hasil Edit
                  </a>
                  <Button variant="secondary" size="md" onClick={() => setResultBlob(undefined)}>
                    Lanjut Edit
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
