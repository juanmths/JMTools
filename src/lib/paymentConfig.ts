/**
 * KONFIGURASI REKENING, PAYMENT GATEWAY & BOT WHATSAPP JMTOOLS
 * Pemilik: Juan Karly Matheus
 */

export interface PaymentConfig {
  ownerName: string
  whatsappNumber: string // Format internasional: 628xxx (tanpa + atau 0 di depan)
  whatsappWelcomeText: string

  // QRIS Statis Juan Karly Matheus
  qris: {
    enabled: boolean
    merchantName: string
    nmid: string
    imageUrl: string
  }

  // Rekening Bank Pribadi
  bankAccounts: {
    bankName: string
    accountNumber: string
    accountHolder: string
  }[]

  // Dompet Digital / E-Wallet
  ewallets: {
    name: string
    phoneNumber: string
    accountHolder: string
  }[]

  // Otomatisasi & Polling Gateway
  automation: {
    autoPollingEnabled: boolean
    pollingIntervalMs: number
    autoWaReceipt: boolean
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

  automation: {
    autoPollingEnabled: true,
    pollingIntervalMs: 3000, // Cek status tiap 3 detik
    autoWaReceipt: true, // Kirim struk otomatis via Bot WhatsApp ke pembeli
  },
}
