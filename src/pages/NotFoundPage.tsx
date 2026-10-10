import { Link } from 'react-router-dom'
import { buttonClass } from '../components/ui'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-6xl font-bold text-indigo-600">404</p>
      <h1 className="mt-4 text-xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-slate-500">Alat atau halaman yang Anda cari tidak tersedia.</p>
      <Link to="/" className={`${buttonClass('primary')} mt-6`}>
        Kembali ke beranda
      </Link>
    </div>
  )
}
