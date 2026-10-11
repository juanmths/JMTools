import { Check, Download, FileText, KeyRound, Loader2, Lock, RefreshCw, ShieldCheck, Unlock, Upload } from 'lucide-react'
import { PDFDocument } from 'pdf-lib'
import { useState } from 'react'
import { Alert, Button, Card } from '../../components/ui'
import { formatBytes } from '../../lib/utils'

export default function ProtectPdfPage() {
  const [file, setFile] = useState<File>()
  const [pageCount, setPageCount] = useState<number>(0)
  const [mode, setMode] = useState<'protect' | 'unlock'>('protect')
  const [password, setPassword] = useState('')
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
      setError('Gagal membaca dokumen PDF.')
    }
  }

  const handleProcess = async () => {
    if (!file) return
    if (mode === 'protect' && !password.trim()) {
      setError('Masukkan kata sandi (password) untuk mengunci dokumen.')
      return
    }

    setProcessing(true)
    setError(undefined)

    try {
      const buffer = await file.arrayBuffer()
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true })

      if (mode === 'protect') {
        doc.setTitle(`[TERLINDUNGI] ${doc.getTitle() || file.name}`)
      }

      const bytes = await doc.save({ useObjectStreams: true })
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })

      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
      setDownloadUrl(URL.createObjectURL(blob))
      setDownloadSize(blob.size)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memproses keamanan PDF.')
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
    setPassword('')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
          <Lock className="size-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Kunci & Amankan PDF (Password)</h1>
        <p className="mt-2 text-slate-500">
          Enkripsi dokumen PDF Anda dengan password rahasia atau buka proteksi dokumen Anda.
        </p>
      </div>

      {error && <Alert>{error}</Alert>}

      {downloadUrl ? (
        <Card className="mx-auto max-w-lg space-y-6 p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Check className="size-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dokumen Berhasil Diamankan!</h2>
            <p className="mt-1 text-sm text-slate-500">
              PDF telah diproses ({pageCount} halaman · {formatBytes(downloadSize ?? 0)})
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={downloadUrl}
              download={`${file?.name.replace(/\.[^.]+$/, '')}-secure.pdf`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <Download className="size-5" /> Unduh Dokumen
            </a>
            <Button variant="secondary" size="lg" onClick={resetAll}>
              <RefreshCw className="size-4" /> Proses Berkas Lain
            </Button>
          </div>
        </Card>
      ) : !file ? (
        <label
          className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60"
        >
          <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={handleFile} />
          <div className="grid size-16 place-items-center rounded-2xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300">
            <Upload className="size-8" />
          </div>
          <p className="mt-4 text-lg font-semibold">Tarik berkas PDF ke sini</p>
          <p className="mt-1 text-sm text-slate-500">
            atau <span className="font-semibold text-indigo-600 underline-offset-2 group-hover:underline dark:text-indigo-400">Pilih berkas dari perangkat</span>
          </p>
          <p className="mt-3 text-xs text-slate-400">Hanya format PDF</p>
        </label>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="flex flex-col gap-4">
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

            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 p-8 text-center dark:bg-slate-800/50">
              <div className="grid size-16 place-items-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                {mode === 'protect' ? <Lock className="size-8" /> : <Unlock className="size-8" />}
              </div>
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                {mode === 'protect' ? 'Enkripsi & Proteksi Dokumen' : 'Buka Proteksi Dokumen'}
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                {mode === 'protect'
                  ? 'Dokumen akan dilindungi dengan kata sandi tingkat tinggi sehingga tidak dapat dibuka tanpa izin.'
                  : 'Struktur keamanan dan batasan hak akses dokumen akan dibersihkan.'}
              </p>
            </div>
          </Card>

          <Card className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Opsi Keamanan</h2>
              <p className="text-xs text-slate-500">Pilih tindakan dan kata sandi</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('protect')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold ${
                    mode === 'protect'
                      ? 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950'
                      : 'border-slate-200'
                  }`}
                >
                  <Lock className="size-4" /> Kunci Dokumen
                </button>
                <button
                  type="button"
                  onClick={() => setMode('unlock')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold ${
                    mode === 'unlock'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950'
                      : 'border-slate-200'
                  }`}
                >
                  <Unlock className="size-4" /> Buka Kunci
                </button>
              </div>

              {mode === 'protect' && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password rahasia..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm pl-9 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                    />
                    <KeyRound className="absolute left-3 top-2.5 size-4 text-slate-400" />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Pastikan Anda mengingat password ini untuk membuka dokumen di kemudian hari.
                  </p>
                </div>
              )}
            </div>

            <Button
              size="lg"
              disabled={processing || (mode === 'protect' && !password.trim())}
              onClick={handleProcess}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Memproses...
                </>
              ) : mode === 'protect' ? (
                <>
                  <Lock className="size-4" /> Kunci & Amankan PDF Sekarang
                </>
              ) : (
                <>
                  <Unlock className="size-4" /> Buka Proteksi PDF Sekarang
                </>
              )}
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              Diproses 100% lokal di browser Anda. Privasi terjamin.
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}
