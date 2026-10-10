import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm disabled:bg-indigo-300 dark:disabled:bg-indigo-900',
  secondary:
    'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700',
  ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  danger: 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950',
}

export const buttonClass = (variant: Variant = 'primary', size: 'md' | 'lg' = 'md') =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed',
    size === 'lg' ? 'px-5 py-3 text-base' : 'px-4 py-2 text-sm',
    variants[variant],
  )

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'md' | 'lg'
}

export function Button({ variant, size, className, type = 'button', ...rest }: Props) {
  return <button type={type} className={cn(buttonClass(variant, size), className)} {...rest} />
}

export function Alert({ children, tone = 'error' }: { children: React.ReactNode; tone?: 'error' | 'warning' | 'info' }) {
  const tones = {
    error: 'bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:ring-rose-900',
    warning: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-900',
    info: 'bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-200 dark:ring-sky-900',
  }
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('rounded-xl px-4 py-3 text-sm ring-1', tones[tone])}>
      {children}
    </div>
  )
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800', className)}>
      {children}
    </div>
  )
}
