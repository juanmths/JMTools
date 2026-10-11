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
  ownerName: 'Juan Karly Matheus (Founder JMTools)',
  whatsappNumber: '6282399585050',
  whatsappWelcomeText: 'Halo Admin JMTools, saya ingin konfirmasi pembayaran paket:',

  qris: {
    enabled: true,
    merchantName: 'JMTOOLS PRO - JUAN KARLY MATHEUS',
    nmid: 'ID102938472910',
    imageUrl: '/qris.png',
  },

  bankAccounts: [
    {
      bankName: 'BCA (Bank Central Asia)',
      accountNumber: '7955528590',
      accountHolder: 'JUAN KARLY MATHEUS',
    },
    {
      bankName: 'Bank BRI (Bank Rakyat Indonesia)',
      accountNumber: '7772-01-000999-53-4',
      accountHolder: 'JUAN KARLY MATHEUS',
    },
  ],

  ewallets: [
    {
      name: 'DANA',
      phoneNumber: '0823-9958-5050',
      accountHolder: 'JUAN KARLY MATHEUS',
    },
    {
      name: 'OVO',
      phoneNumber: '0823-9958-5050',
      accountHolder: 'JUAN KARLY MATHEUS',
    },
    {
      name: 'GoPay',
      phoneNumber: '0823-9958-5050',
      accountHolder: 'JUAN KARLY MATHEUS',
    },
  ],

  gateway: {
    provider: 'manual', // Ubah ke 'midtrans' atau 'mayar' jika sudah mendaftar
  },
}
