import { ChevronDown, Phone, ShieldCheck, UserCheck } from 'lucide-react'
import { Card } from '../components/ui'
import { FILE_TTL_MS, MAX_FILE_SIZE } from '../lib/formats'
import { PAYMENT_CONFIG } from '../lib/paymentConfig'
import { formatBytes } from '../lib/utils'

const ttl = `${FILE_TTL_MS / 60000} menit`

const FAQ = [
  { q: 'Apakah JMTools aman dan terpercaya?', a: 'Sangat aman! JMTools menerapkan standar keamanan privasi Zero-Knowledge di mana dokumen Anda diproses langsung di peramban (browser) atau dihapus otomatis dari memori server tanpa disimpan permanen. Kami dioperasikan secara resmi dengan identitas transparan oleh Juan Karly Matheus.' },
  { q: 'Format apa saja yang didukung?', a: 'Gambar: JPG, PNG, WEBP, GIF, BMP (output JPG, PNG, WEBP). Dokumen: PDF ke DOCX, DOCX ke PDF, Merge PDF, Split PDF, Watermark PDF, Protect PDF, dan banyak lagi.' },
  { q: 'Berapa batas ukuran berkas?', a: `Versi gratis mendukung hingga ${formatBytes(MAX_FILE_SIZE)} per berkas. Pengguna Akun Pro Seumur Hidup mendapatkan kuota hingga 2 GB per berkas.` },
  { q: 'Bagaimana cara konfirmasi pembayaran jika transfer ke rekening pemilik?', a: `Setelah mentransfer ke rekening BCA (7955528590) atau BRI (7772-01-000999-53-4) a/n JUAN KARLY MATHEUS, Anda dapat langsung mengklik tombol konfirmasi WhatsApp ke ${PAYMENT_CONFIG.whatsappNumber}. Kode lisensi Pro aktif dalam hitungan 5 menit.` },
  { q: 'Apakah ada garansi jika saya tidak puas?', a: 'Tentu! Kami menyediakan Garansi 100% Uang Kembali dalam 14 hari pertama jika fitur kami tidak sesuai dengan kebutuhan Anda.' },
  { q: 'Berapa lama berkas saya disimpan?', a: `Berkas sementara dihapus otomatis setelah ${ttl}. Anda juga dapat mengklik tombol "Hapus Sekarang" seketika setelah selesai unduh.` },
]

export function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Pertanyaan yang Sering Diajukan (FAQ)</h1>
        <p className="text-sm text-slate-500">Semua yang perlu Anda ketahui mengenai keamanan, alat, dan sistem pembayaran JMTools.</p>
      </div>

      <div className="divide-y divide-slate-200 rounded-3xl bg-white ring-1 ring-slate-200 dark:divide-slate-800 dark:bg-slate-900 dark:ring-slate-800 shadow-sm">
        {FAQ.map(({ q, a }) => (
          <details key={q} className="group px-6 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white">
              {q}
              <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180 text-slate-400" />
            </summary>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}

export function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Kebijakan Privasi & Keamanan Data</h1>
        <p className="text-xs text-slate-500 mt-1">Terakhir diperbarui: Oktober 2026 • Komitmen Privasi Zero-Knowledge</p>
      </div>

      <p>
        Di <strong>JMTools</strong> (dioperasikan oleh Juan Karly Matheus), kami memprioritaskan privasi dan keamanan dokumen pengguna di atas segalanya. Dokumen yang Anda unggah (PDF, dokumen, atau foto) adalah milik pribadi Anda.
      </p>

      <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Prinsip Pemrosesan Berkas</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li><strong>Pemrosesan Lokal / Sementara:</strong> Sebagian besar manipulasi (seperti penggabungan PDF, watermark, konversi foto) dilakukan secara lokal di browser Anda atau di memori terenkripsi sementara.</li>
        <li><strong>Penghapusan Otomatis:</strong> Berkas asli maupun hasil olahan otomatis dihapus permanen dari server dalam tempo {ttl}. Kami tidak pernah menyimpan arsip dokumen Anda.</li>
        <li><strong>Pembersihan Metadata:</strong> Metadata sensitif (seperti data lokasi GPS pada foto EXIF) dihapus secara otomatis demi melindungi privasi Anda.</li>
      </ul>

      <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Keamanan Transaksi & Data Pembayaran</h2>
      <p>
        Informasi transaksi pembayaran yang Anda lakukan (baik transfer bank BCA, BRI, maupun dompet digital) hanya digunakan untuk verifikasi aktivasi lisensi akun Pro Anda. Kami tidak pernah membagikan data nomor rekening, nama, atau kontak Anda kepada pihak ketiga pengiklan mana pun.
      </p>

      <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Enkripsi SSL 256-Bit</h2>
      <p>
        Seluruh komunikasi data antara peramban Anda dan situs JMTools dienkripsi penuh menggunakan protokol Transport Layer Security (TLS/HTTPS) 256-bit standar perbankan.
      </p>
    </article>
  )
}

export function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Syarat & Ketentuan Layanan (Terms of Service)</h1>
        <p className="text-xs text-slate-500 mt-1">Ketentuan Resmi Penggunaan Layanan JMTools</p>
      </div>

      <p>
        Selamat datang di JMTools. Dengan mengakses dan menggunakan layanan ini, Anda menyetujui ketentuan layanan resmi berikut:
      </p>

      <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Penggunaan Layanan yang Sah</h2>
      <p>
        Pengguna dilarang menggunakan alat JMTools untuk memproses, memanipulasi, atau mengedarkan dokumen yang melanggar hukum Republik Indonesia, termasuk dokumen pemalsuan identitas, malware, konten pornografi ilegal, atau berkas yang melanggar hak cipta pihak ketiga.
      </p>

      <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Lisensi Akun Pro Seumur Hidup (Lifetime)</h2>
      <p>
        Paket Akses Seumur Hidup memberikan hak bagi pembeli untuk menggunakan seluruh alat PDF dan Gambar tanpa batas selama layanan beroperasi. Pembelian adalah hak pakai satu pengguna dan tidak diperbolehkan untuk diperjualbelikan kembali (reseller) tanpa izin tertulis dari pemilik (Juan Karly Matheus).
      </p>

      <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Batasan Tanggung Jawab</h2>
      <p>
        JMTools menyediakan perkakas konversi dan optimasi secara optimal. Pengguna bertanggung jawab penuh atas penyimpanan berkas hasil unduhan di perangkat masing-masing sebelum masa retensi server berakhir.
      </p>
    </article>
  )
}

export function RefundPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Kebijakan Pengembalian Dana (Garansi 14 Hari)</h1>
        <p className="text-xs text-slate-500 mt-1">Jaminan 100% Kepuasan Pengguna & Keamanan Pembayaran</p>
      </div>

      <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:ring-emerald-800 flex items-start gap-3">
        <ShieldCheck className="size-6 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-emerald-950 dark:text-emerald-200">Komitmen Bebas Risiko 100%</h3>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
            Kami ingin Anda berbelanja dengan rasa tenang. Jika alat JMTools tidak dapat memenuhi kebutuhan Anda atau Anda mengalami kendala teknis yang tidak dapat diselesaikan, kami akan mengembalikan dana Anda 100% tanpa pertanyaan berbelit.
          </p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Periode Pengajuan</h2>
      <p>
        Pengajuan pengembalian dana dapat dilakukan maksimal dalam tempo <strong>14 (empat belas) hari kalender</strong> sejak tanggal transaksi pembayaran Anda.
      </p>

      <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Prosedur Klaim Pengembalian</h2>
      <p>
        Cukup hubungi WhatsApp resmi kami di <strong>{PAYMENT_CONFIG.whatsappNumber}</strong> atau email dengan menyertakan bukti transfer dan kode lisensi Anda. Dana akan ditransfer kembali ke rekening Bank/E-Wallet asal Anda dalam 1x24 jam kerja.
      </p>
    </article>
  )
}

export function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Kontak Resmi & Pengaduan Pelanggan</h1>
        <p className="text-sm text-slate-500">
          Kami siap membantu kendala teknis, konfirmasi pembayaran, hingga permohonan kemitraan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <UserCheck className="size-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Identitas Pengelola Resmi</h3>
            <p className="text-xs text-slate-500 mt-1">Founder & Developer JMTools:</p>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">JUAN KARLY MATHEUS</p>
          </div>
          <div className="border-t border-slate-100 pt-3 dark:border-slate-800 text-xs text-slate-500 space-y-1">
            <p>• Rekening Terdaftar: BCA & BRI</p>
            <p>• Wilayah Operasional: Indonesia</p>
            <p>• Status Verifikasi: Pemilik Sah Domain tools.sarjanait.com</p>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Phone className="size-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Layanan WhatsApp 24/7</h3>
            <p className="text-xs text-slate-500 mt-1">Konfirmasi Pembayaran & Bantuan Cepat:</p>
            <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">0823-9958-5050</p>
          </div>
          <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
            <a
              href={`https://wa.me/${PAYMENT_CONFIG.whatsappNumber}?text=${encodeURIComponent('Halo Juan / Admin JMTools, saya ingin bertanya perihal layanan...')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
            >
              <Phone className="size-3.5" /> Buka Chat WhatsApp Sekarang
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
