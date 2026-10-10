import { Check, ShieldCheck } from 'lucide-react'
import { cn } from '../../lib/utils'
import { PDF_LEVELS } from './pdfLevels'
import { useConvertStore } from './store'
import type { PdfCompressionLevel } from './types'

export function PdfSettingsPanel() {
  const pdfSettings = useConvertStore((s) => s.pdfSettings)
  const updatePdfSettings = useConvertStore((s) => s.updatePdfSettings)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Tingkat Kompresi</h2>
        <p className="mt-1 text-xs text-slate-500">Pilih tingkat kompresi yang sesuai dengan kebutuhan dokumen Anda.</p>
      </div>

      <div className="space-y-3" role="radiogroup" aria-label="Tingkat kompresi PDF">
        {PDF_LEVELS.map((level) => {
          const selected = pdfSettings.level === level.id
          return (
            <button
              key={level.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => updatePdfSettings({ level: level.id as PdfCompressionLevel })}
              className={cn(
                'relative flex w-full cursor-pointer items-start gap-3 rounded-2xl p-4 text-left ring-2 transition-all',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
                selected
                  ? 'bg-indigo-50/70 ring-indigo-600 dark:bg-indigo-950/40 dark:ring-indigo-500'
                  : 'bg-white ring-slate-200 hover:ring-indigo-300 dark:bg-slate-900 dark:ring-slate-800',
              )}
            >
              <div
                className={cn(
                  'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-white transition-colors',
                  selected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800',
                )}
              >
                {selected && <Check className="size-3" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">{level.label}</span>
                  <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    ≈ -{level.reduction[0]}% s/d -{level.reduction[1]}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{level.description}</p>
                <p className="mt-1 text-[11px] text-slate-400">Target resolusi gambar: {level.dpi} DPI</p>
              </div>
            </button>
          )
        })}
      </div>

      <hr className="border-slate-200 dark:border-slate-800" />

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Opsi Tambahan</p>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
          <input
            type="checkbox"
            checked={pdfSettings.stripMetadata}
            onChange={(e) => updatePdfSettings({ stripMetadata: e.target.checked })}
            className="mt-0.5 size-4 rounded accent-indigo-600"
          />
          <div>
            <span className="font-medium">Hapus metadata dokumen</span>
            <p className="text-xs text-slate-500">Menghapus informasi nama pembuat, software, dan tanggal pembuatan untuk menghemat ruang.</p>
          </div>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50">
          <input
            type="checkbox"
            checked={pdfSettings.grayscale}
            onChange={(e) => updatePdfSettings({ grayscale: e.target.checked })}
            className="mt-0.5 size-4 rounded accent-indigo-600"
          />
          <div>
            <span className="font-medium">Ubah gambar ke Grayscale (Hitam-Putih)</span>
            <p className="text-xs text-slate-500">Mengubah semua gambar di dalam PDF menjadi monokrom untuk penghematan ukuran maksimal.</p>
          </div>
        </label>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
        Teks dan struktur dokumen tetap tajam dan dapat dicari (searchable).
      </p>
    </div>
  )
}
