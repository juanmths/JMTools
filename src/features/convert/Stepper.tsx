import { Check } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Step } from './types'

const LABELS: Record<Exclude<Step, 'processing'>, string> = {
  upload: 'Unggah',
  format: 'Format',
  settings: 'Pengaturan',
  result: 'Hasil',
}

interface Props {
  current: Step
  /** Documents skip the settings step */
  showSettings: boolean
  onNavigate?: (step: Step) => void
}

export function Stepper({ current, showSettings, onNavigate }: Props) {
  const steps = (['upload', 'format', 'settings', 'result'] as const).filter((s) => showSettings || s !== 'settings')
  const activeStep = current === 'processing' ? 'result' : current
  const activeIndex = steps.indexOf(activeStep as (typeof steps)[number])
  const locked = current === 'processing' || current === 'result'

  return (
    <nav aria-label="Langkah konversi">
      <ol className="flex items-center gap-2">
        {steps.map((s, i) => {
          const done = i < activeIndex
          const active = i === activeIndex
          const clickable = done && !locked && !!onNavigate
          return (
            <li key={s} className="flex flex-1 items-center gap-2 last:flex-none">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => onNavigate?.(s)}
                aria-current={active ? 'step' : undefined}
                className={cn('flex items-center gap-2 rounded-full text-sm', clickable && 'hover:text-indigo-600')}
              >
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ring-2 transition-colors',
                    done && 'bg-indigo-600 text-white ring-indigo-600',
                    active && 'bg-white text-indigo-600 ring-indigo-600 dark:bg-slate-900',
                    !done && !active && 'bg-white text-slate-400 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700',
                  )}
                >
                  {done ? <Check className="size-4" /> : i + 1}
                </span>
                <span className={cn('hidden font-medium sm:inline', active ? 'text-slate-900 dark:text-white' : 'text-slate-500')}>
                  {LABELS[s]}
                </span>
              </button>
              {i < steps.length - 1 && (
                <span className={cn('h-0.5 flex-1 rounded', done ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700')} aria-hidden />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
