import { useEffect, useState } from 'react'
import type { PlanId } from './pricingData'

export interface PremiumState {
  isPro: boolean
  plan: PlanId | null
  planName: string | null
  licenseKey: string | null
  activatedAt: string | null
  expiresAt: string | null // 'Seumur Hidup' or ISO date string
}

const STORAGE_KEY = 'jmtools_premium_status'

function getStoredState(): PremiumState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        isPro: false,
        plan: null,
        planName: null,
        licenseKey: null,
        activatedAt: null,
        expiresAt: null,
      }
    }
    return JSON.parse(raw)
  } catch {
    return {
      isPro: false,
      plan: null,
      planName: null,
      licenseKey: null,
      activatedAt: null,
      expiresAt: null,
    }
  }
}

// Custom event for reactive cross-component state synchronization
const EVENT_NAME = 'jmtools_premium_changed'

export function activatePremium(plan: PlanId, licenseKey?: string): PremiumState {
  const now = new Date()
  let expiresAt = 'Seumur Hidup (Lifetime)'
  let planName = 'Akses Seumur Hidup'

  if (plan === 'monthly') {
    const nextMonth = new Date(now)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    expiresAt = nextMonth.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    planName = 'Paket Bulanan'
  } else if (plan === 'yearly') {
    const nextYear = new Date(now)
    nextYear.setFullYear(nextYear.getFullYear() + 1)
    expiresAt = nextYear.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    planName = 'Paket 1 Tahun'
  }

  const generatedKey = licenseKey || `JMT-${plan.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

  const newState: PremiumState = {
    isPro: true,
    plan,
    planName,
    licenseKey: generatedKey,
    activatedAt: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    expiresAt,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
  window.dispatchEvent(new Event(EVENT_NAME))
  return newState
}

export function resetPremium(): void {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event(EVENT_NAME))
}

export function usePremium() {
  const [state, setState] = useState<PremiumState>(getStoredState)

  useEffect(() => {
    const handler = () => {
      setState(getStoredState())
    }
    window.addEventListener(EVENT_NAME, handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener(EVENT_NAME, handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  return {
    ...state,
    activate: activatePremium,
    reset: resetPremium,
  }
}
