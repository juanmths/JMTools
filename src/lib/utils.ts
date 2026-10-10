export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value.toLocaleString('id-ID', { maximumFractionDigits: value < 10 ? 1 : 0 })} ${units[i]}`
}

/** Percentage change from `from` to `to`, e.g. -92. */
export function percentChange(from: number, to: number): number {
  if (!from) return 0
  return Math.round(((to - from) / from) * 100)
}

/** Scale `value` by the ratio target/source, never below 1. */
export function scaleDimension(value: number, target: number, source: number): number {
  return Math.max(1, Math.round((value * target) / source))
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function errorMessage(e: unknown, fallback = 'Terjadi kesalahan.'): string {
  return e instanceof Error && e.message ? e.message : fallback
}
