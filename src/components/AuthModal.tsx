import { Check, Loader2, Lock, Mail, Phone, User as UserIcon, X } from 'lucide-react'
import { useState } from 'react'
import { loginWithEmail, loginWithGoogle, registerUser } from '../lib/authStore'
import { Button } from './ui'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string>()

  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()

  if (!isOpen) return null

  const handleGoogleLogin = () => {
    setGoogleLoading(true)
    setError(undefined)
    setTimeout(() => {
      loginWithGoogle()
      setGoogleLoading(false)
      setSuccessMsg('Berhasil masuk dengan Akun Google!')
      setTimeout(() => {
        onClose()
        setSuccessMsg(undefined)
      }, 1000)
    }, 800)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(undefined)

    if (!email.trim() || !password.trim()) {
      setError('Email dan kata sandi wajib diisi.')
      return
    }

    setLoading(true)

    setTimeout(() => {
      if (tab === 'login') {
        loginWithEmail(email.trim(), password)
        setSuccessMsg('Berhasil masuk ke akun Anda!')
      } else {
        if (!name.trim()) {
          setError('Nama lengkap wajib diisi.')
          setLoading(false)
          return
        }
        registerUser(name.trim(), email.trim(), phone.trim() || undefined, password)
        setSuccessMsg('Pendaftaran berhasil! Selamat datang di JMTools.')
      }

      setLoading(false)
      setTimeout(() => {
        onClose()
        setSuccessMsg(undefined)
      }, 1000)
    }, 700)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white/95 p-6 sm:p-8 shadow-2xl ring-1 ring-indigo-500/30 dark:bg-slate-900/95 dark:ring-indigo-500/40 glass-ai-card overflow-hidden">
        {/* Subtle AI Ambient Orb */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-40 rounded-full bg-cyan-500/15 blur-3xl" />
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <X className="size-5" />
        </button>

        {/* Modal Title & Tab Switcher */}
        <div className="text-center space-y-1 mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {tab === 'login' ? 'Masuk ke JMTools' : 'Daftar Akun Baru'}
          </h2>
          <p className="text-xs text-slate-500">
            Dapatkan 5 kredit pemrosesan gratis dan simpan riwayat berkas Anda.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-5 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              tab === 'login'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
              tab === 'register'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Daftar
          </button>
        </div>

        {successMsg ? (
          <div className="rounded-2xl bg-emerald-50 p-6 text-center text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 space-y-2">
            <Check className="mx-auto size-8 text-emerald-600" />
            <p className="font-bold text-sm">{successMsg}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1-Click Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-all"
            >
              {googleLoading ? (
                <Loader2 className="size-4 animate-spin text-slate-500" />
              ) : (
                /* Google G Multicolored Logo */
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Lanjutkan dengan Akun Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">atau dengan email</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            {error && (
              <p className="rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                {error}
              </p>
            )}

            {/* Super Simple Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {tab === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 size-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
              </div>

              {tab === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nomor WhatsApp / HP <span className="text-[10px] text-slate-400 font-normal">(opsional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 size-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kata Sandi (Password)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                type="submit"
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Memproses...
                  </>
                ) : tab === 'login' ? (
                  'Masuk Sekarang'
                ) : (
                  'Daftar Akun Gratis'
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
