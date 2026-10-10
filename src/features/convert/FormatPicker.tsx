import { Check, FileText, Image as ImageIcon } from 'lucide-react'
import { FORMATS, type FormatId, type FormatKind } from '../../lib/formats'
import { cn } from '../../lib/utils'

interface Props {
  source: FormatId
  options: FormatId[]
  value?: FormatId
  onChange: (f: FormatId) => void
}

const GROUPS: { kind: FormatKind; label: string; Icon: typeof ImageIcon }[] = [
  { kind: 'image', label: 'Gambar', Icon: ImageIcon },
  { kind: 'document', label: 'Dokumen', Icon: FileText },
]

export function FormatPicker({ source, options, value, onChange }: Props) {
  return (
    <div className="space-y-6">
      {GROUPS.map(({ kind, label, Icon }) => {
        const items = options.filter((f) => FORMATS[f].kind === kind)
        if (!items.length) return null
        return (
          <fieldset key={kind}>
            <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Icon className="size-4" /> {label}
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {items.map((f) => {
                const info = FORMATS[f]
                const selected = value === f
                const same = f === source
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onChange(f)}
                    className={cn(
                      'relative rounded-2xl p-4 text-left ring-2 transition-all',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
                      selected
                        ? 'bg-indigo-50 ring-indigo-600 dark:bg-indigo-950/50'
                        : 'bg-white ring-slate-200 hover:ring-indigo-300 dark:bg-slate-900 dark:ring-slate-700',
                    )}
                  >
                    {selected && (
                      <span className="absolute top-3 right-3 grid size-5 place-items-center rounded-full bg-indigo-600 text-white">
                        <Check className="size-3" />
                      </span>
                    )}
                    <span className="block text-xl font-bold tracking-tight">{info.label}</span>
                    <span className="mt-1 block text-xs text-slate-500">{same ? 'Format sama — hanya resize/kompres' : info.hint}</span>
                    {info.recommended && !same && (
                      <span className="mt-2 inline-block rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Direkomendasikan
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}
