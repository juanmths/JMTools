import { FileText, ShieldCheck, Upload, X } from 'lucide-react'
import { useEffect } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { acceptFor, FILE_TTL_MS, FORMATS, matchesAccept, MAX_FILE_SIZE, type FormatId } from '../../lib/formats'
import { cn, formatBytes } from '../../lib/utils'
import { Alert, Button } from '../../components/ui'
import { useConvertStore } from './store'

interface Props {
  onFile: (file: File) => void
  onCancel: () => void
  /** Restrict accepted input formats (tool landing pages) */
  formats?: FormatId[]
}

function rejectionMessage(r: FileRejection): string {
  switch (r.errors[0]?.code) {
    case 'file-too-large':
      return `Berkas melebihi batas ${formatBytes(MAX_FILE_SIZE)}.`
    case 'file-invalid-type':
      return 'Format berkas tidak didukung.'
    case 'too-many-files':
      return 'Unggah satu berkas saja.'
    default:
      return r.errors[0]?.message ?? 'Berkas ditolak.'
  }
}

export function Dropzone({ onFile, onCancel, formats }: Props) {
  const upload = useConvertStore((s) => s.upload)
  const error = useConvertStore((s) => s.uploadError)
  const setError = useConvertStore((s) => s.setUploadError)

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDropAccepted: (files) => onFile(files[0]),
    onDropRejected: (rej) => setError(rejectionMessage(rej[0])),
    accept: acceptFor(formats),
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: !!upload,
    noClick: true,
  })

  // Paste from clipboard (Ctrl+V)
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = e.clipboardData?.files[0]
      if (!file || useConvertStore.getState().upload) return
      if (!matchesAccept(file, formats)) return setError('Format berkas tidak didukung.')
      if (file.size > MAX_FILE_SIZE) return setError(`Berkas melebihi batas ${formatBytes(MAX_FILE_SIZE)}.`)
      onFile(file)
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [formats, onFile, setError])

  const labels = (formats ?? (Object.keys(FORMATS) as FormatId[])).map((f) => FORMATS[f].label).join(', ')

  if (upload) {
    return (
      <div className="rounded-3xl border-2 border-indigo-200 bg-white p-6 dark:border-indigo-900 dark:bg-slate-900" aria-live="polite">
        <div className="flex items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
            <FileText className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{upload.name}</p>
            <p className="text-sm text-slate-500">
              {formatBytes(upload.size)} · Mengunggah {upload.progress}%
            </p>
          </div>
          <Button variant="ghost" onClick={onCancel} aria-label="Batalkan unggahan">
            <X className="size-4" /> Batal
          </Button>
        </div>
        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
          role="progressbar"
          aria-valuenow={upload.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progres unggahan"
        >
          <div className="h-full rounded-full bg-indigo-600 transition-[width] duration-150" style={{ width: `${upload.progress}%` }} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps({
          onClick: open,
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              open()
            }
          },
        })}
        role="button"
        tabIndex={0}
        aria-label="Area unggah berkas. Tekan Enter untuk memilih berkas, atau tarik berkas ke sini."
        className={cn(
          'group cursor-pointer rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-all sm:py-16',
          'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500',
          isDragActive
            ? 'scale-[1.01] border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
            : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60',
        )}
      >
        <input {...getInputProps()} />
        <div
          className={cn(
            'mx-auto grid size-16 place-items-center rounded-2xl transition-colors',
            isDragActive ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300',
          )}
        >
          <Upload className="size-8" />
        </div>
        <p className="mt-5 text-lg font-semibold">{isDragActive ? 'Lepaskan untuk mengunggah' : 'Tarik berkas ke sini'}</p>
        <p className="mt-1 text-slate-500">
          atau <span className="font-semibold text-indigo-600 underline-offset-2 group-hover:underline dark:text-indigo-400">pilih berkas</span>{' '}
          <span className="hidden sm:inline">· tempel dengan Ctrl+V</span>
        </p>
        <p className="mt-4 text-xs text-slate-400">
          {labels} · Maks. {formatBytes(MAX_FILE_SIZE)}
        </p>
      </div>
      {error && <Alert>{error}</Alert>}
      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <ShieldCheck className="size-4 text-emerald-500" />
        Berkas dihapus otomatis dari server setelah {FILE_TTL_MS / 60000} menit.
      </p>
    </div>
  )
}
