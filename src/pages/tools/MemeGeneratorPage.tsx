import {
  Check,
  Download,
  ImageIcon,
  Loader2,
  RefreshCw,
  Smile,
  Sparkles,
  Upload,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { formatBytes } from '../../lib/utils'

export default function MemeGeneratorPage() {
  const [file, setFile] = useState<File>()
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [imgElement, setImgElement] = useState<HTMLImageElement>()

  // Meme texts
  const [topText, setTopText] = useState('KETIKA PROYEK SELESAI')
  const [bottomText, setBottomText] = useState('TAPI CLIENT MINTA REVISI')
  const [fontSize, setFontSize] = useState<number>(42)

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
    img.onload = () => {
      setImgElement(img)
      // Auto adjust font size proportional to image width
      const initialSize = Math.max(28, Math.round(img.naturalWidth / 14))
      setFontSize(Math.min(72, initialSize))
    }
    img.src = url
  }

  // Draw meme on canvas
  useEffect(() => {
    if (!imgElement || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = imgElement.naturalWidth
    canvas.height = imgElement.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(imgElement, 0, 0)

    const drawMemeText = (txt: string, yPos: number, baseline: CanvasTextBaseline) => {
      if (!txt.trim()) return
      ctx.save()
      ctx.font = `900 ${fontSize}px Impact, "Arial Black", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = baseline
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = Math.max(3, fontSize / 9)
      ctx.lineJoin = 'round'

      const x = canvas.width / 2
      const uppercase = txt.toUpperCase()

      ctx.strokeText(uppercase, x, yPos)
      ctx.fillText(uppercase, x, yPos)
      ctx.restore()
    }

    const padding = fontSize * 0.7
    // Top text
    drawMemeText(topText, padding, 'top')
    // Bottom text
    drawMemeText(bottomText, canvas.height - padding, 'bottom')
  }, [imgElement, topText, bottomText, fontSize])

  const saveMeme = async () => {
    if (!canvasRef.current || !file) return
    setProcessing(true)
    setError(undefined)

    try {
      const canvas = canvasRef.current
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b)
            else reject(new Error('Gagal merender meme.'))
          },
          'image/jpeg',
          0.92,
        )
      })

      if (resultUrl) URL.revokeObjectURL(resultUrl)
      setResultBlob(blob)
      setResultUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses meme.')
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
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800">
          <Smile className="size-3.5" /> Pembuat Meme Online
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
          Pembuat Meme (Meme Generator)
        </h1>
        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
          Buat meme lucu dengan teks atas dan bawah klasik berdinding hitam tebal langsung dari foto Anda.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {!file ? (
        <Card className="p-8 sm:p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 transition-colors">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <ImageIcon className="size-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            Pilih Foto Template Meme Anda
          </h3>
          <p className="mt-1 text-sm text-slate-500">Mendukung format JPG, PNG, WEBP, dan GIF</p>

          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-amber-500 transition-all">
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
              <Smile className="size-4 text-amber-600" /> Teks Meme
            </h3>

            {/* Top Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Teks Bagian Atas:
              </label>
              <textarea
                rows={2}
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                placeholder="Tulis teks atas di sini..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold uppercase text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Bottom Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Teks Bagian Bawah:
              </label>
              <textarea
                rows={2}
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                placeholder="Tulis teks bawah di sini..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold uppercase text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Font Size */}
            <div className="space-y-1.5 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 text-xs">
              <div className="flex justify-between font-semibold">
                <span>Ukuran Font:</span>
                <span className="text-amber-600 font-bold">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>

            <Button variant="ghost" size="md" className="w-full text-xs" onClick={resetAll}>
              <RefreshCw className="size-3.5" /> Ganti Gambar Lain
            </Button>
          </Card>

          {/* Canvas Live Preview */}
          <Card className="md:col-span-2 space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Pratinjau Meme</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pratinjau langsung bagaimana meme Anda akan terlihat.
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
                className="w-full bg-amber-600 hover:bg-amber-500 text-white"
                onClick={saveMeme}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="size-5 animate-spin" /> Merender Meme...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-5" /> Buat & Unduh Meme
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
                      Meme Berhasil Dibuat!
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Ukuran berkas hasil: <span className="font-extrabold">{formatBytes(resultBlob.size)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={resultUrl}
                    download={`${file.name.replace(/\.[^.]+$/, '')}-meme.jpg`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-amber-500 transition-all"
                  >
                    <Download className="size-4" /> Unduh Meme ({formatBytes(resultBlob.size)})
                  </a>
                  <Button variant="secondary" size="md" onClick={() => setResultBlob(undefined)}>
                    Edit Teks
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
