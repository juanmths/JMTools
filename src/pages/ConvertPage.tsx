import { ArrowLeft, ArrowRight, Loader2, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Alert, Button, Card } from '../components/ui'
import { api } from '../features/convert/api'
import { Dropzone } from '../features/convert/Dropzone'
import { FileSummaryCard } from '../features/convert/FileSummaryCard'
import { FormatPicker } from '../features/convert/FormatPicker'
import { ALLOW_LEAVE, useLeaveGuard, useStartConvert, useStepNavigation, useUpload, validateSettings } from '../features/convert/hooks'
import { ImageSettingsPanel } from '../features/convert/ImageSettingsPanel'
import { PdfPreviewPane } from '../features/convert/PdfPreviewPane'
import { PdfSettingsPanel } from '../features/convert/PdfSettingsPanel'
import { PreviewPane } from '../features/convert/PreviewPane'
import { ProcessingStatus } from '../features/convert/ProcessingStatus'
import { Stepper } from '../features/convert/Stepper'
import { useConvertStore } from '../features/convert/store'
import { STEPS, type Job, type Step } from '../features/convert/types'
import { FORMATS, hasSettingsStep, isPdfCompress, type FormatId } from '../lib/formats'

function ActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 dark:border-slate-800 dark:bg-slate-950/90 sm:dark:bg-transparent">
      <div className="flex items-center justify-between gap-3">{children}</div>
    </div>
  )
}

export default function ConvertPage() {
  const navigate = useNavigate()
  const { step: rawStep, goTo } = useStepNavigation()
  const step: Step = STEPS.includes(rawStep) ? rawStep : 'upload'

  const file = useConvertStore((s) => s.file)
  const target = useConvertStore((s) => s.targetFormat)
  const settings = useConvertStore((s) => s.settings)
  const pdfSettings = useConvertStore((s) => s.pdfSettings)
  const jobId = useConvertStore((s) => s.jobId)
  const uploading = useConvertStore((s) => !!s.upload)
  const { setTarget, resetSettings, setJobId, reset } = useConvertStore.getState()

  const { start, cancel } = useUpload()
  const convert = useStartConvert(goTo)
  const [formats, setFormats] = useState<FormatId[]>([])

  useLeaveGuard(uploading || step === 'processing')

  useEffect(() => {
    if (file) void api.getFormats(file.type).then(setFormats)
  }, [file])

  const errors = useMemo(() => validateSettings(settings), [settings])
  const valid = Object.keys(errors).length === 0
  const isPdf = isPdfCompress(file?.type, target)
  const showSettings = hasSettingsStep(file?.type, target)

  const onDone = useCallback((job: Job) => navigate(`/convert/result/${job.id}`, { replace: true, state: ALLOW_LEAVE }), [navigate])

  const replaceFile = () => {
    if (file) void api.deleteFile(file.id)
    reset()
    goTo('upload')
  }

  // --- Route guards ---------------------------------------------------------
  let redirect: Step | null = null
  if (step !== 'upload' && !file) redirect = 'upload'
  else if (step === 'settings' && !showSettings) redirect = 'format'
  else if (step === 'processing' && !jobId) redirect = showSettings ? 'settings' : 'format'
  if (redirect) return <Navigate to={`/convert?step=${redirect}`} replace state={ALLOW_LEAVE} />

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Stepper current={step} showSettings={!target || showSettings} onNavigate={(s) => (s === 'upload' ? replaceFile() : goTo(s))} />

      {step === 'upload' && (
        <section className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-2xl font-bold">Unggah berkas</h1>
          <Dropzone onFile={start} onCancel={cancel} />
        </section>
      )}

      {step === 'format' && file && (
        <section className="mx-auto max-w-2xl space-y-6">
          <h1 className="text-2xl font-bold">Pilih format tujuan</h1>
          <FileSummaryCard file={file} onReplace={replaceFile} />
          <FormatPicker source={file.type} options={formats} value={target} onChange={setTarget} />
          {convert.error && <Alert>{convert.error}</Alert>}
          <ActionBar>
            <Button variant="ghost" onClick={replaceFile}>
              <ArrowLeft className="size-4" /> Ganti berkas
            </Button>
            <Button size="lg" disabled={!target || convert.busy} onClick={() => (showSettings ? goTo('settings') : convert.run())}>
              {convert.busy && <Loader2 className="size-4 animate-spin" />}
              {showSettings ? 'Lanjut ke pengaturan' : target ? `Konversi ke ${FORMATS[target].label}` : 'Lanjut'}
              <ArrowRight className="size-4" />
            </Button>
          </ActionBar>
        </section>
      )}

      {step === 'settings' && file && target && (
        <section className="space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-2xl font-bold">{isPdf ? 'Pengaturan Kompresi PDF' : 'Resize & kompres'}</h1>
            <p className="text-sm text-slate-500">
              {isPdf ? (
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">PDF Kompresi</span>
              ) : (
                <>
                  {FORMATS[file.type].label} → <span className="font-semibold text-indigo-600 dark:text-indigo-400">{FORMATS[target].label}</span>
                </>
              )}
            </p>
          </div>

          {isPdf ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <PdfPreviewPane file={file} pdfSettings={pdfSettings} />
              <Card>
                <PdfSettingsPanel />
              </Card>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <PreviewPane file={file} target={target} settings={settings} valid={valid} />
              <Card>
                <ImageSettingsPanel errors={errors} target={target} />
              </Card>
            </div>
          )}

          {convert.error && <Alert>{convert.error}</Alert>}
          <ActionBar>
            <div className="flex gap-1">
              <Button variant="ghost" onClick={() => goTo('format')}>
                <ArrowLeft className="size-4" /> <span className="hidden sm:inline">Format</span>
              </Button>
              <Button variant="ghost" onClick={resetSettings}>
                <RotateCcw className="size-4" /> <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
            <Button size="lg" disabled={(!isPdf && !valid) || convert.busy} onClick={convert.run}>
              {convert.busy && <Loader2 className="size-4 animate-spin" />}
              {isPdf ? 'Kompres PDF Sekarang' : 'Konversi Sekarang'}
            </Button>
          </ActionBar>
        </section>
      )}

      {step === 'processing' && jobId && (
        <ProcessingStatus
          jobId={jobId}
          onDone={onDone}
          onCancel={async () => {
            await api.cancelJob(jobId)
            goTo(showSettings ? 'settings' : 'format', { replace: true })
            setJobId(undefined)
          }}
          onRetry={() => {
            goTo(showSettings ? 'settings' : 'format', { replace: true })
            setJobId(undefined)
          }}
        />
      )}
    </div>
  )
}
