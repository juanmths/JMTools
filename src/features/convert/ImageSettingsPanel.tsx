import { ChevronDown, Info, Link2, Link2Off, TriangleAlert } from 'lucide-react'
import { MAX_DIMENSION, type FormatId } from '../../lib/formats'
import { cn, scaleDimension } from '../../lib/utils'
import type { SettingsErrors } from './hooks'
import { useConvertStore } from './store'
import type { ImageSettings, UploadedFile } from './types'

const inputClass =
  'w-full rounded-xl border-0 bg-white px-3 py-2 ring-1 ring-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-800 dark:ring-slate-700'

function QualitySlider({ value, disabled, error, onChange }: { value: number; disabled: boolean; error?: string; onChange: (v: number) => void }) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <label htmlFor="quality" className="font-medium">
          Kualitas
        </label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={100}
            value={value}
            disabled={disabled}
            aria-label="Kualitas dalam persen"
            onChange={(e) => onChange(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
            className={cn(inputClass, 'w-16 py-1 text-right text-sm')}
          />
          <span className="text-sm text-slate-500">%</span>
        </div>
      </div>
      <input
        id="quality"
        type="range"
        min={1}
        max={100}
        value={value}
        disabled={disabled}
        aria-valuetext={`${value}%`}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full disabled:opacity-40"
      />
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>Berkas lebih kecil</span>
        <span>Kualitas lebih tinggi</span>
      </div>
      {disabled && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
          <Info className="mt-0.5 size-3.5 shrink-0" /> PNG bersifat lossless. Perkecil dimensi untuk mengurangi ukuran berkas.
        </p>
      )}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </section>
  )
}

function DimensionInputs({ file, settings, errors, onChange }: { file: UploadedFile; settings: ImageSettings; errors: SettingsErrors; onChange: (p: Partial<ImageSettings>) => void }) {
  const ow = file.width ?? 1
  const oh = file.height ?? 1

  const parse = (raw: string) => (raw === '' ? undefined : Math.round(Number(raw)))

  const setWidth = (raw: string) => {
    const width = parse(raw)
    if (width !== undefined && Number.isNaN(width)) return
    onChange(settings.lockAspect && width && width > 0 ? { width, height: scaleDimension(width, oh, ow) } : { width })
  }
  const setHeight = (raw: string) => {
    const height = parse(raw)
    if (height !== undefined && Number.isNaN(height)) return
    onChange(settings.lockAspect && height && height > 0 ? { height, width: scaleDimension(height, ow, oh) } : { height })
  }
  const toggleLock = () => {
    const lockAspect = !settings.lockAspect
    onChange(lockAspect && settings.width ? { lockAspect, height: scaleDimension(settings.width, oh, ow) } : { lockAspect })
  }

  const upscale = (settings.width ?? 0) > ow || (settings.height ?? 0) > oh

  return (
    <section>
      <p className="font-medium">Ukuran</p>
      <div className="mt-3 flex items-end gap-2">
        <label className="flex-1">
          <span className="mb-1 block text-xs text-slate-500">Lebar (px)</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_DIMENSION}
            value={settings.width ?? ''}
            onChange={(e) => setWidth(e.target.value)}
            aria-invalid={!!errors.width}
            className={cn(inputClass, errors.width && 'ring-rose-500')}
          />
        </label>
        <button
          type="button"
          onClick={toggleLock}
          aria-pressed={settings.lockAspect}
          aria-label={settings.lockAspect ? 'Buka kunci rasio aspek' : 'Kunci rasio aspek'}
          title={settings.lockAspect ? 'Rasio aspek terkunci' : 'Rasio aspek bebas'}
          className={cn(
            'mb-0.5 grid size-10 shrink-0 place-items-center rounded-xl ring-1 transition-colors',
            settings.lockAspect
              ? 'bg-indigo-600 text-white ring-indigo-600'
              : 'bg-white text-slate-500 ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:ring-slate-700',
          )}
        >
          {settings.lockAspect ? <Link2 className="size-4" /> : <Link2Off className="size-4" />}
        </button>
        <label className="flex-1">
          <span className="mb-1 block text-xs text-slate-500">Tinggi (px)</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_DIMENSION}
            value={settings.height ?? ''}
            onChange={(e) => setHeight(e.target.value)}
            aria-invalid={!!errors.height}
            className={cn(inputClass, errors.height && 'ring-rose-500')}
          />
        </label>
      </div>
      <label className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input type="checkbox" checked={settings.lockAspect} onChange={toggleLock} className="size-4 accent-indigo-600" />
        Kunci rasio aspek (tinggi dihitung otomatis)
      </label>
      {(errors.width || errors.height) && <p className="mt-1 text-xs text-rose-600">{errors.width ?? errors.height}</p>}
      {upscale && !errors.width && !errors.height && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" /> Lebih besar dari ukuran asli — hasil bisa terlihat buram.
        </p>
      )}
      <SizePresets file={file} settings={settings} onChange={onChange} />
    </section>
  )
}

function SizePresets({ file, settings, onChange }: { file: UploadedFile; settings: ImageSettings; onChange: (p: Partial<ImageSettings>) => void }) {
  const ow = file.width ?? 1
  const oh = file.height ?? 1
  const presets = [
    { label: 'Asli', width: ow },
    ...[1920, 1080, 720].filter((w) => w < ow).map((w) => ({ label: `${w}px`, width: w })),
    { label: '50%', width: Math.round(ow / 2) },
    { label: '25%', width: Math.round(ow / 4) },
  ]
  return (
    <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Preset ukuran">
      {presets.map((p) => {
        const height = scaleDimension(p.width, oh, ow)
        const active = settings.width === p.width && settings.height === height
        return (
          <button
            key={p.label}
            type="button"
            onClick={() => onChange({ width: p.width, height, lockAspect: true })}
            aria-pressed={active}
            className={cn(
              'rounded-lg px-3 py-1 text-xs font-medium ring-1 transition-colors',
              active
                ? 'bg-indigo-600 text-white ring-indigo-600'
                : 'bg-white text-slate-600 ring-slate-300 hover:ring-indigo-400 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
            )}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}

export function ImageSettingsPanel({ errors, target }: { errors: SettingsErrors; target: FormatId }) {
  const file = useConvertStore((s) => s.file)!
  const settings = useConvertStore((s) => s.settings)
  const update = useConvertStore((s) => s.updateSettings)
  const mayHaveAlpha = ['png', 'webp', 'gif'].includes(file.type)

  return (
    <div className="space-y-6">
      <QualitySlider value={settings.quality} disabled={target === 'png'} error={errors.quality} onChange={(quality) => update({ quality })} />
      <hr className="border-slate-200 dark:border-slate-800" />
      <DimensionInputs file={file} settings={settings} errors={errors} onChange={update} />
      <hr className="border-slate-200 dark:border-slate-800" />
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
          Lanjutan
          <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-3 space-y-3 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.stripMetadata}
              onChange={(e) => update({ stripMetadata: e.target.checked })}
              className="size-4 accent-indigo-600"
            />
            Hapus metadata (EXIF, lokasi GPS)
          </label>
          {target === 'jpg' && mayHaveAlpha && (
            <label className="flex items-center gap-2">
              <input
                type="color"
                value={settings.background}
                onChange={(e) => update({ background: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent"
              />
              Warna latar untuk area transparan
            </label>
          )}
        </div>
      </details>
    </div>
  )
}
