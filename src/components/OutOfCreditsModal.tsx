import { Check, Crown, Sparkles, X, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PRICING_PLANS } from '../lib/pricingData'
import { Button } from './ui'

export function OutOfCreditsModal() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleTrigger = () => setIsOpen(true)
    window.addEventListener('jmtools_out_of_credits_trigger', handleTrigger)
    return () => window.removeEventListener('jmtools_out_of_credits_trigger', handleTrigger)
  }, [])

  if (!isOpen) return null

  const handleSelectPlan = (planId: string) => {
    setIsOpen(false)
    navigate(`/checkout?plan=${planId}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800">
            <Crown className="size-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Kredit Gratis Anda Sudah Habis! (5/5 Terpakai)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Anda telah menikmati 5 kali pemrosesan gratis di JMTools. Beralih ke Akun Pro sekarang untuk pemrosesan tanpa batas, tanpa iklan, dan batas file 2 GB:
          </p>
        </div>

        {/* 3 Package Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {PRICING_PLANS.map((plan) => {
            const isLifetime = plan.id === 'lifetime'
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl p-4 text-left border transition-all ${
                  isLifetime
                    ? 'border-amber-500 bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/40 dark:to-slate-900 shadow-md ring-1 ring-amber-500'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60'
                }`}
              >
                {isLifetime && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase">
                    Paling Laris
                  </span>
                )}

                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <div className="mt-2">
                    <span className="text-[10px] text-slate-400 line-through">
                      Rp {plan.originalPrice.toLocaleString('id-ID')}
                    </span>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Rp {plan.discountPrice.toLocaleString('id-ID')}
                    </p>
                    <p className="text-[10px] text-slate-500">{plan.period}</p>
                  </div>

                  <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-emerald-600 shrink-0" />
                      <span>Semua alat tanpa batas</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="size-3 text-emerald-600 shrink-0" />
                      <span>Batas berkas 2 GB</span>
                    </li>
                    {isLifetime && (
                      <li className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                        <Sparkles className="size-3 text-amber-500 shrink-0" />
                        <span>Sekali bayar selamanya</span>
                      </li>
                    )}
                  </ul>
                </div>

                <Button
                  variant={isLifetime ? 'primary' : 'secondary'}
                  size="md"
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`mt-4 w-full text-xs font-bold ${
                    isLifetime
                      ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white'
                      : ''
                  }`}
                >
                  {isLifetime ? 'Beli Seumur Hidup' : 'Pilih Paket'}
                </Button>
              </div>
            )
          })}
        </div>

        {/* Footer Guarantee */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3 dark:border-slate-800">
          <span className="flex items-center gap-1">
            <Zap className="size-3 text-emerald-500" /> Aktivasi QRIS & VA Otomatis Instan
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="hover:underline text-slate-500"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  )
}
