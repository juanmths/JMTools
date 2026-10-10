import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Dropzone } from '../features/convert/Dropzone'
import { useLeaveGuard, useUpload } from '../features/convert/hooks'
import { useConvertStore } from '../features/convert/store'
import { FORMATS, parseToolSlug, POPULAR_TOOLS, toolSlug, toolTitle } from '../lib/formats'
import NotFoundPage from './NotFoundPage'

export default function ToolLandingPage() {
  const { slug } = useParams()
  const tool = parseToolSlug(slug)
  const { start, cancel } = useUpload(tool?.to)
  useLeaveGuard(useConvertStore((s) => !!s.upload))

  useEffect(() => {
    if (tool) document.title = `${toolTitle(tool)} — JMTools`
    useConvertStore.getState().setUploadError(undefined)
    return () => {
      document.title = 'JMTools — Konversi, Resize & Kompres Berkas'
    }
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!tool) return <NotFoundPage />

  const from = FORMATS[tool.from]
  const to = FORMATS[tool.to]
  const desc =
    tool.from === tool.to
      ? `Perkecil ukuran berkas ${from.label} dengan mengatur kualitas dan dimensi.`
      : `Ubah berkas ${from.label} menjadi ${to.label} dalam hitungan detik.${to.kind === 'image' ? ' Atur kualitas & ukuran sebelum mengunduh.' : ''}`

  return (
    <div className="space-y-12">
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{toolTitle(tool)}</h1>
        <p className="mt-3 text-slate-500">{desc}</p>
        <div className="mt-8">
          <Dropzone key={slug} onFile={start} onCancel={cancel} formats={[tool.from]} />
        </div>
      </section>
      <section className="mx-auto max-w-2xl">
        <h2 className="text-sm font-semibold text-slate-500">Alat lainnya</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {POPULAR_TOOLS.filter((t) => toolSlug(t) !== slug).map((t) => (
            <Link
              key={toolSlug(t)}
              to={`/tools/${toolSlug(t)}`}
              className="rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-slate-200 hover:ring-indigo-400 dark:bg-slate-900 dark:ring-slate-800"
            >
              {toolTitle(t)}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
