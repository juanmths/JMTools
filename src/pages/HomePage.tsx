import {
  FileCheck2,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../features/convert/Dropzone'
import { useLeaveGuard, useUpload } from '../features/convert/hooks'
import { useConvertStore } from '../features/convert/store'
import { ALL_TOOLS, CATEGORIES, type ToolCategory } from '../lib/pdfTools'
import { cn } from '../lib/utils'

export default function HomePage() {
  const { start, cancel } = useUpload()
  useLeaveGuard(useConvertStore((s) => !!s.upload))

  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTools = ALL_TOOLS.filter((t) => {
    const matchesCat = activeCategory === 'all' || t.category === activeCategory
    const matchesSearch =
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shortTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="mx-auto max-w-3xl text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-800">
          <Sparkles className="size-3.5" /> Koleksi Lengkap Alat PDF & Gambar Online
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 dark:text-white">
          Semua alat PDF dalam <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">satu tempat</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto">
          Gabungkan, pisahkan, kompres, edit, hapus watermark, dan konversi dokumen PDF Anda secara 100% gratis, aman, dan mudah.
        </p>

        {/* Quick Dropzone */}
        <div className="mt-8 text-left">
          <Dropzone onFile={start} onCancel={cancel} />
        </div>
      </section>

      {/* Value Badges */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Zap, label: 'Super Cepat', desc: 'Pemrosesan instan langsung di peramban' },
          { icon: ShieldCheck, label: 'Privasi Terjamin', desc: 'Berkas otomatis dibersihkan' },
          { icon: FileCheck2, label: '100% Gratis', desc: 'Tanpa batasan akun atau login' },
          { icon: Sparkles, label: 'Fitur Lengkap', desc: 'Merge, Edit, Watermark, & Kompres' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="rounded-2xl bg-white p-4 text-center ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <Icon className="mx-auto size-5 text-indigo-600 dark:text-indigo-400" />
            <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
          </div>
        ))}
      </section>

      {/* Tools Section with Category Filter and Search */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Jelajahi Semua Alat</h2>
            <p className="text-sm text-slate-500">Pilih alat yang Anda butuhkan untuk mengelola dokumen</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari alat (mis. gabungkan, watermark)..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Kategori Alat">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-semibold transition-all',
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800'
            )}
          >
            Semua Alat ({ALL_TOOLS.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'rounded-xl px-4 py-2 text-xs font-semibold transition-all',
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800'
              )}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Tools Grid (iLovePDF Style Cards) */}
        {filteredTools.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-500 dark:border-slate-800">
            <FileText className="mx-auto size-10 text-slate-300" />
            <p className="mt-3 font-medium">Alat tidak ditemukan</p>
            <p className="text-xs">Coba kata kunci pencarian yang lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredTools.map((tool) => {
              const Icon = tool.icon
              return (
                <Link
                  key={tool.id}
                  to={tool.route}
                  className="group relative flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-md hover:ring-indigo-400 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-indigo-500"
                >
                  {tool.badge && (
                    <span className="absolute right-4 top-4 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 ring-1 ring-indigo-200/50 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-800">
                      {tool.badge}
                    </span>
                  )}
                  <div>
                    <div className={cn('grid size-12 place-items-center rounded-xl transition-transform group-hover:scale-110', tool.color)}>
                      <Icon className="size-6" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                      {tool.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-indigo-400">
                    Buka alat →
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
