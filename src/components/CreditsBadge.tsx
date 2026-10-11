import { Crown, Gift } from 'lucide-react'
import { Link } from 'react-router-dom'
import { triggerOutOfCreditsModal, useAuth } from '../lib/authStore'
import { usePremium } from '../lib/premiumStore'

export function CreditsBadge() {
  const { credits } = useAuth()
  const premium = usePremium()

  if (premium.isPro) {
    return (
      <Link
        to="/pricing"
        className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-800 hover:ring-amber-300 transition-all"
        title="Akun Pro Aktif - Akses Tanpa Batas"
      >
        <Crown className="size-3 text-amber-600" />
        <span className="hidden sm:inline">Akses</span> Pro
      </Link>
    )
  }

  if (credits <= 0) {
    return (
      <button
        type="button"
        onClick={triggerOutOfCreditsModal}
        className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-800 hover:bg-rose-100 transition-all animate-pulse"
        title="Kredit Gratis Habis - Klik untuk Buka Pilihan Paket"
      >
        <Gift className="size-3 text-rose-600" />
        <span>0 Kredit (Habis)</span>
      </button>
    )
  }

  return (
    <Link
      to="/pricing"
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 transition-all ${
        credits <= 2
          ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
          : 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
      }`}
      title={`Sisa ${credits} kali pemrosesan gratis dari 5`}
    >
      <Gift className="size-3" />
      <span>{credits}/5 Gratis</span>
    </Link>
  )
}
