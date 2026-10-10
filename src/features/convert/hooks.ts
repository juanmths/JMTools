import { useCallback, useEffect, useState } from 'react'
import { useBlocker, useNavigate, useSearchParams } from 'react-router-dom'
import { hasSettingsStep, isImageFormat, isPdfCompress, MAX_DIMENSION, type FormatId } from '../../lib/formats'
import { errorMessage } from '../../lib/utils'
import { api } from './api'
import { useConvertStore } from './store'
import type { ImageSettings, Step } from './types'

/** Navigation state flag that lets intentional flow transitions bypass the leave guard. */
export const ALLOW_LEAVE = { allowLeave: true }

/** Step lives in `?step=` so the browser Back button walks through the wizard. */
export function useStepNavigation() {
  const [params, setParams] = useSearchParams()
  const step = (params.get('step') ?? 'upload') as Step
  const goTo = useCallback(
    (next: Step, opts?: { replace?: boolean }) => setParams({ step: next }, { replace: opts?.replace, state: ALLOW_LEAVE }),
    [setParams],
  )
  return { step, goTo }
}

// Module-level so an upload started on one page can be cancelled from another.
let uploadController: AbortController | null = null

export function useUpload(presetTarget?: FormatId) {
  const navigate = useNavigate()

  const start = useCallback(
    async (file: File) => {
      uploadController?.abort()
      const controller = new AbortController()
      uploadController = controller
      const s = useConvertStore.getState()
      if (s.file) void api.deleteFile(s.file.id)
      s.reset()
      s.setUpload({ name: file.name, size: file.size, progress: 0 })

      try {
        const uploaded = await api.uploadFile(
          file,
          (progress) => useConvertStore.getState().setUpload({ name: file.name, size: file.size, progress }),
          controller.signal,
        )
        s.setUpload(null)
        s.setFile(uploaded)
        let next: Step = 'format'
        if (presetTarget && (await api.getFormats(uploaded.type)).includes(presetTarget)) {
          s.setTarget(presetTarget)
          if (hasSettingsStep(uploaded.type, presetTarget)) next = 'settings'
        }
        navigate(`/convert?step=${next}`, { state: ALLOW_LEAVE })
      } catch (e) {
        if (controller.signal.aborted) return
        s.setUpload(null)
        s.setUploadError(errorMessage(e, 'Gagal mengunggah berkas.'))
      } finally {
        if (uploadController === controller) uploadController = null
      }
    },
    [navigate, presetTarget],
  )

  const cancel = useCallback(() => {
    uploadController?.abort()
    uploadController = null
    useConvertStore.getState().setUpload(null)
  }, [])

  return { start, cancel }
}

export function useStartConvert(goTo: (s: Step, o?: { replace?: boolean }) => void) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  const run = useCallback(async () => {
    const { file, targetFormat, settings, pdfSettings, setJobId } = useConvertStore.getState()
    if (!file || !targetFormat) return
    setBusy(true)
    setError(undefined)
    try {
      const { jobId } = await api.convert({
        fileId: file.id,
        target: targetFormat,
        settings: isImageFormat(targetFormat) ? settings : undefined,
        pdfSettings: isPdfCompress(file.type, targetFormat) ? pdfSettings : undefined,
      })
      setJobId(jobId)
      goTo('processing')
    } catch (e) {
      setError(errorMessage(e, 'Konversi gagal dimulai.'))
    } finally {
      setBusy(false)
    }
  }, [goTo])

  return { run, busy, error }
}

/** Confirm before leaving while an upload/processing is in progress. */
export function useLeaveGuard(active: boolean) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      active &&
      !(nextLocation.state as typeof ALLOW_LEAVE | null)?.allowLeave &&
      (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search),
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (window.confirm('Proses sedang berjalan. Yakin ingin meninggalkan halaman ini?')) blocker.proceed()
    else blocker.reset()
  }, [blocker])

  useEffect(() => {
    if (!active) return
    const handler = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [active])
}

export type SettingsErrors = Partial<Record<'width' | 'height' | 'quality', string>>

export function validateSettings(s: ImageSettings): SettingsErrors {
  const errors: SettingsErrors = {}
  const check = (v: number | undefined, key: 'width' | 'height', label: string) => {
    if (v === undefined || !Number.isFinite(v)) errors[key] = `${label} wajib diisi.`
    else if (v < 1) errors[key] = `${label} minimal 1 px.`
    else if (v > MAX_DIMENSION) errors[key] = `${label} maksimal ${MAX_DIMENSION.toLocaleString('id-ID')} px.`
  }
  check(s.width, 'width', 'Lebar')
  check(s.height, 'height', 'Tinggi')
  if (s.quality < 1 || s.quality > 100) errors.quality = 'Kualitas harus 1–100.'
  return errors
}

/** Debounced live size estimate for the settings panel. */
export function useSizeEstimate(fileId: string | undefined, target: FormatId | undefined, settings: ImageSettings, enabled: boolean) {
  const [state, setState] = useState<{ size?: number; loading: boolean }>({ loading: false })
  const { quality, width, height, background } = settings

  useEffect(() => {
    if (!enabled || !fileId || !target) return
    let cancelled = false
    setState((s) => ({ ...s, loading: true }))
    const t = setTimeout(async () => {
      try {
        const size = await api.estimateSize(fileId, target, { ...settings, quality, width, height, background })
        if (!cancelled) setState({ size, loading: false })
      } catch {
        if (!cancelled) setState({ loading: false })
      }
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, fileId, target, quality, width, height, background])

  return state
}
