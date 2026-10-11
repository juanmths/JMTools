/**
 * =========================================================================
 * KONFIGURASI RESMI PENDAFTARAN & LOGIN DENGAN AKUN GOOGLE (GOOGLE SIGN-IN)
 * =========================================================================
 * 
 * Panduan untuk Menghubungkan ke Akun Google Anda:
 * 1. Buka Google Cloud Console: https://console.cloud.google.com/
 * 2. Buat Project baru atau pilih yang sudah ada (misal nama: "JMTools").
 * 3. Buka menu "APIs & Services" > "OAuth consent screen":
 *    - Pilih User Type: "External"
 *    - Isi App name: "JMTools"
 *    - Isi User support email & Developer contact info dengan email Anda.
 * 4. Buka menu "APIs & Services" > "Credentials":
 *    - Klik "+ CREATE CREDENTIALS" > pilih "OAuth client ID".
 *    - Application type: "Web application".
 *    - Name: "JMTools Web Client".
 *    - Authorized JavaScript origins, tambahkan 2 URL ini:
 *        a) http://localhost:5173      (untuk testing di laptop/komputer Anda)
 *        b) https://tools.sarjanait.com (alamat domain website Anda di Hostinger)
 * 5. Klik "CREATE". Salin "Client ID" yang muncul (berakhiran .apps.googleusercontent.com)
 * 6. Tempelkan (paste) Client ID Anda pada variabel `clientId` di bawah ini!
 */

export interface GoogleAuthConfig {
  clientId: string
  enabled: boolean
}

export const GOOGLE_AUTH_CONFIG: GoogleAuthConfig = {
  // Diambil secara aman dari .env (VITE_GOOGLE_CLIENT_ID)
  clientId: (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || '',
  enabled: true,
}

/**
 * Memeriksa apakah Google Client ID aktif dan valid
 */
export function isGoogleClientConfigured(): boolean {
  return (
    Boolean(GOOGLE_AUTH_CONFIG.clientId) &&
    GOOGLE_AUTH_CONFIG.clientId.includes('.apps.googleusercontent.com')
  )
}

/**
 * Decode JWT Token resmi yang dikirimkan oleh Google Identity Services
 */
export function parseGoogleJwt(token: string): {
  sub: string
  email: string
  name: string
  picture?: string
} | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}
