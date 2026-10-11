/**
 * KONFIGURASI REKENING & PEMBAYARAN PEMILIK WEBSITE (JMTools)
 *
 * Ganti data di bawah ini dengan data rekening Bank, nomor WhatsApp,
 * dan link/gambar QRIS milik Anda sendiri agar uang pembayaran langsung masuk ke kantong Anda!
 */

export interface PaymentConfig {
  ownerName: string
  whatsappNumber: string // Format internasional: 628xxx (tanpa + atau 0 di depan)
  whatsappWelcomeText: string

  // QRIS Pribadi / Merchant Anda (dari GoBiz, BCA Merchant, DANA Bisnis, dll)
  qris: {
    enabled: boolean
    merchantName: string
    nmid: string
    // Bisa berupa link gambar QRIS Anda atau letakkan file di folder public/qris-saya.png
    imageUrl: string
  }

  // Rekening Bank Pribadi Anda
  bankAccounts: {
    bankName: string
    accountNumber: string
    accountHolder: string
  }[]

  // Dompet Digital / E-Wallet Anda
  ewallets: {
    name: string
    phoneNumber: string
    accountHolder: string
  }[]

  // Pengaturan Payment Gateway Otomatis (Opsional jika memakai Midtrans/Mayar)
  gateway: {
    provider: 'manual' | 'midtrans' | 'mayar'
    midtransClientKey?: string
    mayarApiKey?: string
  }
}

export const PAYMENT_CONFIG: PaymentConfig = {
  ownerName: 'Juan Matheus (Owner JMTools)',
  whatsappNumber: '6281234567890', // Ganti dengan nomor WhatsApp Anda!
  whatsappWelcomeText: 'Halo Admin JMTools, saya ingin konfirmasi pembayaran paket:',

  qris: {
    enabled: true,
    merchantName: 'JMTOOLS PRO STORE',
    nmid: 'ID102938472910',
    // Ganti dengan URL gambar QRIS Anda atau simpan gambar di public/qris.png
    imageUrl: '/qris.png',
  },

  bankAccounts: [
    {
      bankName: 'BCA (Bank Central Asia)',
      accountNumber: '8730-192-819', // Ganti dengan nomor rekening BCA Anda!
      accountHolder: 'Juan Matheus',
    },
    {
      bankName: 'Bank Mandiri',
      accountNumber: '137-00-1928374-1', // Ganti dengan nomor rekening Mandiri Anda!
      accountHolder: 'Juan Matheus',
    },
    {
      bankName: 'Bank BRI',
      accountNumber: '0281-01-029384-50-1', // Ganti dengan nomor rekening BRI Anda!
      accountHolder: 'Juan Matheus',
    },
  ],

  ewallets: [
    {
      name: 'DANA',
      phoneNumber: '0812-3456-7890', // Ganti dengan nomor DANA Anda!
      accountHolder: 'Juan Matheus',
    },
    {
      name: 'GoPay',
      phoneNumber: '0812-3456-7890', // Ganti dengan nomor GoPay Anda!
      accountHolder: 'Juan Matheus',
    },
    {
      name: 'OVO',
      phoneNumber: '0812-3456-7890', // Ganti dengan nomor OVO Anda!
      accountHolder: 'Juan Matheus',
    },
    {
      name: 'ShopeePay',
      phoneNumber: '0812-3456-7890', // Ganti dengan nomor ShopeePay Anda!
      accountHolder: 'Juan Matheus',
    },
  ],

  gateway: {
    provider: 'manual', // Ubah ke 'midtrans' atau 'mayar' jika sudah mendaftar
  },
}
