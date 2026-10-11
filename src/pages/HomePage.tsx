import {
  Cpu,
  Crown,
  FileText,
  Image as ImageIcon,
  Search,
  ShieldCheck,
  Sparkles,
  Wand2,
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
    <div className="relative space-y-20">
      {/* Ambient AI Aurora Background Lights */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 -z-10 size-[650px] max-w-full rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-cyan-400/20 blur-3xl animate-aurora pointer-events-none" />
      <div className="absolute top-96 -left-32 -z-10 size-[400px] rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-96 -right-32 -z-10 size-[400px] rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl text-center space-y-6 pt-2">
        {/* Futuristic AI Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-4 py-1.5 text-xs font-bold text-indigo-900 shadow-sm backdrop-blur-md dark:border-indigo-800/60 dark:bg-slate-900/80 dark:text-indigo-300">
          <span className="flex size-2 rounded-full bg-indigo-500 animate-ping" />
          <Sparkles className="size-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Next-Gen AI Document & Image Suite 2.0</span>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            5 Kredit Gratis
          </span>
        </div>

        {/* Dynamic AI Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 dark:text-white leading-[1.15]">
          Alat PDF & Gambar Pintar <br />
          <span className="ai-gradient-text">
            Semua Dalam Satu Platform
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Manipulasi matriks gambar, gabungkan PDF, kompresi cerdas tanpa penurunan visual, potong rasio, dan hilangkan watermark instan 100% langsung di peramban Anda.
        </p>

        {/* Dropzone Container with AI glow border */}
        <div className="mt-8 text-left max-w-3xl mx-auto rounded-3xl p-1 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-cyan-500/30 shadow-xl shadow-indigo-500/5 backdrop-blur-sm">
          <div className="rounded-[22px] bg-white dark:bg-slate-900 overflow-hidden">
            <Dropzone onFile={start} onCancel={cancel} />
          </div>
        </div>
      </section>

      {/* Futuristic AI Badges */}
      <section className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 max-w-5xl mx-auto">
        {[
          { icon: Cpu, label: 'Mesin Neural Lokal', desc: 'Pemrosesan instan 0 latency di browser Anda' },
          { icon: ShieldCheck, label: 'Zero-Knowledge Privacy', desc: 'Berkas tidak disimpan di server pihak ketiga' },
          { icon: Wand2, label: 'Manipulasi Cerdas', desc: 'Presisi piksel tinggi & kompresi cerdas' },
          { icon: Crown, label: 'Akses Seumur Hidup', desc: 'Sekali bayar untuk semua alat selamanya' },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="group relative rounded-2xl glass-ai-card p-4 text-center ring-1 ring-slate-200/80 transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-indigo-400 dark:ring-slate-800 dark:hover:ring-indigo-500"
          >
            <div className="mx-auto grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Icon className="size-5" />
            </div>
            <p className="mt-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{label}</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{desc}</p>
          </div>
        ))}
      </section>

      {/* Tools Section with Kind Tabs, Category Filter and Search */}
      <section className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="size-5 text-indigo-600 dark:text-indigo-400" />
              Koleksi Alat Lengkap
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">Pilih alat yang Anda butuhkan untuk mengelola gambar dan dokumen PDF</p>
          </div>

          {/* Search bar with AI glow */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari alat (mis. kompres, resize, watermark)..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs sm:text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
            />
          </div>
        </div>

        {/* Primary Type Switcher (All / Gambar / PDF) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleKindChange('all')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all',
              activeKind === 'all'
                ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900'
                : 'bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800'
            )}
          >
            <Sparkles className="size-3.5" /> Semua Alat ({ALL_TOOLS.length})
          </button>

          <button
            type="button"
            onClick={() => handleKindChange('image')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all',
              activeKind === 'image'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300'
            )}
          >
            <ImageIcon className="size-3.5" /> 🖼️ Alat Gambar ({imageCount})
          </button>

          <button
            type="button"
            onClick={() => handleKindChange('pdf')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all',
              activeKind === 'pdf'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300'
            )}
          >
            <FileText className="size-3.5" /> 📄 Alat PDF ({pdfCount})
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
          <div className="rounded-3xl border border-dashed border-slate-200 py-16 text-center text-slate-500 dark:border-slate-800">
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
                  className="group relative flex flex-col justify-between rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/10 hover:ring-indigo-400 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-indigo-500"
                >
                  <div className="flex items-start justify-between">
                    <div className={cn('grid size-12 place-items-center rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-2 shadow-sm', tool.color)}>
                      <Icon className="size-6" />
                    </div>
                    {tool.badge && (
                      <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700 ring-1 ring-indigo-200/50 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-800">
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
                  <div className="mt-4 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      {tool.kind === 'image' ? '🖼️ Gambar' : '📄 PDF'}
                    </span>
                    <span className="opacity-0 transition-all transform translate-x-1 group-hover:opacity-100 group-hover:translate-x-0">
                      Buka alat →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Lifetime Deal Promo Banner with AI-Styled Glow */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 p-8 sm:p-12 text-white shadow-2xl shadow-indigo-500/15 max-w-6xl mx-auto">
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-extrabold backdrop-blur-md">
              <Crown className="size-3.5 text-amber-200" /> PROMO SPESIAL • SEKALI BAYAR RP 149.000
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Akses Tanpa Batas Seumur Hidup!
            </h2>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
              Dapatkan akses tanpa batas ke semua 30+ alat PDF dan Gambar. Batas file hingga 2 GB, proses batch tanpa batas, bebas iklan, dan gratis semua pembaruan fitur baru di masa depan.
            </p>
          </div>
          <Link
            to="/pricing"
            className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-extrabold text-slate-900 shadow-xl hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"
          >
            <Crown className="size-4 text-amber-500" /> Beli Akses Seumur Hidup
          </Link>
        </div>
      </section>
    </div>
  )
}
