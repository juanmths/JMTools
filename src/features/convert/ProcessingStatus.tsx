import { Check, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'
import { Alert, Button, Card } from '../../components/ui'
import { api } from './api'
import type { Job } from './types'

interface Props {
  jobId: string
  onDone: (job: Job) => void
  onCancel: () => void
  onRetry: () => void
}

export function ProcessingStatus({ jobId, onDone, onCancel, onRetry }: Props) {
  const [job, setJob] = useState<Job | null>()

  useEffect(() => {
    let alive = true
    const poll = async () => {
      const j = await api.getJob(jobId)
      if (!alive) return
      setJob(j)
      if (j?.status === 'done') onDone(j)
      else if (j?.status === 'processing') timer = window.setTimeout(poll, 250)
    }
    let timer = window.setTimeout(poll, 0)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [jobId, onDone])

  if (job === null || job?.status === 'error' || job?.status === 'cancelled') {
    return (
      <Card className="mx-auto max-w-lg space-y-4 text-center">
        <Alert>{job?.error ?? 'Proses tidak ditemukan atau dibatalkan.'}</Alert>
        <Button onClick={onRetry}>Kembali ke pengaturan</Button>
      </Card>
    )
  }

  const stages = job?.stages ?? []
  const index = job?.stageIndex ?? 0
  const progress = stages.length ? Math.round(((index + 0.5) / stages.length) * 100) : 5

  return (
    <Card className="mx-auto max-w-lg p-8">
      <div className="flex flex-col items-center text-center">
        <div className="grid size-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
          <Loader2 className="size-8 animate-spin" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Sedang memproses…</h2>
        <p className="text-sm text-slate-500">Jangan tutup halaman ini.</p>
      </div>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-indigo-600 transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
      <ol className="mt-6 space-y-3" aria-live="polite">
        {stages.map((label, i) => {
          const done = i < index
          const active = i === index
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  'grid size-6 place-items-center rounded-full',
                  done && 'bg-emerald-500 text-white',
                  active && 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950',
                  !done && !active && 'bg-slate-100 text-slate-400 dark:bg-slate-800',
                )}
              >
                {done ? <Check className="size-3.5" /> : active ? <Loader2 className="size-3.5 animate-spin" /> : <span className="size-1.5 rounded-full bg-current" />}
              </span>
              <span className={cn(active ? 'font-medium' : done ? 'text-slate-500' : 'text-slate-400')}>{label}</span>
            </li>
          )
        })}
      </ol>
      <div className="mt-6 text-center">
        <Button variant="ghost" onClick={onCancel}>
          <X className="size-4" /> Batalkan
        </Button>
      </div>
    </Card>
  )
}
