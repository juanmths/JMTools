export type PlanId = 'monthly' | 'yearly' | 'lifetime'

export interface PlanFeature {
  text: string
  highlight?: boolean
}

export interface PricingPlan {
  id: PlanId
  name: string
  tagline: string
  badge?: string
  originalPrice: number
  discountPrice: number
  period: string
  savings?: string
  popular?: boolean
  features: PlanFeature[]
  ctaText: string
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Paket Bulanan',
    tagline: 'Cocok untuk tugas cepat atau kebutuhan mendesak.',
    originalPrice: 35000,
    discountPrice: 19000,
    period: '/ bulan',
    savings: 'Hemat 45%',
    popular: false,
    ctaText: 'Pilih Bulanan',
    features: [
      { text: 'Akses tanpa batas ke semua alat PDF & Gambar' },
      { text: 'Batas ukuran file hingga 1 GB (Gratis max 50 MB)' },
      { text: 'Pemrosesan hingga 20 berkas sekaligus (Batch)' },
      { text: 'Bebas iklan & tanpa watermark sponsor' },
      { text: 'Kecepatan pemrosesan prioritas' },
      { text: 'Batalkan langganan kapan saja' },
    ],
  },
  {
    id: 'yearly',
    name: 'Paket 1 Tahun',
    tagline: 'Solusi hemat untuk pelajar, mahasiswa, dan pekerja.',
    originalPrice: 228000,
    discountPrice: 89000,
    period: '/ tahun',
    savings: 'Hemat 61% (Cuma Rp7.400/bln)',
    popular: false,
    ctaText: 'Pilih 1 Tahun',
    features: [
      { text: 'Semua fitur Paket Bulanan' },
      { text: 'Batas ukuran file hingga 2 GB per berkas' },
      { text: 'Pemrosesan hingga 50 berkas sekaligus' },
      { text: 'Akses fitur OCR (Ekstrak Teks dari Gambar/PDF)' },
      { text: 'Prioritas pemrosesan server ultra-cepat' },
      { text: 'Bantuan CS prioritas via WhatsApp' },
    ],
  },
  {
    id: 'lifetime',
    name: 'Akses Seumur Hidup (Lifetime)',
    tagline: 'Sekali bayar, nikmati selamanya tanpa biaya bulanan lagi!',
    badge: '👑 PALING LARIS & VALUE TERBAIK',
    originalPrice: 499000,
    discountPrice: 149000,
    period: 'sekali bayar seumur hidup',
    savings: 'Hemat 70% • Bayar Sekali Selamanya',
    popular: true,
    ctaText: 'Beli Akses Seumur Hidup',
    features: [
      { text: '✅ SEKALI BAYAR UNTUK SEUMUR HIDUP (Tanpa Perpanjangan)', highlight: true },
      { text: 'Akses tanpa batas ke SEMUA alat PDF & Gambar selamanya' },
      { text: 'Batas ukuran berkas maksimal tanpa batas kuota' },
      { text: 'Pemrosesan batch tanpa batas jumlah berkas' },
      { text: 'GRATIS semua fitur baru yang akan datang di masa depan', highlight: true },
      { text: 'Akses ke OCR & AI Document tools mendatang' },
      { text: 'Bebas iklan 100% selamanya' },
      { text: 'Dukungan VIP khusus via WhatsApp langsung dari founder' },
    ],
  },
]

export type PaymentCategory = 'qris' | 'va' | 'ewallet' | 'transfer'

export interface PaymentMethod {
  id: string
  name: string
  category: PaymentCategory
  iconName: string
  fee: number
  instructions: string[]
  accountNumber?: string
  accountHolder?: string
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'qris',
    name: 'QRIS (Semua E-Wallet & Mobile Banking)',
    category: 'qris',
    iconName: 'QrCode',
    fee: 0,
    instructions: [
      'Buka aplikasi e-wallet (GoPay, OVO, Dana, ShopeePay) atau Mobile Banking (BCA, Mandiri, BRI, BNI).',
      'Pindai (Scan) Kode QRIS yang muncul di layar.',
      'Periksa nominal pembayaran dan nama merchant "JMTools Pro".',
      'Masukkan PIN Anda dan pembayaran akan diverifikasi secara otomatis dalam beberapa detik.',
    ],
  },
  {
    id: 'va_bca',
    name: 'BCA Virtual Account',
    category: 'va',
    iconName: 'Building2',
    accountNumber: '8270812938491029',
    accountHolder: 'JMTOOLS - PT KREASI DIGITAL',
    fee: 1000,
    instructions: [
      'Buka BCA mobile > m-Transfer > BCA Virtual Account.',
      'Masukkan nomor Virtual Account: 8270812938491029.',
      'Pastikan nama merchant adalah JMTools Pro dengan nominal yang sesuai.',
      'Masukkan PIN m-BCA Anda untuk menyelesaikan pembayaran.',
    ],
  },
  {
    id: 'va_mandiri',
    name: 'Mandiri Virtual Account',
    category: 'va',
    iconName: 'Building2',
    accountNumber: '8910812938491029',
    accountHolder: 'JMTOOLS - PT KREASI DIGITAL',
    fee: 1000,
    instructions: [
      'Buka aplikasi Livin by Mandiri > Bayar > Multipayment.',
      'Pilih penyedia jasa atau masukkan kode perusahaan JMTools.',
      'Masukkan nomor Virtual Account: 8910812938491029.',
      'Konfirmasi pembayaran dan masukkan PIN Anda.',
    ],
  },
  {
    id: 'va_bri',
    name: 'BRI Virtual Account (BRIVA)',
    category: 'va',
    iconName: 'Building2',
    accountNumber: '1280812938491029',
    accountHolder: 'JMTOOLS - PT KREASI DIGITAL',
    fee: 1000,
    instructions: [
      'Buka aplikasi BRImo > Pembayaran > BRIVA.',
      'Masukkan nomor BRIVA: 1280812938491029.',
      'Periksa detail pembayaran dan masukkan PIN BRImo Anda.',
    ],
  },
  {
    id: 'ewallet_dana',
    name: 'DANA',
    category: 'ewallet',
    iconName: 'Smartphone',
    fee: 0,
    instructions: [
      'Masukkan nomor handphone akun DANA Anda.',
      'Klik tombol "Bayar dengan DANA".',
      'Anda akan diarahkan untuk otentikasi di aplikasi DANA atau memasukkan PIN DANA.',
    ],
  },
  {
    id: 'ewallet_gopay',
    name: 'GoPay',
    category: 'ewallet',
    iconName: 'Smartphone',
    fee: 0,
    instructions: [
      'Klik tombol "Bayar dengan GoPay".',
      'Buka aplikasi GoJek Anda dan konfirmasi pembayaran di halaman checkout.',
    ],
  },
  {
    id: 'ewallet_shopeepay',
    name: 'ShopeePay',
    category: 'ewallet',
    iconName: 'Smartphone',
    fee: 0,
    instructions: [
      'Buka aplikasi Shopee atau pindai barcode pembayaran ShopeePay.',
      'Gunakan saldo atau koin Shopee Anda untuk menyelesaikan transaksi.',
    ],
  },
  {
    id: 'transfer_manual',
    name: 'Transfer Bank Manual (BCA / Mandiri) & WhatsApp',
    category: 'transfer',
    iconName: 'CreditCard',
    accountNumber: '8730-192-819',
    accountHolder: 'Juan Matheus (Founder JMTools)',
    fee: 0,
    instructions: [
      'Transfer sesuai total nominal ke rekening BCA: 8730-192-819 a/n Juan Matheus.',
      'Simpan bukti transfer / struk pembayaran.',
      'Klik tombol "Konfirmasi WhatsApp" untuk mengirim bukti transfer ke tim kami. Akun langsung diaktifkan dalam 5 menit!',
    ],
  },
]

export const PRICING_FAQ = [
  {
    q: 'Bagaimana cara kerja Paket Seumur Hidup (Lifetime Deal)?',
    a: 'Anda hanya membayar 1 kali (Rp 149.000) dan mendapatkan akses tanpa batas ke semua fitur JMTools Pro selamanya. Tidak ada biaya tersembunyi, tidak ada perpanjangan tahunan atau bulanan. Anda juga akan mendapatkan pembaruan fitur baru secara gratis di masa depan.',
  },
  {
    q: 'Apakah pembayaran aman dan terverifikasi otomatis?',
    a: 'Sangat aman! Kami mendukung pembayaran QRIS dan Virtual Account otomatis. Setelah Anda melakukan scan QRIS atau transfer ke Virtual Account, sistem kami akan langsung mendeteksi dan mengaktifkan akun Pro Anda dalam hitungan detik.',
  },
  {
    q: 'Apakah bisa digunakan di banyak perangkat (HP, Laptop, Tablet)?',
    a: 'Ya, lisensi akun Pro Anda dapat digunakan di semua perangkat yang Anda miliki. Cukup simpan kode lisensi Anda atau login dengan akun Anda.',
  },
  {
    q: 'Apakah ada jaminan uang kembali jika saya tidak puas?',
    a: 'Tentu saja! Kami memberikan jaminan 100% uang kembali dalam 14 hari pertama jika fitur JMTools tidak memenuhi kebutuhan Anda. Hubungi kami via WhatsApp atau email untuk proses refund instan.',
  },
  {
    q: 'Bagaimana jika saya ingin bayar via Transfer Manual?',
    a: 'Bisa! Anda dapat memilih metode Transfer Bank Manual di halaman pembayaran, lalu kirimkan bukti transfer ke kontak WhatsApp kami. Tim kami akan segera mengirimkan kode lisensi aktif untuk Anda.',
  },
]
