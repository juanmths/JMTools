import { FileX2, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { buttonClass, Card } from '../components/ui'
import { api } from '../features/convert/api'
import { ResultCard } from '../features/convert/ResultCard'
import { Stepper } from '../features/convert/Stepper'
import { useConvertStore } from '../features/convert/store'
import type { Job } from '../features/convert/types'
import { isImageFormat, isPdfCompress } from '../lib/formats'

type View = { kind: 'loading' } | { kind: 'ready'; job: Job } | { kind: 'gone'; reason: 'expired' | 'deleted' }

export default function ResultPage() {
  const { jobId = '' } = useParams()
  const navigate = useNavigate()
  const file = useConvertStore((s) => s.file)
  const [view, setView] = useState<View>({ kind: 'loading' })

  useEffect(() => {
    let alive = true
    void api.getJob(jobId).then((job) => {
      if (!alive) return
      setView(job?.status === 'done' ? { kind: 'ready', job } : { kind: 'gone', reason: 'expired' })
    })
    return () => {
      alive = false
    }
  }, [jobId])

  const onExpire = useCallback(() => setView({ kind: 'gone', reason: 'expired' }), [])

  if (view.kind === 'loading') {
    return (
      <div className="grid place-items-center py-24 text-slate-500">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  if (view.kind === 'gone') {
    return (
      <Card className="mx-auto max-w-md space-y-4 p-8 text-center">
        <FileX2 className="mx-auto size-12 text-slate-400" />
        <h1 className="text-xl font-semibold">{view.reason === 'deleted' ? 'Berkas berhasil dihapus' : 'Berkas telah dihapus'}</h1>
        <p className="text-sm text-slate-500">
          {view.reason === 'deleted'
            ? 'Berkas asli dan hasil konversi sudah dihapus dari server.'
            : 'Tautan ini sudah kedaluwarsa. Demi privasi, berkas dihapus otomatis. Silakan unggah ulang.'}
        </p>
        <Link to="/" className={buttonClass('primary')}>
          Unggah berkas baru
        </Link>
      </Card>
    )
  }

  const { job } = view
  const sameFile = file?.id === job.fileId
  const showSettings = isImageFormat(job.target) || isPdfCompress(job.sourceType, job.target)

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Stepper current="result" showSettings={showSettings} />
      <ResultCard
        job={job}
        originalPreview={sameFile ? file?.previewUrl : undefined}
        onEdit={sameFile ? () => navigate(`/convert?step=${showSettings ? 'settings' : 'format'}`) : undefined}
        onNew={() => {
          useConvertStore.getState().reset()
          navigate('/')
        }}
        onDelete={async () => {
          await api.deleteJob(job.id)
          useConvertStore.getState().reset()
          setView({ kind: 'gone', reason: 'deleted' })
        }}
        onExpire={onExpire}
      />
    </div>
  )
}
