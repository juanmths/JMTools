import { FileText, RefreshCw } from 'lucide-react'
import { FORMATS } from '../../lib/formats'
import { formatBytes } from '../../lib/utils'
import { Button, Card } from '../../components/ui'
import type { UploadedFile } from './types'

export function FileSummaryCard({ file, onReplace }: { file: UploadedFile; onReplace: () => void }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="bg-checker size-16 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200 dark:ring-slate-700">
        {file.previewUrl ? (
          <img src={file.previewUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center bg-slate-100 text-slate-500 dark:bg-slate-800">
            <FileText className="size-7" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium" title={file.name}>
          {file.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {FORMATS[file.type].label} terdeteksi
          </span>
          <span>{formatBytes(file.size)}</span>
          {file.width && (
            <span>
              {file.width} × {file.height} px
            </span>
          )}
          {file.pages !== undefined && <span>{file.pages} halaman</span>}
        </div>
      </div>
      <Button variant="ghost" onClick={onReplace}>
        <RefreshCw className="size-4" /> <span className="hidden sm:inline">Ganti berkas</span>
      </Button>
    </Card>
  )
}
