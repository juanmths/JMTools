import { useEffect, useState } from 'react'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  provider: 'google' | 'email'
  createdAt: string
}

export const INITIAL_FREE_CREDITS = 5
const CREDITS_STORAGE_KEY = 'jmtools_credits_left'
const USER_STORAGE_KEY = 'jmtools_user_session'
const AUTH_EVENT_NAME = 'jmtools_auth_changed'
const CREDITS_EVENT_NAME = 'jmtools_credits_changed'
const OUT_OF_CREDITS_EVENT = 'jmtools_out_of_credits_trigger'

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function getStoredCredits(): number {
  try {
    const raw = localStorage.getItem(CREDITS_STORAGE_KEY)
    if (raw === null) {
      localStorage.setItem(CREDITS_STORAGE_KEY, String(INITIAL_FREE_CREDITS))
      return INITIAL_FREE_CREDITS
    }
    const val = Number(raw)
    return isNaN(val) ? INITIAL_FREE_CREDITS : val
  } catch {
    return INITIAL_FREE_CREDITS
  }
}

function isProActive(): boolean {
  try {
    const raw = localStorage.getItem('jmtools_premium_status')
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return !!parsed.isPro
  } catch {
    return false
  }
}

export function consumeCredit(): { allowed: boolean; remaining: number } {
  // Jika pengguna sudah Pro, selalu izinkan tanpa batas
  if (isProActive()) {
    return { allowed: true, remaining: Infinity }
  }

  const current = getStoredCredits()
  if (current <= 0) {
    // Picu pop-up Out of Credits
    window.dispatchEvent(new Event(OUT_OF_CREDITS_EVENT))
    return { allowed: false, remaining: 0 }
  }

  const newCredits = current - 1
  localStorage.setItem(CREDITS_STORAGE_KEY, String(newCredits))
  window.dispatchEvent(new Event(CREDITS_EVENT_NAME))

  return { allowed: true, remaining: newCredits }
}

export function resetCredits(amount = INITIAL_FREE_CREDITS): void {
  localStorage.setItem(CREDITS_STORAGE_KEY, String(amount))
  window.dispatchEvent(new Event(CREDITS_EVENT_NAME))
}

export function triggerOutOfCreditsModal(): void {
  window.dispatchEvent(new Event(OUT_OF_CREDITS_EVENT))
}

export function loginWithGoogle(): User {
  const user: User = {
    id: `g_${Date.now()}`,
    name: 'Pengguna Google',
    email: 'user.google@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    provider: 'google',
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event(AUTH_EVENT_NAME))
  return user
}

export function loginWithEmail(email: string): User {
  const name = email.split('@')[0]
  const user: User = {
    id: `u_${Date.now()}`,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    email,
    provider: 'email',
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event(AUTH_EVENT_NAME))
  return user
}

export function registerUser(name: string, email: string, phone?: string): User {
  const user: User = {
    id: `u_${Date.now()}`,
    name,
    email,
    phone,
    provider: 'email',
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event(AUTH_EVENT_NAME))
  return user
}

export function logoutUser(): void {
  localStorage.removeItem(USER_STORAGE_KEY)
  window.dispatchEvent(new Event(AUTH_EVENT_NAME))
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [credits, setCredits] = useState<number>(getStoredCredits)

  useEffect(() => {
    const handleAuth = () => setUser(getStoredUser())
    const handleCredits = () => setCredits(getStoredCredits())

    window.addEventListener(AUTH_EVENT_NAME, handleAuth)
    window.addEventListener(CREDITS_EVENT_NAME, handleCredits)
    window.addEventListener('storage', handleAuth)
    window.addEventListener('storage', handleCredits)

    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, handleAuth)
      window.removeEventListener(CREDITS_EVENT_NAME, handleCredits)
      window.removeEventListener('storage', handleAuth)
      window.removeEventListener('storage', handleCredits)
    }
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    credits,
    consumeCredit,
    resetCredits,
    loginWithGoogle,
    loginWithEmail,
    registerUser,
    logout: logoutUser,
  }
}
