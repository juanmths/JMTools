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
    id: 'transfer_manual',
    name: 'Transfer Bank Langsung (BCA & BRI)',
    category: 'transfer',
    iconName: 'Building2',
    accountNumber: '7955528590',
    accountHolder: 'JUAN KARLY MATHEUS',
    fee: 0,
    instructions: [
      'Pilih transfer ke rekening BCA: 7955528590 atau BRI: 7772-01-000999-53-4 a/n JUAN KARLY MATHEUS.',
      'Transfer sesuai total nominal (bebas biaya admin).',
      'Simpan bukti transfer dan klik tombol konfirmasi WhatsApp.',
      'Lisensi Pro langsung aktif dalam hitungan 5 menit!',
    ],
  },
  {
    id: 'qris',
    name: 'QRIS (Scan Bebas Semua Bank & E-Wallet)',
    category: 'qris',
    iconName: 'QrCode',
    fee: 0,
    instructions: [
      'Buka aplikasi m-Banking (BCA, BRI, Mandiri, BNI) atau E-Wallet (GoPay, OVO, DANA, ShopeePay).',
      'Pindai (Scan) Kode QRIS yang muncul di layar pembayaran.',
      'Periksa nominal dan nama penerima "JMTOOLS PRO - JUAN KARLY MATHEUS".',
      'Masukkan PIN Anda dan pembayaran selesai tanpa biaya admin.',
    ],
  },
  {
    id: 'ewallet_all',
    name: 'Dompet Digital (DANA, OVO, GoPay)',
    category: 'ewallet',
    iconName: 'Smartphone',
    accountNumber: '0823-9958-5050',
    accountHolder: 'JUAN KARLY MATHEUS',
    fee: 0,
    instructions: [
      'Buka aplikasi DANA, OVO, atau GoPay di ponsel Anda.',
      'Kirim saldo ke nomor handphone: 0823-9958-5050 a/n JUAN KARLY MATHEUS.',
      'Salin nomor dengan tombol yang tersedia untuk memudahkan transaksi.',
      'Konfirmasi via WhatsApp untuk verifikasi kilat.',
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
