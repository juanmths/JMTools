import { Clock, Download, Pencil, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FORMATS, isPdfCompress } from '../../lib/formats'
import { buttonClass, Button, Card } from '../../components/ui'
import { cn, formatBytes, formatCountdown, percentChange } from '../../lib/utils'
import { pdfLevel } from './pdfLevels'
import type { Job } from './types'

function SizeComparison({ from, to }: { from: number; to: number }) {
  const change = percentChange(from, to)
  const smaller = change <= 0
  const ratio = Math.min(100, Math.max(2, (to / Math.max(from, to)) * 100))
  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
        <span className="text-2xl font-semibold text-slate-400 line-through decoration-2 sm:text-3xl">{formatBytes(from)}</span>
        <span className="text-slate-400">→</span>
        <span className="text-3xl font-bold sm:text-4xl">{formatBytes(to)}</span>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold',
            smaller ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
          )}
        >
          {smaller ? <TrendingDown className="size-4" /> : <TrendingUp className="size-4" />}
          {change > 0 ? '+' : ''}
          {change}%
        </span>
      </div>
      <div className="mt-5 space-y-2 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="w-12">Asli</span>
          <div className="h-2.5 flex-1 rounded-full bg-slate-300 dark:bg-slate-600" style={{ maxWidth: `${(from / Math.max(from, to)) * 100}%` }} />
        </div>
        <div className="flex items-center gap-3">
          <span className="w-12">Hasil</span>
          <div className="h-2.5 flex-1 rounded-full bg-indigo-600" style={{ maxWidth: `${ratio}%` }} />
        </div>
      </div>
    </div>
  )
}

function CompareSlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50)
  return (
    <div className="bg-checker relative aspect-[4/3] overflow-hidden rounded-xl select-none">
      <img src={after} alt="Hasil" className="absolute inset-0 size-full object-contain" />
      <img src={before} alt="Asli" className="absolute inset-0 size-full object-contain" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]" style={{ left: `${pos}%` }}>
        <span className="absolute top-1/2 left-1/2 grid size-8 -translate-1/2 place-items-center rounded-full bg-white text-xs text-slate-600 shadow">⇆</span>
      </div>
      <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">Asli</span>
      <span className="absolute top-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">Hasil</span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Geser untuk membandingkan asli dan hasil"
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
    </div>
  )
}

export function ExpiryCountdown({ expiresAt, onExpire }: { expiresAt: number; onExpire: () => void }) {
  const [now, setNow] = useState(() => Date.now())
  const remaining = expiresAt - now
  useEffect(() => {
    if (remaining <= 0) {
      onExpire()
      return
    }
    const t = setTimeout(() => setNow(Date.now()), 1000)
    return () => clearTimeout(t)
  }, [now, remaining, onExpire])
  return (
    <p className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
      <Clock className="size-4" />
      Berkas akan dihapus otomatis dalam <span className="font-mono font-semibold tabular-nums text-slate-700 dark:text-slate-200">{formatCountdown(remaining)}</span>
    </p>
  )
}

interface Props {
  job: Job
  originalPreview?: string
  onEdit?: () => void
  onNew: () => void
  onDelete: () => void
  onExpire: () => void
}

export function ResultCard({ job, originalPreview, onEdit, onNew, onDelete, onExpire }: Props) {
  const isImage = FORMATS[job.target].kind === 'image'
  const isPdf = isPdfCompress(job.sourceType, job.target)

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="space-y-6 p-6 sm:p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-emerald-600">{isPdf ? '✓ Kompresi PDF selesai' : '✓ Konversi selesai'}</p>
          <h1 className="mt-1 truncate text-lg font-semibold" title={job.fileName}>
            {job.fileName}
          </h1>
        </div>
        {job.outputSize !== undefined && <SizeComparison from={job.inputSize} to={job.outputSize} />}
        <dl className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <dt className="text-xs text-slate-500">Format</dt>
            <dd className="font-semibold">{FORMATS[job.target].label}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <dt className="text-xs text-slate-500">{isPdf ? 'Halaman' : 'Dimensi'}</dt>
            <dd className="font-semibold">
              {isPdf ? `${job.pages ?? '—'} Halaman` : job.width ? `${job.width}×${job.height}` : '—'}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
            <dt className="text-xs text-slate-500">{isPdf ? 'Tingkat Kompresi' : 'Kualitas'}</dt>
            <dd className="font-semibold">
              {isPdf
                ? job.compressionLevel
                  ? pdfLevel(job.compressionLevel).label
                  : 'Standar'
                : job.quality
                  ? `${job.quality}%`
                  : isImage
                    ? 'Lossless'
                    : '—'}
            </dd>
          </div>
        </dl>
        {isImage && originalPreview && job.downloadUrl && <CompareSlider before={originalPreview} after={job.downloadUrl} />}
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href={job.downloadUrl} download={job.fileName} className={cn(buttonClass('primary', 'lg'), 'flex-1')}>
            <Download className="size-5" /> Unduh
          </a>
          {onEdit && (
            <Button variant="secondary" size="lg" onClick={onEdit}>
              <Pencil className="size-4" /> Ubah pengaturan
            </Button>
          )}
        </div>
        {job.expiresAt && <ExpiryCountdown expiresAt={job.expiresAt} onExpire={onExpire} />}
      </Card>
      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
        <Button variant="ghost" onClick={onNew}>
          <Plus className="size-4" /> Konversi berkas lain
        </Button>
        <Button variant="danger" onClick={onDelete}>
          <Trash2 className="size-4" /> Hapus sekarang dari server
        </Button>
      </div>
    </div>
  )
}
