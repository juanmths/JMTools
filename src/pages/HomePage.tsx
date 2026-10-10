import { FileType2, Scaling, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../features/convert/Dropzone'
import { useLeaveGuard, useUpload } from '../features/convert/hooks'
import { useConvertStore } from '../features/convert/store'
import { POPULAR_TOOLS, toolSlug, toolTitle } from '../lib/formats'

const FEATURES = [
  { Icon: FileType2, title: 'Konversi format', text: 'JPG, PNG, WEBP, PDF, DOCX — sistem mendeteksi tipe asli berkas Anda.' },
  { Icon: Scaling, title: 'Resize & kompres', text: 'Atur kualitas dan dimensi dengan rasio aspek terkunci otomatis.' },
  { Icon: ShieldCheck, title: 'Privasi terjaga', text: 'Berkas asli dan hasil dihapus otomatis dari server.' },
]

export default function HomePage() {
  const { start, cancel } = useUpload()
  useLeaveGuard(useConvertStore((s) => !!s.upload))

  return (
    <div className="space-y-16">
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Konversi, ubah ukuran & <span className="text-indigo-600 dark:text-indigo-400">kompres</span> berkas
        </h1>
        <p className="mt-4 text-lg text-slate-500">Gratis, cepat, dan tanpa akun. Unggah berkas untuk memulai.</p>
        <div className="mt-8">
          <Dropzone onFile={start} onCancel={cancel} />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Fitur">
        {FEATURES.map(({ Icon, title, text }) => (
          <div key={title} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <Icon className="size-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{text}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Alat populer</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {POPULAR_TOOLS.map((t) => (
            <Link
              key={toolSlug(t)}
              to={`/tools/${toolSlug(t)}`}
              className="rounded-xl bg-white px-4 py-3 text-sm font-medium ring-1 ring-slate-200 transition hover:ring-indigo-400 dark:bg-slate-900 dark:ring-slate-800"
            >
              {toolTitle(t)}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
