import {
  FileCheck2,
  FileText,
  Image as ImageIcon,
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
import { ALL_TOOLS, CATEGORIES, type ToolCategory, type ToolKind } from '../lib/pdfTools'
import { cn } from '../lib/utils'

export default function HomePage() {
  const { start, cancel } = useUpload()
  useLeaveGuard(useConvertStore((s) => !!s.upload))

  const [activeKind, setActiveKind] = useState<ToolKind | 'all'>('all')
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter categories based on activeKind
  const availableCategories = CATEGORIES.filter(
    (c) => activeKind === 'all' || c.kind === activeKind,
  )

  const filteredTools = ALL_TOOLS.filter((t) => {
    const matchesKind = activeKind === 'all' || t.kind === activeKind
    const matchesCat = activeCategory === 'all' || t.category === activeCategory
    const matchesSearch =
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shortTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesKind && matchesCat && matchesSearch
  })

  const imageCount = ALL_TOOLS.filter((t) => t.kind === 'image').length
  const pdfCount = ALL_TOOLS.filter((t) => t.kind === 'pdf').length

  const handleKindChange = (kind: ToolKind | 'all') => {
    setActiveKind(kind)
    setActiveCategory('all')
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="mx-auto max-w-3xl text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-800">
          <Sparkles className="size-3.5" /> Koleksi Lengkap Alat PDF & Gambar Online
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 dark:text-white">
          Alat PDF & Gambar dalam{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
            satu tempat
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto">
          Kompres gambar, ubah ukuran, potong foto, buat meme, gabungkan PDF, edit dokumen, dan hilangkan watermark secara 100% gratis, cepat, dan aman.
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
          { icon: ShieldCheck, label: 'Privasi Terjamin', desc: 'Berkas diproses aman tanpa bocor' },
          { icon: FileCheck2, label: '100% Gratis', desc: 'Tanpa batas harian atau registrasi' },
          { icon: Sparkles, label: 'Fitur Lengkap', desc: 'Alat PDF & Gambar dalam satu portal' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="rounded-2xl bg-white p-4 text-center ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <Icon className="mx-auto size-5 text-indigo-600 dark:text-indigo-400" />
            <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
          </div>
        ))}
      </section>

      {/* Tools Section with Kind Tabs, Category Filter and Search */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Jelajahi Koleksi Alat</h2>
            <p className="text-sm text-slate-500">Pilih alat yang Anda butuhkan untuk mengelola gambar dan dokumen PDF</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari alat (mis. kompres, resize, watermark)..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Primary Type Switcher (All / Gambar / PDF) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleKindChange('all')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all',
              activeKind === 'all'
                ? 'bg-slate-900 text-white shadow dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )}
          >
            <Sparkles className="size-4" /> Semua Alat ({ALL_TOOLS.length})
          </button>

          <button
            type="button"
            onClick={() => handleKindChange('image')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all',
              activeKind === 'image'
                ? 'bg-blue-600 text-white shadow dark:bg-blue-600'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/50'
            )}
          >
            <ImageIcon className="size-4" /> 🖼️ Alat Gambar ({imageCount})
          </button>

          <button
            type="button"
            onClick={() => handleKindChange('pdf')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all',
              activeKind === 'pdf'
                ? 'bg-rose-600 text-white shadow dark:bg-rose-600'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/50'
            )}
          >
            <FileText className="size-4" /> 📄 Alat PDF ({pdfCount})
          </button>
        </div>

        {/* Sub-Category Pills */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Kategori Alat">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={cn(
              'rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all',
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800'
            )}
          >
            Semua Subkategori
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all',
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800'
              )}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* Tools Grid (iLovePDF & iLoveIMG Style Cards) */}
        {filteredTools.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-500 dark:border-slate-800">
            <FileText className="mx-auto size-10 text-slate-300" />
            <p className="mt-3 font-medium">Alat tidak ditemukan</p>
            <p className="text-xs">Coba kata kunci pencarian yang lain atau ganti kategori.</p>
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
                  <div className="flex items-start justify-between">
                    <div className={cn('grid size-12 place-items-center rounded-xl transition-transform group-hover:scale-110', tool.color)}>
                      <Icon className="size-6" />
                    </div>
                    {tool.badge && (
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 ring-1 ring-indigo-200/50 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-800">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="mt-4 text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                      {tool.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      {tool.kind === 'image' ? '🖼️ Gambar' : '📄 PDF'}
                    </span>
                    <span className="opacity-0 transition-opacity group-hover:opacity-100">
                      Buka alat →
                    </span>
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
