import { ArrowRight, FileText, Layers } from 'lucide-react'
import { Card } from '../../components/ui'
import { formatBytes } from '../../lib/utils'
import { pdfLevel } from './pdfLevels'
import type { PdfSettings, UploadedFile } from './types'

export function PdfPreviewPane({ file, pdfSettings }: { file: UploadedFile; pdfSettings: PdfSettings }) {
  const currentLevel = pdfLevel(pdfSettings.level)
  const minEstimate = Math.max(1024, Math.round(file.size * (1 - currentLevel.reduction[1] / 100)))
  const maxEstimate = Math.max(1024, Math.round(file.size * (1 - currentLevel.reduction[0] / 100)))

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-8 text-center dark:bg-slate-800/50">
        <div className="relative grid size-20 place-items-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
          <FileText className="size-10" />
          <span className="absolute -bottom-2 rounded-md bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
            PDF
          </span>
        </div>
        <p className="mt-4 max-w-sm truncate font-medium" title={file.name}>
          {file.name}
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          <span>{formatBytes(file.size)}</span>
          {file.pages !== undefined && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Layers className="size-3.5" /> {file.pages} halaman
              </span>
            </>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <dt className="text-xs text-slate-500">Ukuran Asli</dt>
          <dd className="mt-1 font-semibold">{formatBytes(file.size)}</dd>
          <dd className="text-xs text-slate-400">100% kualitas awal</dd>
        </div>
        <div className="relative rounded-xl bg-indigo-50 p-3 dark:bg-indigo-950/40">
          <ArrowRight className="absolute top-1/2 -left-4 size-5 -translate-y-1/2 rounded-full bg-white p-0.5 text-slate-400 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700" />
          <dt className="text-xs text-indigo-700 dark:text-indigo-300">Estimasi Hasil ({currentLevel.label})</dt>
          <dd className="mt-1 font-semibold text-emerald-600 dark:text-emerald-400">
            ≈ {formatBytes(minEstimate)} – {formatBytes(maxEstimate)}
          </dd>
          <dd className="text-xs text-slate-500">Hemat {currentLevel.reduction[0]}%–{currentLevel.reduction[1]}%</dd>
        </div>
      </dl>

      <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-500 dark:bg-slate-800/50">
        <p className="font-medium text-slate-700 dark:text-slate-300">Tips Kompresi PDF:</p>
        <p className="mt-1">
          Penghematan terbesar terjadi pada PDF yang berisi gambar/scan foto. Dokumen berbasis teks murni akan dikompresi melalui struktur objek tanpa merusak kualitas teks.
        </p>
      </div>
    </Card>
  )
}
