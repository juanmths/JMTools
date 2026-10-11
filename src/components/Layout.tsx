import { ChevronDown, Layers, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { ALL_TOOLS, CATEGORIES } from '../lib/pdfTools'
import { cn } from '../lib/utils'

const YEAR = new Date().getFullYear()

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
  )

function ToolsMenu() {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
        Semua Alat <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute left-1/2 -translate-x-1/2 z-40 mt-2 w-[720px] max-h-[540px] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="grid grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const tools = ALL_TOOLS.filter((t) => t.category === cat.id)
            if (!tools.length) return null
            return (
              <div key={cat.id} className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {cat.title}
                </p>
                <ul className="space-y-1">
                  {tools.map((tool) => {
                    const Icon = tool.icon
                    return (
                      <li key={tool.id}>
                        <Link
                          to={tool.route}
                          className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
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
            <ToolsMenu />
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
            <div className="space-y-4">
              {CATEGORIES.map((cat) => {
                const tools = ALL_TOOLS.filter((t) => t.category === cat.id)
                return (
                  <div key={cat.id}>
                    <p className="px-2 pb-1 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {cat.title}
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {tools.map((tool) => {
                        const Icon = tool.icon
                        return (
                          <NavLink
                            key={tool.id}
                            to={tool.route}
                            className="flex items-center gap-2 rounded-lg p-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <div className={cn('grid size-5 shrink-0 place-items-center rounded-md', tool.color)}>
                              <Icon className="size-3" />
                            </div>
                            <span className="truncate">{tool.title}</span>
                          </NavLink>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex border-t border-slate-200 pt-3 dark:border-slate-800">
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

      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {YEAR} JMTools · Solusi Dokumen & PDF Cepat, Aman, dan Gratis</p>
          <div className="flex items-center gap-4">
            <Link to="/tools/merge-pdf" className="hover:underline">Gabungkan PDF</Link>
            <Link to="/tools/add-watermark" className="hover:underline">Watermark</Link>
            <Link to="/tools/compress-pdf" className="hover:underline">Kompres PDF</Link>
            <Link to="/privacy" className="hover:underline">Kebijakan Privasi</Link>
          </div>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  )
}
