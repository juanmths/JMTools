import {
  ChevronDown,
  Crown,
  FileText,
  Image as ImageIcon,
  Layers,
  LogOut,
  Menu,
  User as UserIcon,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { ALL_TOOLS, CATEGORIES } from '../lib/pdfTools'
import { useAuth } from '../lib/authStore'
import { usePremium } from '../lib/premiumStore'
import { cn } from '../lib/utils'
import { AuthModal } from './AuthModal'
import { CreditsBadge } from './CreditsBadge'
import { OutOfCreditsModal } from './OutOfCreditsModal'

const YEAR = new Date().getFullYear()

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
    isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
  )

function PdfToolsMenu() {
  const pdfCategories = CATEGORIES.filter((c) => c.kind === 'pdf')
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
        <FileText className="size-4 text-rose-500" />
        <span>Alat PDF</span>
        <ChevronDown className="size-3.5 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute left-0 z-40 mt-2 w-[720px] max-h-[540px] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Koleksi Alat PDF (iLovePDF)</p>
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">100% Gratis & Cepat</span>
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
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400">
        <ImageIcon className="size-4 text-blue-500" />
        <span>Alat Gambar</span>
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
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const premium = usePremium()
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">
        Lewati ke konten
      </a>

      {/* Global Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <OutOfCreditsModal />

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-lg">
            <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <Layers className="size-5" />
            </span>
            JMTools
          </Link>

          {/* Desktop Navigation */}
          <nav key={location.pathname} className="hidden items-center gap-1.5 md:flex" aria-label="Navigasi utama">
            <PdfToolsMenu />
            <ImageToolsMenu />
            <NavLink to="/convert" className={navLink}>
              Konversi Bebas
            </NavLink>
            <NavLink to="/pricing" className={navLink}>
              Harga
            </NavLink>

            {/* Credits Counter Badge */}
            <CreditsBadge />

            {/* User Account / Login Button */}
            {isAuthenticated ? (
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="size-5 rounded-full object-cover" />
                  ) : (
                    <div className="grid size-5 place-items-center rounded-full bg-indigo-600 text-[10px] text-white">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="truncate max-w-[100px]">{user?.name}</span>
                  <ChevronDown className="size-3 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="absolute right-0 z-40 mt-2 w-56 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 text-xs space-y-2">
                  <div className="border-b border-slate-100 pb-2 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/pricing"
                    className="flex items-center gap-2 rounded-xl p-2 font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Crown className="size-4 text-amber-500" />
                    <span>Status Langganan</span>
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full flex items-center gap-2 rounded-xl p-2 font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                  >
                    <LogOut className="size-4" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              </details>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <UserIcon className="size-3.5" />
                <span>Masuk</span>
              </button>
            )}

            {/* Pro Status / Upgrade CTA */}
            {premium.isPro ? (
              <Link
                to="/pricing"
                className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800"
              >
                <Crown className="size-3.5 text-amber-600" />
                <span>Member Pro</span>
              </Link>
            ) : (
              <Link
                to="/pricing"
                className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                <Crown className="size-3.5 text-white" />
                <span>Seumur Hidup (Rp149rb)</span>
              </Link>
            )}
          </nav>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <CreditsBadge />
            <button
              type="button"
              className="rounded-lg p-2 text-slate-700 dark:text-slate-200"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <nav id="mobile-nav" className="border-t border-slate-200 px-4 py-4 max-h-[85vh] overflow-y-auto md:hidden dark:border-slate-800" aria-label="Navigasi utama" onClick={() => setMobileOpen(false)}>
            {/* User Session Bar */}
            <div className="mb-4">
              {isAuthenticated ? (
                <div className="flex items-center justify-between rounded-2xl bg-slate-100 p-3 text-xs dark:bg-slate-800">
                  <div className="flex items-center gap-2.5">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="size-7 rounded-full object-cover" />
                    ) : (
                      <div className="grid size-7 place-items-center rounded-full bg-indigo-600 text-xs text-white font-bold">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{user?.name}</p>
                      <p className="text-[10px] text-slate-500">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="text-rose-600 text-xs font-bold hover:underline"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-sm dark:bg-white dark:text-slate-900"
                >
                  <UserIcon className="size-4" /> Masuk / Daftar Akun (5 Kredit Gratis)
                </button>
              )}
            </div>

            {/* Mobile Pro CTA Banner */}
            <div className="mb-4">
              {premium.isPro ? (
                <div className="flex items-center justify-between rounded-xl bg-amber-500/10 p-3 text-xs font-bold text-amber-800 ring-1 ring-amber-500/20 dark:bg-amber-950/40 dark:text-amber-200">
                  <span className="flex items-center gap-2">
                    <Crown className="size-4 text-amber-600" /> Akun Pro Aktif ({premium.expiresAt})
                  </span>
                </div>
              ) : (
                <Link
                  to="/pricing"
                  className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 p-3 text-xs font-extrabold text-white shadow-md"
                >
                  <span className="flex items-center gap-2">
                    <Crown className="size-4" /> Dapatkan Akses Seumur Hidup
                  </span>
                  <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px]">Rp 149.000</span>
                </Link>
              )}
            </div>

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

            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
              <NavLink to="/pricing" className={navLink}>
                👑 Paket & Harga
              </NavLink>
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
          <p>© {YEAR} JMTools. Alat pengolah PDF dan optimasi gambar online.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/pricing" className="font-bold text-amber-600 hover:underline">
              👑 Paket Seumur Hidup
            </Link>
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
