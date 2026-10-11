import { ChevronDown, FileText, Image as ImageIcon, Layers, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { ALL_TOOLS, CATEGORIES } from '../lib/pdfTools'
import { cn } from '../lib/utils'

const YEAR = new Date().getFullYear()

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
  )

function PdfToolsMenu() {
  const pdfCategories = CATEGORIES.filter((c) => c.kind === 'pdf')
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
        <FileText className="size-4 text-rose-500" />
        <span>Alat PDF</span>
        <ChevronDown className="size-3.5 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute left-0 z-40 mt-2 w-[720px] max-h-[540px] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Koleksi Alat PDF (iLovePDF)</p>
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">100% Gratis</span>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {pdfCategories.map((cat) => {
            const tools = ALL_TOOLS.filter((t) => t.category === cat.id)
            if (!tools.length) return null
            return (
              <div key={cat.id} className="space-y-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {cat.title}
                </p>
                <ul className="space-y-1">
                  {tools.map((tool) => {
                    const Icon = tool.icon
                    return (
                      <li key={tool.id}>
                        <Link
                          to={tool.route}
                          className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                        >
                          <div className={cn('grid size-6 shrink-0 place-items-center rounded-lg', tool.color)}>
                            <Icon className="size-3.5" />
                          </div>
                          <span className="truncate">{tool.title}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </details>
  )
}

function ImageToolsMenu() {
  const imgCategories = CATEGORIES.filter((c) => c.kind === 'image')
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400">
        <ImageIcon className="size-4 text-blue-500" />
        <span>Alat Gambar</span>
        <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          Baru
        </span>
        <ChevronDown className="size-3.5 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute left-0 z-40 mt-2 w-[560px] max-h-[540px] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Koleksi Alat Gambar (iLoveIMG)</p>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Cepat & Ringan</span>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {imgCategories.map((cat) => {
            const tools = ALL_TOOLS.filter((t) => t.category === cat.id)
            if (!tools.length) return null
            return (
              <div key={cat.id} className="space-y-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {cat.title}
                </p>
                <ul className="space-y-1">
                  {tools.map((tool) => {
                    const Icon = tool.icon
                    return (
                      <li key={tool.id}>
                        <Link
                          to={tool.route}
                          className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                        >
                          <div className={cn('grid size-6 shrink-0 place-items-center rounded-lg', tool.color)}>
                            <Icon className="size-3.5" />
                          </div>
                          <span className="truncate">{tool.title}</span>
                          {tool.badge && (
                            <span className="ml-auto text-[9px] font-bold text-blue-600 dark:text-blue-400">
                              {tool.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </details>
  )
}

export function Layout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">
        Lewati ke konten
      </a>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-lg">
            <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <Layers className="size-5" />
            </span>
            JMTools
          </Link>
          {/* key resets <details> open state on navigation */}
          <nav key={location.pathname} className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
            <PdfToolsMenu />
            <ImageToolsMenu />
            <NavLink to="/convert" className={navLink}>
              Konversi Bebas
            </NavLink>
            <NavLink to="/faq" className={navLink}>
              FAQ
            </NavLink>
            <NavLink to="/privacy" className={navLink}>
              Privasi
            </NavLink>
          </nav>
          <button
            type="button"
            className="rounded-lg p-2 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {mobileOpen && (
          <nav id="mobile-nav" className="border-t border-slate-200 px-4 py-4 max-h-[80vh] overflow-y-auto md:hidden dark:border-slate-800" aria-label="Navigasi utama" onClick={() => setMobileOpen(false)}>
            <div className="space-y-6">
              {/* Gambar Tools */}
              <div>
                <p className="flex items-center gap-1.5 px-2 pb-2 text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  <ImageIcon className="size-3.5" /> Alat Gambar (iLoveIMG)
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {ALL_TOOLS.filter((t) => t.kind === 'image').map((tool) => {
                    const Icon = tool.icon
                    return (
                      <NavLink
                        key={tool.id}
                        to={tool.route}
                        className="flex items-center gap-2 rounded-xl p-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <div className={cn('grid size-6 shrink-0 place-items-center rounded-lg', tool.color)}>
                          <Icon className="size-3.5" />
                        </div>
                        <span className="truncate">{tool.title}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </div>

              {/* PDF Tools */}
              <div>
                <p className="flex items-center gap-1.5 px-2 pb-2 text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  <FileText className="size-3.5" /> Alat PDF (iLovePDF)
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {ALL_TOOLS.filter((t) => t.kind === 'pdf').map((tool) => {
                    const Icon = tool.icon
                    return (
                      <NavLink
                        key={tool.id}
                        to={tool.route}
                        className="flex items-center gap-2 rounded-xl p-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <div className={cn('grid size-6 shrink-0 place-items-center rounded-lg', tool.color)}>
                          <Icon className="size-3.5" />
                        </div>
                        <span className="truncate">{tool.title}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="mt-4 flex border-t border-slate-200 pt-3 dark:border-slate-800">
              <NavLink to="/convert" className={navLink}>
                Konversi Bebas
              </NavLink>
              <NavLink to="/faq" className={navLink}>
                FAQ
              </NavLink>
              <NavLink to="/privacy" className={navLink}>
                Privasi
              </NavLink>
            </div>
          </nav>
        )}
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>© {YEAR} JMTools. Alat pengolah PDF dan optimasi gambar online gratis tanpa batas.</p>
          <div className="flex gap-4">
            <Link to="/faq" className="hover:underline">
              FAQ
            </Link>
            <Link to="/privacy" className="hover:underline">
              Privasi
            </Link>
            <Link to="/tools/compress-image" className="hover:underline">
              Kompres Gambar
            </Link>
            <Link to="/tools/merge-pdf" className="hover:underline">
              Gabungkan PDF
            </Link>
          </div>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  )
}
