import {
  Check,
  Download,
  ImageIcon,
  Loader2,
  RefreshCw,
  Stamp,
  Upload,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { formatBytes } from '../../lib/utils'

type Position = 'tl' | 'tc' | 'tr' | 'ml' | 'center' | 'mr' | 'bl' | 'bc' | 'br' | 'tile'

export default function WatermarkImagePage() {
  const [file, setFile] = useState<File>()
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [imgElement, setImgElement] = useState<HTMLImageElement>()

  // Watermark Settings
  const [text, setText] = useState('HAK CIPTA DILINDUNGI')
  const [fontSize, setFontSize] = useState<number>(36)
  const [opacity, setOpacity] = useState<number>(60)
  const [color, setColor] = useState<string>('#ffffff')
  const [position, setPosition] = useState<Position>('br')
  const [angle, setAngle] = useState<number>(0)

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

    const url = URL.createObjectURL(f)
    setPreviewUrl(url)

    const img = new Image()
    img.onload = () => setImgElement(img)
    img.src = url
  }

  // Draw Watermark on Canvas
  useEffect(() => {
    if (!imgElement || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = imgElement.naturalWidth
    canvas.height = imgElement.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw background original image
    ctx.drawImage(imgElement, 0, 0)

    if (!text.trim()) return

    ctx.save()
    ctx.globalAlpha = opacity / 100
    ctx.fillStyle = color
    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.textBaseline = 'middle'

    // Add subtle shadow for visibility on any background
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
    ctx.shadowBlur = 6
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    const metrics = ctx.measureText(text)
    const textWidth = metrics.width
    const padding = fontSize

    if (position === 'tile') {
      // Repeat across entire image
      const stepX = textWidth + fontSize * 2
      const stepY = fontSize * 3
      for (let x = 0; x < canvas.width + stepX; x += stepX) {
        for (let y = 0; y < canvas.height + stepY; y += stepY) {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate((-30 * Math.PI) / 180)
          ctx.fillText(text, 0, 0)
          ctx.restore()
        }
      }
    } else {
      let x = 0
      let y = 0

      switch (position) {
        case 'tl':
          x = padding
          y = padding + fontSize / 2
          ctx.textAlign = 'left'
          break
        case 'tc':
          x = canvas.width / 2
          y = padding + fontSize / 2
          ctx.textAlign = 'center'
          break
        case 'tr':
          x = canvas.width - padding
          y = padding + fontSize / 2
          ctx.textAlign = 'right'
          break
        case 'ml':
          x = padding
          y = canvas.height / 2
          ctx.textAlign = 'left'
          break
        case 'center':
          x = canvas.width / 2
          y = canvas.height / 2
          ctx.textAlign = 'center'
          break
        case 'mr':
          x = canvas.width - padding
          y = canvas.height / 2
          ctx.textAlign = 'right'
          break
        case 'bl':
          x = padding
          y = canvas.height - padding - fontSize / 2
          ctx.textAlign = 'left'
          break
        case 'bc':
          x = canvas.width / 2
          y = canvas.height - padding - fontSize / 2
          ctx.textAlign = 'center'
          break
        case 'br':
          x = canvas.width - padding
          y = canvas.height - padding - fontSize / 2
          ctx.textAlign = 'right'
          break
      }

      ctx.save()
      ctx.translate(x, y)
      if (angle !== 0) ctx.rotate((angle * Math.PI) / 180)
      ctx.fillText(text, 0, 0)
      ctx.restore()
    }

    ctx.restore()
  }, [imgElement, text, fontSize, opacity, color, position, angle])

  const stampWatermark = async () => {
    if (!canvasRef.current || !file) return
    setProcessing(true)
    setError(undefined)

    try {
      const canvas = canvasRef.current
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b)
            else reject(new Error('Gagal memproses gambar ber-watermark.'))
          },
          'image/jpeg',
          0.92,
        )
      })

      if (resultUrl) URL.revokeObjectURL(resultUrl)
      setResultBlob(blob)
      setResultUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses watermark.')
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
        <div className="inline-flex items-center gap-2 rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700 ring-1 ring-fuchsia-200 dark:bg-fuchsia-950/60 dark:text-fuchsia-300 dark:ring-fuchsia-800">
          <Stamp className="size-3.5" /> Lindungi Hak Cipta Gambar
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Tambah Watermark Gambar (Watermark IMAGE)
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Tambahkan teks tanda air, nama brand, atau hak cipta transparan di atas foto Anda dengan mudah.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {!file ? (
        <Card className="p-8 sm:p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-fuchsia-500 transition-colors">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950 dark:text-fuchsia-400">
            <ImageIcon className="size-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            Pilih Berkas Gambar untuk Diberi Watermark
          </h3>
          <p className="mt-1 text-sm text-slate-500">Mendukung format JPG, PNG, WEBP, dan GIF</p>

          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-fuchsia-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-fuchsia-500 transition-all">
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
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Stamp className="size-4 text-fuchsia-600" /> Teks & Gaya Watermark
            </h3>

            {/* Teks Watermark */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Teks Watermark:
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Mis. @namatokomu / Dilarang Kopi"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:border-fuchsia-500 focus:outline-none"
              />
            </div>

            {/* Warna & Sudut */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Warna Teks:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="size-8 rounded-lg cursor-pointer border-0"
                  />
                  <span className="text-xs font-mono">{color}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Kemiringan:</label>
                <select
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value={0}>Lurus (0°)</option>
                  <option value={-30}>Diagonal (-30°)</option>
                  <option value={-45}>Miring (-45°)</option>
                  <option value={30}>Miring (+30°)</option>
                </select>
              </div>
            </div>

            {/* Opasitas Slider */}
            <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 text-xs">
              <div className="flex justify-between font-semibold">
                <span>Transparansi (Opasitas):</span>
                <span className="text-fuchsia-600 font-bold">{opacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full accent-fuchsia-600"
              />
            </div>

            {/* Ukuran Font Slider */}
            <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 text-xs">
              <div className="flex justify-between font-semibold">
                <span>Ukuran Font:</span>
                <span className="text-fuchsia-600 font-bold">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="96"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-fuchsia-600"
              />
            </div>

            {/* Posisi 9-Grid */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Posisi Tanda Air:
              </label>
              <div className="grid grid-cols-3 gap-1.5 max-w-[150px] mx-auto">
                {(['tl', 'tc', 'tr', 'ml', 'center', 'mr', 'bl', 'bc', 'br'] as Position[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPosition(p)}
                    className={`size-10 rounded-lg text-xs font-bold transition-all ${
                      position === p
                        ? 'bg-fuchsia-600 text-white shadow-sm ring-2 ring-fuchsia-400'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    •
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPosition('tile')}
                className={`w-full mt-2 rounded-xl py-1.5 text-xs font-semibold transition-all ${
                  position === 'tile'
                    ? 'bg-fuchsia-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Pola Penuh (Repeated Tile)
              </button>
            </div>

            <Button variant="ghost" size="md" className="w-full text-xs" onClick={resetAll}>
              <RefreshCw className="size-3.5" /> Ganti Gambar Lain
            </Button>
          </Card>

          {/* Live Preview Canvas */}
          <Card className="md:col-span-2 space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Pratinjau Watermark</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pratinjau langsung bagaimana watermark akan muncul di berkas asli.
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
                className="w-full bg-fuchsia-600 hover:bg-fuchsia-500"
                onClick={stampWatermark}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="size-5 animate-spin" /> Membubuhkan Watermark...
                  </>
                ) : (
                  <>
                    <Stamp className="size-5" /> Terapkan Watermark Sekarang
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4 rounded-2xl bg-fuchsia-50/70 p-5 ring-1 ring-fuchsia-200 dark:bg-fuchsia-950/40 dark:ring-fuchsia-800">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-fuchsia-600 text-white">
                    <Check className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-fuchsia-900 dark:text-fuchsia-100">
                      Watermark Berhasil Diterapkan!
                    </h4>
                    <p className="text-xs text-fuchsia-700 dark:text-fuchsia-300">
                      Ukuran berkas hasil: <span className="font-extrabold">{formatBytes(resultBlob.size)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={resultUrl}
                    download={`${file.name.replace(/\.[^.]+$/, '')}-watermark.jpg`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-fuchsia-500 transition-all"
                  >
                    <Download className="size-4" /> Unduh Gambar Ber-Watermark
                  </a>
                  <Button variant="secondary" size="md" onClick={() => setResultBlob(undefined)}>
                    Edit Lagi
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
