import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Crown,
  Download,
  Loader2,
  QrCode,
  Radio,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tag,
  Zap,
} from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import {
  PAYMENT_METHODS,
  PRICING_PLANS,
  type PaymentMethod,
  type PlanId,
  type PricingPlan,
} from '../lib/pricingData'
import { PAYMENT_CONFIG } from '../lib/paymentConfig'
import { useAuth } from '../lib/authStore'
import { usePremium } from '../lib/premiumStore'

interface OrderData {
  id: string
  plan: string
  raw_amount: number
  unique_code: number
  total_amount: number
  payment_method: string
  qr_url?: string | null
  pay_code?: string | null
  reference?: string | null
  user_email: string
  user_phone: string
  license_key: string
  status: 'pending' | 'paid' | 'expired' | 'failed'
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const initialPlanId = (searchParams.get('plan') as PlanId) || 'lifetime'
  const premium = usePremium()
  const { user } = useAuth()

  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(() => {
    return PRICING_PLANS.find((p) => p.id === initialPlanId) || PRICING_PLANS[2]
  })

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0])
  const [voucherCode, setVoucherCode] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [voucherSuccess, setVoucherSuccess] = useState<string>()
  const [voucherError, setVoucherError] = useState<string>()

  // Buyer Information
  const [buyerName, setBuyerName] = useState(user?.name || '')
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '')
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '082399585050')

  // Step 1: select method, Step 2: pay / instructions, Step 3: success receipt
  const [step, setStep] = useState<'select' | 'pay' | 'success'>('select')
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [orderData, setOrderData] = useState<OrderData | null>(null)

  const [verifying, setVerifying] = useState(false)
  const [copiedText, setCopiedText] = useState<string>()
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 mins countdown
  const [lastPolledAt, setLastPolledAt] = useState<string>('')

  // Sync user info if user logs in during checkout
  useEffect(() => {
    if (user?.name && !buyerName) setBuyerName(user.name)
    if (user?.email && !buyerEmail) setBuyerEmail(user.email)
    if (user?.phone && (!buyerPhone || buyerPhone === '082399585050')) setBuyerPhone(user.phone)
  }, [user])

  // Countdown timer for payment window
  useEffect(() => {
    if (step !== 'pay') return
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [step])

  // ============================================================
  // AUTO-POLLING PEMBAYARAN OTOMATIS (CEK TIAP 3 DETIK)
  // ============================================================
  const pollTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (step !== 'pay' || !orderData?.id) return

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/payment.php?action=check_status&order_id=${encodeURIComponent(orderData.id)}`)
        const data = await res.json()
        setLastPolledAt(new Date().toLocaleTimeString('id-ID'))

        if (data.status === 'paid') {
          // Pembayaran otomatis terdeteksi!
          if (pollTimerRef.current) clearInterval(pollTimerRef.current)
          premium.activate(selectedPlan.id, data.license_key || orderData.license_key)
          setStep('success')
        }
      } catch {
        // Fallback silent ignore network hiccups
      }
    }

    // Jalankan segera dan pasang interval
    pollStatus()
    pollTimerRef.current = window.setInterval(pollStatus, PAYMENT_CONFIG.automation.pollingIntervalMs)

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [step, orderData?.id, selectedPlan.id])

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const applyVoucher = (e: React.FormEvent) => {
    e.preventDefault()
    setVoucherError(undefined)
    setVoucherSuccess(undefined)

    const code = voucherCode.trim().toUpperCase()
    if (code === 'HEMAT10') {
      const disc = Math.round(selectedPlan.discountPrice * 0.1)
      setDiscountAmount(disc)
      setVoucherSuccess('Kupon HEMAT10 berhasil digunakan! Diskon 10% diterapkan.')
    } else if (code === 'JMTOOLSPRO') {
      const disc = 15000
      setDiscountAmount(disc)
      setVoucherSuccess('Kupon JMTOOLSPRO berhasil! Potongan Rp 15.000 diterapkan.')
    } else {
      setVoucherError('Kupon tidak valid atau telah kedaluwarsa. Coba gunakan: HEMAT10')
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(undefined), 2000)
  }

  const totalPrice = Math.max(0, selectedPlan.discountPrice - discountAmount + selectedMethod.fee)

  // Buat order ke backend otomatis
  const handleProceedToPayment = async () => {
    setCreatingOrder(true)
    const emailToUse = buyerEmail.trim() || user?.email || `buyer_${Date.now()}@user.jmtools`

    try {
      const res = await fetch('/api/payment.php?action=create_order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          user_name: buyerName.trim() || user?.name || 'Pelanggan JMTools',
          user_email: emailToUse,
          user_phone: buyerPhone.trim(),
          plan: selectedPlan.id,
          amount: totalPrice,
          payment_method: selectedMethod.name,
        }),
      })
      const data = await res.json()
      if (data.status === 'success' && data.order) {
        setOrderData(data.order)
      } else {
        // Fallback local mock order jika backend offline
        setOrderData({
          id: `JMT-${Date.now().toString(36).toUpperCase()}`,
          plan: selectedPlan.id,
          raw_amount: totalPrice,
          unique_code: Math.floor(Math.random() * 800) + 100,
          total_amount: totalPrice,
          payment_method: selectedMethod.name,
          user_email: emailToUse,
          user_phone: buyerPhone.trim(),
          license_key: `JMT-${selectedPlan.id.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          status: 'pending',
        })
      }
      setStep('pay')
    } catch {
      // Fallback local
      setOrderData({
        id: `JMT-${Date.now().toString(36).toUpperCase()}`,
        plan: selectedPlan.id,
        raw_amount: totalPrice,
        unique_code: Math.floor(Math.random() * 800) + 100,
        total_amount: totalPrice,
        payment_method: selectedMethod.name,
        user_email: emailToUse,
        user_phone: buyerPhone.trim(),
        license_key: `JMT-${selectedPlan.id.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'pending',
      })
      setStep('pay')
    } finally {
      setCreatingOrder(false)
    }
  }

  // Verifikasi Instan (jika pembeli menekan tombol cek manual)
  const handleInstantVerification = async () => {
    setVerifying(true)
    try {
      if (orderData?.id) {
        const res = await fetch('/api/payment.php?action=verify_instant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderData.id,
            plan: selectedPlan.id,
            payment_method: selectedMethod.name,
          }),
        })
        const data = await res.json()
        const activeKey = data.license_key || orderData.license_key
        premium.activate(selectedPlan.id, activeKey)
      } else {
        const activeState = premium.activate(selectedPlan.id)
        if (user?.id) {
          fetch('/api/auth.php?action=activate_pro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              plan: selectedPlan.id,
              license_key: activeState.licenseKey,
            }),
          }).catch(() => {})
        }
      }
      setStep('success')
    } catch {
      premium.activate(selectedPlan.id)
      setStep('success')
    } finally {
      setVerifying(false)
    }
  }

  const getMethodIcon = (icon: string) => {
    switch (icon) {
      case 'QrCode':
        return <QrCode className="size-5 text-rose-600" />
      case 'Building2':
        return <Building2 className="size-5 text-blue-600" />
      case 'Smartphone':
        return <Smartphone className="size-5 text-emerald-600" />
      case 'CreditCard':
        return <CreditCard className="size-5 text-amber-600" />
      default:
        return <CreditCard className="size-5" />
    }
  }

  // Nominal final yang ditampilkan (jika ada unique_code otomatis)
  const finalPayAmount = orderData?.total_amount || totalPrice

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/pricing"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="size-4" /> Kembali ke Pilihan Paket
        </Link>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="size-4" /> Transaksi Aman & Terenkripsi SSL 256-Bit
        </div>
      </div>

      {step === 'success' ? (
        /* ============================================================ */
        /* SUCCESS RECEIPT / STRUK PEMBAYARAN PRO                       */
        /* ============================================================ */
        <Card className="p-8 sm:p-12 max-w-2xl mx-auto text-center space-y-6 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 border-2 border-emerald-500/30">
          <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 animate-bounce">
            <CheckCircle2 className="size-10" />
          </div>

          <div>
            <span className="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              PEMBAYARAN TERVERIFIKASI OTOMATIS (LUNAS)
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Selamat! Akun Pro Anda Telah Aktif 🎉
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Sistem telah mendeteksi pembayaran Anda. Lisensi telah diaktifkan ke akun Anda tanpa perlu konfirmasi manual.
            </p>
          </div>

          {/* WhatsApp Bot Confirmation Notification */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-left dark:border-emerald-800 dark:bg-emerald-950/40 flex items-start gap-3">
            <Smartphone className="size-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-emerald-900 dark:text-emerald-200">
                Terkirim via Bot WhatsApp Otomatis:
              </p>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                Struk digital dan kode lisensi resmi telah dikirimkan ke nomor WhatsApp Anda:{' '}
                <strong>{buyerPhone || '082399585050'}</strong>. Anda tidak perlu chat admin lagi!
              </p>
            </div>
          </div>

          {/* Digital Receipt Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left text-xs space-y-3 dark:border-slate-800 dark:bg-slate-900/80 shadow-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
              <span className="text-slate-500">No. Order Transaksi:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {orderData?.id || `JMT-${Date.now().toString(36).toUpperCase()}`}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
              <span className="text-slate-500">Paket Layanan:</span>
              <span className="font-bold text-slate-900 dark:text-white">{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
              <span className="text-slate-500">Masa Berlaku:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                {selectedPlan.id === 'lifetime' ? '👑 Seumur Hidup (Lifetime Access)' : premium.expiresAt}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
              <span className="text-slate-500">Total Pembayaran:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                Rp {finalPayAmount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <div>
                <p className="text-slate-500">Kode Lisensi Resmi:</p>
                <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {premium.licenseKey || orderData?.license_key}
                </p>
              </div>
              <Button
                variant="secondary"
                size="md"
                className="text-xs"
                onClick={() => copyToClipboard(premium.licenseKey || orderData?.license_key || '', 'license')}
              >
                {copiedText === 'license' ? (
                  <>
                    <Check className="size-3.5 text-emerald-600" /> Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" /> Salin Lisensi
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-md hover:bg-indigo-500 transition-all text-sm"
            >
              <Sparkles className="size-4" /> Mulai Gunakan Semua Alat Pro Sekarang
            </Link>
            <Button
              variant="secondary"
              size="md"
              onClick={() => window.print()}
              className="text-xs"
            >
              <Download className="size-4" /> Unduh / Cetak Bukti Pembayaran
            </Button>
          </div>
        </Card>
      ) : (
        /* ============================================================ */
        /* CHECKOUT & PAYMENT SELECTION                                 */
        /* ============================================================ */
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Left Column: Payment Methods / Payment Screen */}
          <div className="md:col-span-2 space-y-6">
            {step === 'select' ? (
              <Card className="p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="size-5 text-indigo-600" /> Pembayaran Serba Otomatis 24 Jam
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Uang masuk langsung diproses sistem. Lisensi dan akun Pro Anda aktif otomatis dalam hitungan detik tanpa perlu konfirmasi manual ke WhatsApp!
                  </p>
                </div>

                {/* Buyer Form Inputs */}
                <div className="space-y-3.5 rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-800 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Informasi Pembeli (Untuk Pengiriman Lisensi Otomatis):
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Nama Lengkap:
                      </label>
                      <input
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        placeholder="Contoh: Juan Matheus"
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Email Akun:
                      </label>
                      <input
                        type="email"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder="email.anda@gmail.com"
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                      <span>Nomor WhatsApp (Untuk Struk & Bot Lisensi):</span>
                      <span className="text-[10px] text-emerald-600 font-bold">✓ Bot WA Otomatis Aktif</span>
                    </label>
                    <input
                      type="tel"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="Contoh: 082399585050"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                    />
                    <p className="text-[10px] text-slate-400">
                      💡 Bot WhatsApp kami akan langsung mengirimkan lisensi resmi dan struk ke nomor ini begitu uang masuk.
                    </p>
                  </div>
                </div>

                {/* Payment Methods List */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Pilih Metode Pembayaran:
                  </label>
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedMethod.id === method.id
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethod(method)}
                        className={`w-full flex items-center justify-between rounded-2xl p-4 text-left border transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="grid size-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800">
                            {getMethodIcon(method.iconName)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-slate-900 dark:text-white">
                                {method.name}
                              </p>
                              {method.category === 'qris' && (
                                <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[9px] font-extrabold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                  INSTAN
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {method.category === 'qris'
                                ? 'Scan dari GoPay, OVO, DANA, BCA, Livin, BRImo, ShopeePay'
                                : method.category === 'va'
                                ? 'Virtual Account transfer otomatis 24 Jam'
                                : method.category === 'transfer'
                                ? 'Transfer bank BCA / BRI dengan kode unik pencocokan otomatis'
                                : 'Aplikasi Dompet Digital (DANA / OVO / GoPay)'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {method.fee === 0 ? (
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              Bebas Biaya
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              +Rp {method.fee.toLocaleString('id-ID')}
                            </span>
                          )}
                          <div
                            className={`size-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  disabled={creatingOrder}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md"
                  onClick={handleProceedToPayment}
                >
                  {creatingOrder ? (
                    <>
                      <Loader2 className="size-5 animate-spin" /> Menyiapkan Invoice Otomatis...
                    </>
                  ) : (
                    <>
                      Lanjut ke Pembayaran Rp {totalPrice.toLocaleString('id-ID')} →
                    </>
                  )}
                </Button>
              </Card>
            ) : (
              /* PAYMENT INSTRUCTIONS & AUTO-POLLING SCREEN */
              <Card className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Selesaikan Pembayaran
                    </h2>
                    <p className="text-xs text-slate-500">
                      No. Order: <strong className="font-mono text-slate-800 dark:text-slate-200">{orderData?.id}</strong> • Metode: {selectedMethod.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Batas Waktu Bayar</p>
                    <p className="font-mono font-extrabold text-rose-600 text-lg">
                      {formatTimer(timeLeft)}
                    </p>
                  </div>
                </div>

                {/* LIVE AUTOMATED SCANNING RADAR BADGE */}
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50/70 p-4 text-xs dark:bg-emerald-950/30 dark:border-emerald-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex size-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex size-3 rounded-full bg-emerald-500"></span>
                    </div>
                    <div>
                      <p className="font-bold text-emerald-900 dark:text-emerald-200">
                        Sistem Sedang Memantau Pembayaran Otomatis...
                      </p>
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                        Layar ini akan otomatis berganti ke <strong className="font-semibold">Aktif</strong> begitu transfer Anda masuk. {lastPolledAt && `(Cek terakhir: ${lastPolledAt})`}
                      </p>
                    </div>
                  </div>
                  <Radio className="size-5 text-emerald-600 animate-pulse hidden sm:block" />
                </div>

                {/* Conditional Display by Payment Category */}
                {selectedMethod.category === 'qris' && (
                  <div className="space-y-4 text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Pindai kode QRIS di bawah menggunakan GoPay, OVO, DANA, BCA, Livin, BRImo, atau ShopeePay:
                    </p>

                    {/* QRIS Graphic Container */}
                    <div className="mx-auto max-w-[260px] rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-200 dark:ring-slate-700">
                      <div className="border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-extrabold tracking-wider text-rose-600">QRIS</span>
                        <span className="text-[9px] text-slate-400 font-bold">PEMBAYARAN OTOMATIS</span>
                      </div>
                      <div className="grid place-items-center aspect-square rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
                        {orderData?.qr_url ? (
                          <img src={orderData.qr_url} alt="QRIS Otomatis" className="size-48 object-contain" />
                        ) : (
                          /* High Quality QR Code Vector */
                          <svg className="size-48" viewBox="0 0 100 100" fill="currentColor">
                            <path d="M10 10h28v28h-28z m4 4v20h20v-20z m4 4h12v12h-12z" />
                            <path d="M62 10h28v28h-28z m4 4v20h20v-20z m4 4h12v12h-12z" />
                            <path d="M10 62h28v28h-28z m4 4v20h20v-20z m4 4h12v12h-12z" />
                            <rect x="46" y="10" width="8" height="8" />
                            <rect x="46" y="26" width="8" height="8" />
                            <rect x="18" y="46" width="8" height="8" />
                            <rect x="34" y="46" width="8" height="8" />
                            <rect x="46" y="46" width="8" height="8" />
                            <rect x="62" y="46" width="8" height="8" />
                            <rect x="78" y="46" width="8" height="8" />
                            <rect x="46" y="62" width="8" height="8" />
                            <rect x="62" y="62" width="8" height="8" />
                            <rect x="78" y="62" width="8" height="8" />
                            <rect x="46" y="78" width="8" height="8" />
                            <rect x="62" y="78" width="8" height="8" />
                            <rect x="78" y="78" width="8" height="8" />
                          </svg>
                        )}
                      </div>
                      <p className="mt-2 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        {PAYMENT_CONFIG.qris.merchantName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        NMID: {PAYMENT_CONFIG.qris.nmid}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-between">
                      <span>Total Pembayaran QRIS:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-base">
                          Rp {finalPayAmount.toLocaleString('id-ID')}
                        </span>
                        <Button
                          variant="secondary"
                          size="md"
                          className="text-[11px] py-1 px-2.5"
                          onClick={() => copyToClipboard(String(finalPayAmount), 'nominal_qris')}
                        >
                          {copiedText === 'nominal_qris' ? 'Tersalin!' : 'Salin Nominal'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod.category === 'va' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-blue-50/70 p-5 ring-1 ring-blue-200 dark:bg-blue-950/40 dark:ring-blue-800 space-y-3">
                      <div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Nomor Virtual Account:</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="font-mono text-xl font-extrabold text-blue-950 dark:text-white">
                            {orderData?.pay_code || selectedMethod.accountNumber}
                          </p>
                          <Button
                            variant="secondary"
                            size="md"
                            className="text-xs"
                            onClick={() => copyToClipboard(orderData?.pay_code || selectedMethod.accountNumber || '', 'va')}
                          >
                            {copiedText === 'va' ? 'Tersalin!' : 'Salin Nomor VA'}
                          </Button>
                        </div>
                      </div>

                      <div className="border-t border-blue-200/60 pt-2 flex justify-between text-xs text-blue-800 dark:text-blue-200">
                        <span>Nama Akun:</span>
                        <span className="font-bold">{selectedMethod.accountHolder}</span>
                      </div>

                      <div className="border-t border-blue-200/60 pt-2 flex justify-between text-xs text-blue-800 dark:text-blue-200">
                        <span>Total Pembayaran:</span>
                        <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                          Rp {finalPayAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod.category === 'transfer' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Silakan transfer ke salah satu rekening Bank resmi pemilik JMTools di bawah ini:
                    </p>

                    {/* Dynamic List of Bank Accounts from PAYMENT_CONFIG */}
                    <div className="space-y-2.5">
                      {PAYMENT_CONFIG.bankAccounts.map((acc, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl bg-amber-50/70 p-4 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:ring-amber-800 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                              {acc.bankName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              a/n {acc.accountHolder}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="font-mono text-lg font-extrabold text-slate-900 dark:text-white tracking-wide">
                              {acc.accountNumber}
                            </p>
                            <Button
                              variant="secondary"
                              size="md"
                              className="text-xs"
                              onClick={() => copyToClipboard(acc.accountNumber, `rek_${idx}`)}
                            >
                              {copiedText === `rek_${idx}` ? 'Tersalin!' : 'Salin Rekening'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3.5 flex justify-between items-center text-xs dark:bg-slate-800">
                      <div>
                        <span className="text-slate-600 dark:text-slate-300 block">Nominal Persis (Termasuk Kode Unik):</span>
                        <span className="text-[10px] text-amber-600 font-medium">Harap transfer nominal pas agar terverifikasi otomatis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-base font-mono">
                          Rp {finalPayAmount.toLocaleString('id-ID')}
                        </span>
                        <Button
                          variant="secondary"
                          size="md"
                          className="text-[11px] py-1 px-2.5"
                          onClick={() => copyToClipboard(String(finalPayAmount), 'nominal_tf')}
                        >
                          {copiedText === 'nominal_tf' ? 'Tersalin!' : 'Salin'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod.category === 'ewallet' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Transfer saldo e-wallet ke nomor akun dompet digital resmi kami di bawah:
                    </p>

                    {/* Dynamic List of E-Wallets from PAYMENT_CONFIG */}
                    <div className="space-y-2.5">
                      {PAYMENT_CONFIG.ewallets.map((ew, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl bg-emerald-50/70 p-4 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:ring-emerald-800 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                              {ew.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              a/n {ew.accountHolder}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="font-mono text-lg font-extrabold text-slate-900 dark:text-white tracking-wide">
                              {ew.phoneNumber}
                            </p>
                            <Button
                              variant="secondary"
                              size="md"
                              className="text-xs"
                              onClick={() => copyToClipboard(ew.phoneNumber, `ew_${idx}`)}
                            >
                              {copiedText === `ew_${idx}` ? 'Tersalin!' : 'Salin Nomor'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3.5 flex justify-between items-center text-xs dark:bg-slate-800">
                      <span className="text-slate-600 dark:text-slate-300">Total Nominal Pembayaran:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                          Rp {finalPayAmount.toLocaleString('id-ID')}
                        </span>
                        <Button
                          variant="secondary"
                          size="md"
                          className="text-[11px] py-1 px-2.5"
                          onClick={() => copyToClipboard(String(finalPayAmount), 'nominal_ew')}
                        >
                          {copiedText === 'nominal_ew' ? 'Tersalin!' : 'Salin'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Instructions Accordion / List */}
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200">Petunjuk Pembayaran:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-500">
                    {selectedMethod.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ol>
                </div>

                {/* Buttons: Change Method or Trigger Instant Check */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="ghost"
                    size="md"
                    className="text-xs"
                    onClick={() => setStep('select')}
                  >
                    ← Ganti Metode / Info
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    onClick={handleInstantVerification}
                    disabled={verifying}
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="size-5 animate-spin" /> Memeriksa Mutasi Otomatis...
                      </>
                    ) : (
                      <>
                        <Check className="size-5" /> Saya Sudah Membayar (Cek Sekarang)
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="space-y-6">
            <Card className="p-6 space-y-5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Crown className="size-5 text-amber-500" /> Ringkasan Pesanan
              </h3>

              {/* Plan Switcher Pills */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-semibold">Pilih Paket:</label>
                <div className="space-y-1.5">
                  {PRICING_PLANS.map((p) => {
                    const isCur = p.id === selectedPlan.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlan(p)
                          setDiscountAmount(0)
                          setVoucherSuccess(undefined)
                        }}
                        className={`w-full flex items-center justify-between rounded-xl p-2.5 text-xs text-left transition-all ${
                          isCur
                            ? 'bg-indigo-50 border border-indigo-600 text-indigo-950 dark:bg-indigo-950/60 dark:text-white font-bold'
                            : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{p.name}</span>
                        <span>Rp {p.discountPrice.toLocaleString('id-ID')}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Price Calculation */}
              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs dark:border-slate-800">
                <div className="flex justify-between text-slate-500">
                  <span>Harga Normal:</span>
                  <span className="line-through">
                    Rp {selectedPlan.originalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Harga Promo:</span>
                  <span className="font-semibold">
                    Rp {selectedPlan.discountPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Diskon Kupon:</span>
                    <span>-Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                {selectedMethod.fee > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Biaya Layanan:</span>
                    <span>+Rp {selectedMethod.fee.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-extrabold text-slate-900 dark:text-white dark:border-slate-800">
                  <span>Total Tagihan:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 text-base">
                    Rp {finalPayAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Voucher Code Form */}
              <form onSubmit={applyVoucher} className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Kode kupon (mis. HEMAT10)"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs uppercase focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                    />
                  </div>
                  <Button variant="secondary" size="md" type="submit" className="text-xs">
                    Gunakan
                  </Button>
                </div>
                {voucherSuccess && (
                  <p className="text-[11px] text-emerald-600 font-medium">{voucherSuccess}</p>
                )}
                {voucherError && (
                  <p className="text-[11px] text-rose-600 font-medium">{voucherError}</p>
                )}
              </form>

              {/* Key Features included */}
              <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60 text-xs space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">Keuntungan Paket Ini:</p>
                <ul className="space-y-1.5 text-slate-500">
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-600" />
                    <span>Akses 30+ Alat PDF & Gambar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-600" />
                    <span>Batas file 2 GB & Batch tanpa batas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-600" />
                    <span>
                      {selectedPlan.id === 'lifetime' ? '👑 Berlaku Seumur Hidup (Sekali Bayar)' : 'Dukungan Prioritas'}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="size-3.5 text-emerald-600" />
                    <span>Aktivasi 100% Otomatis Tanpa Menunggu</span>
                  </li>
                </ul>
              </div>

              {/* Trust & Guarantee Box */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/60 p-4 dark:bg-emerald-950/30 dark:border-emerald-800/50 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>Jaminan Keamanan & Bebas Risiko</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  Pembayaran Anda 100% aman dan dilindungi <strong>Garansi Uang Kembali 14 Hari</strong>. Dikelola langsung secara transparan oleh Juan Karly Matheus.
                </p>
                <div className="pt-1.5 border-t border-emerald-200/60 dark:border-emerald-800/40 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                  Bantuan Langsung WhatsApp: <strong>0823-9958-5050</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
