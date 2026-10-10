import { ChevronDown, Layers, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { FILE_TTL_MS, POPULAR_TOOLS, toolSlug, toolTitle } from '../lib/formats'
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
      <div className="absolute right-0 z-40 mt-2 w-64 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-200 md:left-0 dark:bg-slate-900 dark:ring-slate-800">
        {(['Gambar', 'Dokumen'] as const).map((group) => (
          <div key={group} className="py-1">
            <p className="px-3 py-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">{group}</p>
            {POPULAR_TOOLS.filter((t) => (group === 'Gambar') === !['pdf', 'docx'].includes(t.from)).map((t) => (
              <Link key={toolSlug(t)} to={`/tools/${toolSlug(t)}`} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                {toolTitle(t)}
              </Link>
            ))}
          </div>
        ))}
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
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
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
          <nav id="mobile-nav" className="border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800" aria-label="Navigasi utama" onClick={() => setMobileOpen(false)}>
            <p className="px-3 pb-1 text-xs font-semibold text-slate-400 uppercase">Alat</p>
            <div className="grid grid-cols-2">
              {POPULAR_TOOLS.map((t) => (
                <NavLink key={toolSlug(t)} to={`/tools/${toolSlug(t)}`} className={navLink}>
                  {toolTitle(t)}
                </NavLink>
              ))}
            </div>
            <div className="mt-2 flex border-t border-slate-200 pt-2 dark:border-slate-800">
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

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800">
        © {YEAR} JMTools · Semua berkas dihapus otomatis setelah {FILE_TTL_MS / 60000} menit ·{' '}
        <Link to="/privacy" className="underline">
          Kebijakan Privasi
        </Link>
      </footer>
      <ScrollRestoration />
    </div>
  )
}
