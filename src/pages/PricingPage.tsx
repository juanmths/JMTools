import {
  Check,
  ChevronDown,
  Crown,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Card } from '../components/ui'
import { PRICING_FAQ, PRICING_PLANS } from '../lib/pricingData'
import { usePremium } from '../lib/premiumStore'

export default function PricingPage() {
  const premium = usePremium()
  const navigate = useNavigate()
  const [licenseInput, setLicenseInput] = useState('')
  const [licenseMsg, setLicenseMsg] = useState<{ type: 'success' | 'error'; text: string }>()

  const handleActivateLicense = (e: React.FormEvent) => {
    e.preventDefault()
    if (!licenseInput.trim()) return

    const key = licenseInput.trim().toUpperCase()
    if (key.startsWith('JMT-') || key.length >= 8) {
      premium.activate('lifetime', key)
      setLicenseMsg({
        type: 'success',
        text: 'Selamat! Lisensi Seumur Hidup berhasil diaktifkan.',
      })
      setLicenseInput('')
    } else {
      setLicenseMsg({
        type: 'error',
        text: 'Format lisensi tidak valid. Format: JMT-LIFETIME-XXXXXX',
      })
    }
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="mx-auto max-w-3xl text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800">
          <Crown className="size-3.5 text-amber-600" /> Penawaran Spesial Terbatas
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-slate-900 dark:text-white">
          Akses Lengkap Tanpa Batas,{' '}
          <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 bg-clip-text text-transparent">
            Sekali Bayar Seumur Hidup
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto">
          Tinggalkan batasan ukuran file dan antrean lambat. Dapatkan kecepatan maksimal, proses batch tak terbatas, dan semua alat PDF & Gambar dengan harga super terjangkau.
        </p>
      </section>

      {/* Active Pro Banner if user already subscribed */}
      {premium.isPro && (
        <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 p-1 shadow-lg">
          <div className="flex items-center justify-between rounded-xl bg-white p-5 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                <Crown className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Akun Pro Anda Sedang Aktif!
                </h3>
                <p className="text-xs text-slate-500">
                  Paket: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{premium.planName}</span> • Masa Berlaku: <span className="font-bold text-emerald-600">{premium.expiresAt}</span>
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
            >
              Gunakan Alat
            </Link>
          </div>
        </div>
      )}

      {/* 3 Pricing Cards */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-5xl mx-auto items-stretch">
        {PRICING_PLANS.map((plan) => {
          const isLifetime = plan.id === 'lifetime'
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all ${
                isLifetime
                  ? 'bg-gradient-to-b from-amber-500/10 via-white to-white ring-2 ring-amber-500 shadow-xl dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 dark:ring-amber-500 md:-translate-y-2'
                  : 'bg-white ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 hover:ring-indigo-300 shadow-sm'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  {plan.savings && (
                    <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                      {plan.savings}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-500 min-h-[32px]">
                  {plan.tagline}
                </p>

                {/* Pricing Area */}
                <div className="mt-4 border-b border-slate-100 pb-5 dark:border-slate-800">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-slate-400 line-through">
                      Rp {plan.originalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Rp</span>
                    <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {plan.discountPrice.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="mt-6 space-y-3 text-xs leading-relaxed">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className={`grid size-4 shrink-0 place-items-center rounded-full mt-0.5 ${
                        f.highlight ? 'bg-amber-500 text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        <Check className="size-2.5 stroke-[3]" />
                      </div>
                      <span className={f.highlight ? 'font-bold text-amber-900 dark:text-amber-200' : 'text-slate-600 dark:text-slate-300'}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <Button
                  variant={isLifetime ? 'primary' : 'secondary'}
                  size="lg"
                  className={`w-full font-bold ${
                    isLifetime
                      ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:opacity-90 shadow-md text-white'
                      : ''
                  }`}
                  onClick={() => navigate(`/checkout?plan=${plan.id}`)}
                >
                  {isLifetime && <Crown className="size-4" />}
                  {plan.ctaText}
                </Button>
                <p className="mt-2 text-center text-[10px] text-slate-400">
                  {isLifetime ? 'Sekali bayar • Tanpa tagihan berulang' : 'Bisa dibatalkan kapan saja'}
                </p>
              </div>
            </div>
          )
        })}
      </section>

      {/* Feature Comparison Table */}
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Perbandingan Paket Gratis vs Pro
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Lihat apa saja keuntungan yang Anda dapatkan saat beralih ke Akun Pro
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                <th className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white">Fitur Layanan</th>
                <th className="p-4 sm:p-5 font-bold text-slate-500 text-center w-36">Versi Gratis</th>
                <th className="p-4 sm:p-5 font-extrabold text-amber-600 dark:text-amber-400 text-center w-48 bg-amber-50/50 dark:bg-amber-950/20">
                  👑 Versi Pro (Lifetime)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { feature: 'Batas Ukuran File', free: 'Maksimal 50 MB', pro: 'Hingga 2 GB per file' },
                { feature: 'Kecepatan Pemrosesan', free: 'Standar', pro: 'Prioritas Super Cepat (Ultra)' },
                { feature: 'Proses Batch Sekaligus', free: '1 Berkas', pro: 'Hingga 50 Berkas' },
                { feature: 'Alat Edit & Hilangkan Watermark', free: 'Terbatas', pro: 'Penuh Tanpa Batas' },
                { feature: 'Pengalaman Pengguna', free: 'Tampil Iklan Sponsor', pro: '100% Bebas Iklan' },
                { feature: 'Akses Semua Fitur Mendatang', free: '❌ Tidak Termasuk', pro: '✅ Otomatis Dapat Gratis' },
                { feature: 'Dukungan Bantuan (Support)', free: 'Komunitas', pro: 'VIP via WhatsApp Langsung' },
                { feature: 'Masa Aktif Akun', free: 'Selamanya', pro: 'Seumur Hidup (Sekali Bayar)' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-4 sm:p-5 font-medium text-slate-800 dark:text-slate-200">
                    {row.feature}
                  </td>
                  <td className="p-4 sm:p-5 text-center text-slate-500">
                    {row.free}
                  </td>
                  <td className="p-4 sm:p-5 text-center font-bold text-indigo-600 dark:text-indigo-400 bg-amber-50/30 dark:bg-amber-950/10">
                    {row.pro}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* License Key Activation Section */}
      <section className="mx-auto max-w-xl">
        <Card className="p-6 sm:p-8 space-y-4 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <KeyRound className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Sudah Memiliki Kode Lisensi?
          </h3>
          <p className="text-xs text-slate-500">
            Jika Anda telah membeli melalui transfer manual atau WhatsApp, masukkan kode lisensi Anda di bawah ini untuk aktivasi instan.
          </p>

          <form onSubmit={handleActivateLicense} className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={licenseInput}
              onChange={(e) => setLicenseInput(e.target.value)}
              placeholder="Contoh: JMT-LIFETIME-XXXXXX"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono uppercase focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
            />
            <Button variant="primary" size="md" type="submit">
              Aktifkan
            </Button>
          </form>

          {licenseMsg && (
            <Alert tone={licenseMsg.type === 'success' ? 'info' : 'error'}>
              {licenseMsg.text}
            </Alert>
          )}
        </Card>
      </section>

      {/* Trust & Guarantee Badges */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-3.5 rounded-2xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Garansi 14 Hari</h4>
            <p className="text-[11px] text-slate-500">100% uang kembali jika Anda tidak puas dengan layanan kami.</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <Zap className="size-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Aktivasi Instan Otomatis</h4>
            <p className="text-[11px] text-slate-500">Pembayaran QRIS & VA terverifikasi langsung dalam hitungan detik.</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl bg-white p-5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
            <Sparkles className="size-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Semua Alat Lengkap</h4>
            <p className="text-[11px] text-slate-500">Mencakup 30+ alat PDF dan Gambar online tanpa batasan.</p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Pertanyaan Seputar Langganan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hal-hal yang sering ditanyakan mengenai paket dan pembayaran
          </p>
        </div>

        <div className="divide-y divide-slate-200 rounded-3xl bg-white ring-1 ring-slate-200 dark:divide-slate-800 dark:bg-slate-900 dark:ring-slate-800">
          {PRICING_FAQ.map(({ q, a }) => (
            <details key={q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white">
                {q}
                <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180 text-slate-400" />
              </summary>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
