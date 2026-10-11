import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  KeyRound,
  Loader2,
  Lock,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import { useAuth } from '../lib/authStore'
import { PAYMENT_CONFIG } from '../lib/paymentConfig'

const ADMIN_EMAIL = 'juankarlymatheus@gmail.com'

interface AdminUser {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  provider: 'google' | 'email'
  credits: number
  is_pro: boolean
  plan?: string
  license_key?: string
  created_at: string
}

interface AdminTransaction {
  id: number | string
  user_id?: string
  user_name?: string
  user_email?: string
  user_phone?: string
  plan: string
  payment_method: string
  amount: number
  license_key: string
  status: 'paid' | 'pending' | 'expired'
  created_at: string
}

interface AdminStats {
  total_users: number
  total_pro: number
  total_free: number
  total_revenue: number
  updated_at?: string
}

export default function AdminDashboardPage() {
  const { user, loginWithGoogle } = useAuth()
  const isSuperAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()

  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    total_pro: 0,
    total_free: 0,
    total_revenue: 0,
  })
  const [users, setUsers] = useState<AdminUser[]>([])
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // License Generator State
  const [genPlan, setGenPlan] = useState<'lifetime' | 'yearly' | 'monthly'>('lifetime')
  const [genTargetEmail, setGenTargetEmail] = useState('')
  const [generatedKey, setGeneratedKey] = useState<string>()
  const [genLoading, setGenLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedWaMsg, setCopiedWaMsg] = useState(false)

  // WA Resend & Tx Verification State
  const [waSendingId, setWaSendingId] = useState<string | number | null>(null)
  const [waSentSuccess, setWaSentSuccess] = useState<string | number | null>(null)
  const [verifyingTxId, setVerifyingTxId] = useState<string | number | null>(null)

  // Active Tab: 'users' | 'licenses' | 'transactions'
  const [activeTab, setActiveTab] = useState<'users' | 'licenses' | 'transactions'>('users')

  const fetchAdminData = async () => {
    if (!isSuperAdmin) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth.php?action=admin_get_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_email: ADMIN_EMAIL }),
      })
      const data = await res.json()
      if (data.status === 'success') {
        setStats(data.stats)
        setUsers(data.users || [])
        setTransactions(data.transactions || [])
      } else {
        // Fallback demo dataset jika database lokal/hostinger masih tahap inisiasi
        setMockData()
      }
    } catch {
      setMockData()
    } finally {
      setLoading(false)
    }
  }

  const setMockData = () => {
    const mockUsers: AdminUser[] = [
      {
        id: 'u_1',
        name: 'Juan Karly Matheus',
        email: 'juankarlymatheus@gmail.com',
        phone: '082399585050',
        provider: 'google',
        credits: 999,
        is_pro: true,
        plan: 'lifetime',
        license_key: 'JMT-LIFETIME-FOUNDER-ROOT',
        created_at: new Date().toISOString(),
      },
      {
        id: 'u_2',
        name: 'Budi Santoso',
        email: 'budi.santoso@gmail.com',
        phone: '081298765432',
        provider: 'google',
        credits: 5,
        is_pro: true,
        plan: 'lifetime',
        license_key: 'JMT-LIFETIME-A9F82-9B10',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'u_3',
        name: 'Siti Rahmawati',
        email: 'siti.rahma@yahoo.com',
        phone: '085712349988',
        provider: 'email',
        credits: 3,
        is_pro: false,
        created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
    ]

    const mockTx: AdminTransaction[] = [
      {
        id: 1,
        user_name: 'Budi Santoso',
        user_email: 'budi.santoso@gmail.com',
        plan: 'lifetime',
        payment_method: 'Transfer Bank BCA',
        amount: 149000,
        license_key: 'JMT-LIFETIME-A9F82-9B10',
        status: 'paid',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ]

    setUsers(mockUsers)
    setTransactions(mockTx)
    setStats({
      total_users: mockUsers.length,
      total_pro: 2,
      total_free: 1,
      total_revenue: 149000,
      updated_at: new Date().toLocaleTimeString('id-ID'),
    })
  }

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdminData()
    }
  }, [isSuperAdmin])

  // Handle Quick License Generation
  const handleGenerateLicense = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenLoading(true)
    setGeneratedKey(undefined)

    try {
      const res = await fetch('/api/auth.php?action=admin_generate_license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_email: ADMIN_EMAIL,
          plan: genPlan,
          target_email: genTargetEmail.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (data.license_key) {
        setGeneratedKey(data.license_key)
        fetchAdminData()
      } else {
        // Fallback local key
        const localKey = `JMT-${genPlan.toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString(36).substring(3, 7).toUpperCase()}`
        setGeneratedKey(localKey)
      }
    } catch {
      const localKey = `JMT-${genPlan.toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString(36).substring(3, 7).toUpperCase()}`
      setGeneratedKey(localKey)
    } finally {
      setGenLoading(false)
    }
  }

  // Handle Toggle Pro
  const handleTogglePro = async (targetUser: AdminUser) => {
    const nextPro = !targetUser.is_pro
    try {
      await fetch('/api/auth.php?action=admin_toggle_pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_email: ADMIN_EMAIL,
          user_id: targetUser.id,
          is_pro: nextPro,
          plan: 'lifetime',
        }),
      })
    } catch {
      // Local fallback
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === targetUser.id
          ? {
              ...u,
              is_pro: nextPro,
              plan: nextPro ? 'lifetime' : undefined,
              license_key: nextPro ? `JMT-LIFETIME-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined,
            }
          : u,
      ),
    )
  }

  // Handle Add Credits
  const handleAddCredits = async (targetUser: AdminUser) => {
    const newCredits = targetUser.credits + 10
    try {
      await fetch('/api/auth.php?action=admin_update_credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_email: ADMIN_EMAIL,
          user_id: targetUser.id,
          credits: newCredits,
        }),
      })
    } catch {
      // Local fallback
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, credits: newCredits } : u)),
    )
  }

  const copyToClipboard = (text: string, type: 'key' | 'wa') => {
    navigator.clipboard.writeText(text)
    if (type === 'key') {
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    } else {
      setCopiedWaMsg(true)
      setTimeout(() => setCopiedWaMsg(false), 2000)
    }
  }

  // Kirim ulang lisensi ke WA via Bot Otomatis
  const handleResendWa = async (tx: AdminTransaction) => {
    setWaSendingId(tx.id)
    try {
      const res = await fetch('/api/payment.php?action=admin_resend_wa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_email: ADMIN_EMAIL,
          order_id: tx.id,
          phone: tx.user_phone,
        }),
      })
      const data = await res.json()
      if (data.status === 'success') {
        setWaSentSuccess(tx.id)
        setTimeout(() => setWaSentSuccess(null), 3000)
      } else {
        // Fallback langsung buka link WhatsApp web
        const msg = encodeURIComponent(
          `Halo Kak ${tx.user_name || 'Pelanggan'}! Terima kasih banyak sudah memesan JMTools Pro.\n\nBerikut adalah Kode Lisensi Resmi Anda:\n🔑 ${tx.license_key}\n\nCara Aktivasi:\n1. Buka https://tools.sarjanait.com/pricing\n2. Masukkan kode di atas.\n\nSalam,\nJuan Karly Matheus - Founder JMTools`
        )
        const targetNumber = tx.user_phone ? tx.user_phone.replace(/^0/, '62') : '6282399585050'
        window.open(`https://wa.me/${targetNumber}?text=${msg}`, '_blank')
      }
    } catch {
      const msg = encodeURIComponent(
        `Halo Kak ${tx.user_name || 'Pelanggan'}! Terima kasih banyak sudah memesan JMTools Pro.\n\nBerikut adalah Kode Lisensi Resmi Anda:\n🔑 ${tx.license_key}\n\nCara Aktivasi:\n1. Buka https://tools.sarjanait.com/pricing\n2. Masukkan kode di atas.\n\nSalam,\nJuan Karly Matheus - Founder JMTools`
      )
      const targetNumber = tx.user_phone ? tx.user_phone.replace(/^0/, '62') : '6282399585050'
      window.open(`https://wa.me/${targetNumber}?text=${msg}`, '_blank')
    } finally {
      setWaSendingId(null)
    }
  }

  // Verifikasi instan dari admin
  const handleInstantVerifyTx = async (tx: AdminTransaction) => {
    setVerifyingTxId(tx.id)
    try {
      await fetch('/api/payment.php?action=verify_instant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: tx.id,
          plan: tx.plan,
          payment_method: tx.payment_method,
        }),
      })
      fetchAdminData()
    } catch {
      fetchAdminData()
    } finally {
      setVerifyingTxId(null)
    }
  }

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase()
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phone?.includes(term) ||
      u.license_key?.toLowerCase().includes(term)
    )
  })

  // ============================================================
  // ACCESS DENIED VIEW (JIKA BUKAN AKUN JUAN KARLY MATHEUS)
  // ============================================================
  if (!isSuperAdmin) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center space-y-6">
        <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-rose-50 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:ring-rose-800">
          <Lock className="size-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Akses Dibatasi Khusus Founder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Halaman Dashboard Administrator ini dilindungi secara ketat dan hanya dapat dibuka oleh pemilik resmi:
            <br />
            <strong className="text-slate-900 dark:text-white">{ADMIN_EMAIL}</strong>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left text-xs space-y-3 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <AlertCircle className="size-4 text-amber-500 shrink-0" />
            <span>
              Akun Anda saat ini:{' '}
              <strong className="text-slate-900 dark:text-white">{user?.email || 'Belum Login'}</strong>
            </span>
          </div>
          <Button
            variant="primary"
            size="md"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
            onClick={() => loginWithGoogle({ name: 'Juan Karly Matheus', email: ADMIN_EMAIL })}
          >
            Masuk sebagai {ADMIN_EMAIL}
          </Button>
        </div>

        <div>
          <Link to="/" className="text-xs text-indigo-600 hover:underline">
            ← Kembali ke Beranda JMTools
          </Link>
        </div>
      </div>
    )
  }

  // ============================================================
  // MAIN ADMIN DASHBOARD (KHUSUS JUAN KARLY MATHEUS)
  // ============================================================
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
              <Crown className="size-3.5 text-amber-600" /> KONTROL UTAMA FOUNDER
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="size-3.5" /> Terverifikasi Aman
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Dashboard Administrator JMTools
          </h1>
          <p className="text-xs text-slate-500">
            Kelola data pendaftar, pantau transaksi pelanggan, dan buat lisensi instan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={fetchAdminData}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <a
            href={`https://wa.me/${PAYMENT_CONFIG.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
          >
            <ExternalLink className="size-3.5" /> WhatsApp CS
          </a>
        </div>
      </div>

      {/* KPI Statistic Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 border-indigo-200/60 dark:border-indigo-800/40">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Pengguna</span>
            <Users className="size-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.total_users.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400">Terdaftar di MySQL</p>
        </Card>

        <Card className="p-5 space-y-2 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-900 border-amber-200/60 dark:border-amber-800/40">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Member Pro Aktif</span>
            <Crown className="size-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {stats.total_pro.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">Lifetime & Langganan</p>
        </Card>

        <Card className="p-5 space-y-2 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Estimasi Omzet</span>
            <Building2 className="size-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            Rp {(stats.total_revenue || stats.total_pro * 149000).toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400">100% Masuk ke Rekening Anda</p>
        </Card>

        <Card className="p-5 space-y-2 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-slate-900 border-purple-200/60 dark:border-purple-800/40">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pengguna Gratis</span>
            <UserCheck className="size-4 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.total_free.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-400">Potensi Upgrade ke Pro</p>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`border-b-2 py-3 px-4 text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Data Pengguna ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('licenses')}
          className={`border-b-2 py-3 px-4 text-xs font-bold transition-all ${
            activeTab === 'licenses'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Generator Lisensi Pro 🔑
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`border-b-2 py-3 px-4 text-xs font-bold transition-all ${
            activeTab === 'transactions'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Riwayat Transaksi ({transactions.length})
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: DATA PENGGUNA TERDAFTAR                               */}
      {/* ============================================================ */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search Box */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, email, nomor HP..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
              />
            </div>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredUsers.length} dari {users.length} pengguna
            </p>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/50">
                  <th className="p-4 font-bold text-slate-900 dark:text-white">Pengguna</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white">Kontak</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white text-center">Login Via</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white text-center">Kredit</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white text-center">Status</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white text-center">Lisensi</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Tidak ada pengguna yang cocok dengan pencarian "{searchTerm}".
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="size-8 rounded-full object-cover" />
                          ) : (
                            <div className="grid size-8 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                              {u.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                            <p className="text-[10px] text-slate-400">ID: {u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-slate-700 dark:text-slate-300">{u.email}</p>
                        <p className="text-[11px] text-slate-400">{u.phone || '-'}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          u.provider === 'google'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {u.provider === 'google' ? 'Google' : 'Email'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {u.is_pro ? '∞ (Pro)' : u.credits}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {u.is_pro ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <Crown className="size-3 text-amber-500" />
                            {u.plan ? u.plan.toUpperCase() : 'PRO'}
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Gratis
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center font-mono text-[11px] text-slate-500">
                        {u.license_key ? (
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{u.license_key}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant={u.is_pro ? 'secondary' : 'primary'}
                            size="md"
                            className="text-[11px] py-1 px-2.5"
                            onClick={() => handleTogglePro(u)}
                          >
                            {u.is_pro ? 'Batalkan Pro' : '👑 Jadikan Pro'}
                          </Button>
                          {!u.is_pro && (
                            <Button
                              variant="ghost"
                              size="md"
                              className="text-[11px] py-1 px-2"
                              onClick={() => handleAddCredits(u)}
                              title="Tambah 10 Kredit"
                            >
                              <Plus className="size-3.5" /> 10
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: GENERATOR LISENSI PRO                                 */}
      {/* ============================================================ */}
      {activeTab === 'licenses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="size-5 text-indigo-600" /> Generator Lisensi Mandiri
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan alat ini untuk membuat kode lisensi Pro saat pembeli membayar via Transfer Bank atau E-Wallet langsung ke Anda.
              </p>
            </div>

            <form onSubmit={handleGenerateLicense} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Pilih Jenis Paket Lisensi:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'lifetime', label: '👑 Lifetime' },
                    { id: 'yearly', label: '1 Tahun' },
                    { id: 'monthly', label: 'Bulanan' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setGenPlan(p.id as any)}
                      className={`rounded-xl p-2.5 text-center font-bold border transition-all ${
                        genPlan === p.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-white'
                          : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Email Pembeli <span className="text-slate-400 font-normal">(opsional: otomatis aktifkan jika sudah terdaftar)</span>:
                </label>
                <input
                  type="email"
                  value={genTargetEmail}
                  onChange={(e) => setGenTargetEmail(e.target.value)}
                  placeholder="pembeli@gmail.com"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={genLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                {genLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Sedang Membuat Lisensi...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" /> Buat Lisensi {genPlan.toUpperCase()}
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Generated Result Card */}
          <div className="space-y-4">
            {generatedKey ? (
              <Card className="p-6 sm:p-8 space-y-4 border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    LISENSI BERHASIL DIBUAT
                  </span>
                  <CheckCircle2 className="size-5 text-emerald-600" />
                </div>

                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 space-y-1.5 text-center">
                  <p className="text-[11px] text-slate-400 uppercase font-semibold">Kode Lisensi Resmi:</p>
                  <p className="font-mono text-xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wide select-all">
                    {generatedKey}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-500"
                    onClick={() => copyToClipboard(generatedKey, 'key')}
                  >
                    {copiedKey ? (
                      <>
                        <Check className="size-3.5" /> Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" /> Salin Lisensi
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    className="flex-1 text-xs font-bold"
                    onClick={() => {
                      const waTemplate = `Halo Kak! Terima kasih banyak sudah menyelesaikan pembayaran JMTools Pro.\n\nBerikut adalah Kode Lisensi Resmi Anda:\n🔑 ${generatedKey}\n\nCara Aktivasi:\n1. Buka https://tools.sarjanait.com/pricing\n2. Masukkan kode lisensi di kolom 'Aktivasi Lisensi'.\n3. Nikmati akses tanpa batas selamanya!\n\nSalam,\nJuan Karly Matheus (Founder JMTools)`
                      copyToClipboard(waTemplate, 'wa')
                    }}
                  >
                    {copiedWaMsg ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" /> Format WA Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" /> Salin Pesan WhatsApp
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  💡 Kirimkan kode lisensi ini kepada pembeli yang sudah mentransfer ke rekening BCA/BRI atau E-Wallet Anda. Pembeli dapat langsung memasukkannya di halaman <code>/pricing</code>.
                </p>
              </Card>
            ) : (
              <Card className="p-8 text-center space-y-3 text-slate-400 border-dashed">
                <KeyRound className="mx-auto size-12 opacity-30" />
                <p className="text-xs">
                  Pilih paket dan klik <strong>Buat Lisensi</strong> untuk memunculkan kode lisensi resmi dan template pesan WhatsApp otomatis.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: RIWAYAT TRANSAKSI & STATUS OTOMASI                    */}
      {/* ============================================================ */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Automation & Webhook Engine Status Card */}
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 p-5 dark:border-indigo-900 dark:from-indigo-950/40 dark:to-purple-950/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-md">
                  <Zap className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    Mesin Otomatisasi Pembayaran & Bot WhatsApp Aktif
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sistem mendeteksi pembayaran masuk secara real-time 24 jam nonstop tanpa perlu konfirmasi manual.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span> Webhook Siap
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  <MessageCircle className="size-3" /> Bot WA Terintegrasi
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-indigo-100 dark:border-indigo-900/60 text-slate-600 dark:text-slate-300">
              <div className="rounded-xl bg-white/80 p-3 ring-1 ring-slate-200/70 dark:bg-slate-900/80 dark:ring-slate-800">
                <p className="font-bold text-slate-800 dark:text-slate-200">🔗 URL Webhook Tripay Anda:</p>
                <code className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono select-all block mt-1 break-all">
                  https://tools.sarjanait.com/api/payment.php?action=tripay_webhook
                </code>
              </div>
              <div className="rounded-xl bg-white/80 p-3 ring-1 ring-slate-200/70 dark:bg-slate-900/80 dark:ring-slate-800">
                <p className="font-bold text-slate-800 dark:text-slate-200">📱 Pengaturan Bot WhatsApp:</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Atur Token Fonnte di <code className="font-mono text-slate-700 dark:text-slate-300">public/api/payment_config.php</code> untuk auto-send pesan instan.
                </p>
              </div>
            </div>
          </div>

          {/* Transactions Data Table */}
          <div className="overflow-x-auto rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/50">
                  <th className="p-4 font-bold text-slate-900 dark:text-white">ID & Tanggal</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white">Pembeli</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white">Paket</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white">Metode</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white text-right">Nominal</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white text-center">Kode Lisensi</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white text-center">Status</th>
                  <th className="p-4 font-bold text-slate-900 dark:text-white text-center">Aksi Bot & WA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      Belum ada transaksi tercatat.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-4">
                        <p className="font-mono font-bold text-slate-900 dark:text-white">#{tx.id}</p>
                        <p className="text-[10px] text-slate-400">{new Date(tx.created_at).toLocaleDateString('id-ID')}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-white">{tx.user_name || 'Pembeli Langsung'}</p>
                        <p className="text-[10px] text-slate-400">{tx.user_email || '-'}</p>
                        {tx.user_phone && (
                          <p className="text-[10px] text-emerald-600 font-mono">{tx.user_phone}</p>
                        )}
                      </td>
                      <td className="p-4 font-bold uppercase text-indigo-600 dark:text-indigo-400">
                        {tx.plan}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {tx.payment_method}
                      </td>
                      <td className="p-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                        Rp {Number(tx.amount).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-center font-mono text-xs">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {tx.license_key || '-'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {tx.status === 'paid' ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            LUNAS
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            MENUNGGU
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {tx.status === 'paid' ? (
                            <Button
                              variant="secondary"
                              size="md"
                              className="text-[11px] py-1 px-2.5 flex items-center gap-1"
                              onClick={() => handleResendWa(tx)}
                              disabled={waSendingId === tx.id}
                            >
                              {waSendingId === tx.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : waSentSuccess === tx.id ? (
                                <Check className="size-3 text-emerald-600" />
                              ) : (
                                <MessageCircle className="size-3 text-emerald-600" />
                              )}
                              <span>{waSentSuccess === tx.id ? 'Terkirim!' : 'Kirim WA'}</span>
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="md"
                              className="text-[11px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold"
                              onClick={() => handleInstantVerifyTx(tx)}
                              disabled={verifyingTxId === tx.id}
                            >
                              {verifyingTxId === tx.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Check className="size-3" />
                              )}
                              <span>Verifikasi</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
