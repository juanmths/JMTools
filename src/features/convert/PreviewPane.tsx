import { ArrowRight, Loader2 } from 'lucide-react'
import { FORMATS, type FormatId } from '../../lib/formats'
import { cn, formatBytes, percentChange } from '../../lib/utils'
import { Card } from '../../components/ui'
import { useSizeEstimate } from './hooks'
import type { ImageSettings, UploadedFile } from './types'

export function PreviewPane({ file, target, settings, valid }: { file: UploadedFile; target: FormatId; settings: ImageSettings; valid: boolean }) {
  const estimate = useSizeEstimate(file.id, target, settings, valid)
  const change = estimate.size !== undefined ? percentChange(file.size, estimate.size) : undefined

  return (
    <Card className="flex flex-col gap-4">
      <div className="bg-checker relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl">
        <img src={file.previewUrl} alt={`Pratinjau ${file.name}`} className="max-h-full max-w-full object-contain" />
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <dt className="text-xs text-slate-500">Asli · {FORMATS[file.type].label}</dt>
          <dd className="mt-1 font-semibold">
            {file.width} × {file.height}
          </dd>
          <dd className="text-slate-500">{formatBytes(file.size)}</dd>
        </div>
        <div className="relative rounded-xl bg-indigo-50 p-3 dark:bg-indigo-950/40">
          <ArrowRight className="absolute top-1/2 -left-4 size-5 -translate-y-1/2 rounded-full bg-white p-0.5 text-slate-400 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700" />
          <dt className="text-xs text-indigo-700 dark:text-indigo-300">Hasil · {FORMATS[target].label}</dt>
          <dd className="mt-1 font-semibold">
            {settings.width ?? '—'} × {settings.height ?? '—'}
          </dd>
          <dd className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300" aria-live="polite">
            {estimate.loading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Menghitung…
              </>
            ) : estimate.size !== undefined && valid ? (
              <>
                ≈ {formatBytes(estimate.size)}
                {change !== undefined && (
                  <span className={cn('text-xs font-semibold', change <= 0 ? 'text-emerald-600' : 'text-amber-600')}>
                    ({change > 0 ? '+' : ''}
                    {change}%)
                  </span>
                )}
              </>
            ) : (
              '—'
            )}
          </dd>
        </div>
      </dl>
      <p className="text-xs text-slate-400">Estimasi ukuran bersifat perkiraan; ukuran pasti ditampilkan setelah konversi.</p>
    </Card>
  )
}
