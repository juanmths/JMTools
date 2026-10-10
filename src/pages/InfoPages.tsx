import { ChevronDown } from 'lucide-react'
import { FILE_TTL_MS, MAX_FILE_SIZE } from '../lib/formats'
import { formatBytes } from '../lib/utils'

const ttl = `${FILE_TTL_MS / 60000} menit`

const FAQ = [
  { q: 'Format apa saja yang didukung?', a: 'Gambar: JPG, PNG, WEBP, GIF, BMP (output JPG, PNG, WEBP). Dokumen: PDF ke DOCX dan DOCX ke PDF.' },
  { q: 'Berapa batas ukuran berkas?', a: `Maksimal ${formatBytes(MAX_FILE_SIZE)} per berkas.` },
  { q: 'Bagaimana cara memperkecil ukuran foto?', a: 'Setelah memilih format gambar, turunkan slider kualitas (mis. 80%) dan/atau isi lebar baru. Tinggi dihitung otomatis bila kunci rasio aspek aktif.' },
  { q: 'Mengapa slider kualitas nonaktif untuk PNG?', a: 'PNG adalah format lossless. Untuk mengurangi ukuran, perkecil dimensinya atau pilih WEBP/JPG.' },
  { q: 'Berapa lama berkas saya disimpan?', a: `Berkas asli dan hasil dihapus otomatis setelah ${ttl}. Anda juga bisa menghapusnya langsung di halaman hasil.` },
  { q: 'Apakah perlu membuat akun?', a: 'Tidak. JMTools dapat digunakan tanpa login.' },
]

export function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">Pertanyaan Umum</h1>
      <div className="mt-8 divide-y divide-slate-200 rounded-2xl bg-white ring-1 ring-slate-200 dark:divide-slate-800 dark:bg-slate-900 dark:ring-slate-800">
        {FAQ.map(({ q, a }) => (
          <details key={q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {q}
              <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm text-slate-500">{a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}

export function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-4 text-slate-600 dark:text-slate-300">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Kebijakan Privasi</h1>
      <p>Kami hanya memproses berkas yang Anda unggah untuk keperluan konversi, resize, dan kompresi.</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Berkas asli dan hasil konversi dihapus otomatis dari server setelah {ttl}.</li>
        <li>Anda dapat menghapus berkas lebih awal melalui tombol “Hapus sekarang” di halaman hasil.</li>
        <li>Metadata gambar (EXIF, lokasi GPS) dihapus secara default.</li>
        <li>Kami tidak membagikan berkas Anda kepada pihak ketiga dan tidak memerlukan akun.</li>
      </ul>
    </article>
  )
}
