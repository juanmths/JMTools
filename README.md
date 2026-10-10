# JMTools

Aplikasi web modern untuk konversi berkas, pengubahan ukuran (resize), dan kompresi (Gambar & PDF) tanpa perlu login dan dengan jaminan privasi berkas.

## Fitur Utama

- **Unggah Cepat & Deteksi Tipe Asli:** Mendeteksi tipe MIME berkas secara akurat melalui *magic bytes*. Mendukung drag-and-drop, pemilihan berkas, dan tempel langsung (*paste* Ctrl+V).
- **Konversi Multi-Format:**
  - **Gambar:** JPG, PNG, WEBP, GIF, BMP (tujuan: JPG, PNG, WEBP).
  - **Dokumen:** PDF ke DOCX dan DOCX ke PDF.
- **Resize & Kompresi Gambar:**
  - Slider kualitas fleksibel (1–100%).
  - Pengubahan dimensi (lebar & tinggi) dengan opsi kunci rasio aspek otomatis (*lock aspect ratio*).
  - Preset ukuran cepat (1080p, 720p, 50%, 25%).
  - Penghapusan metadata EXIF / privasi.
  - Estimasi ukuran berkas langsung (*live size estimate*).
- **Kompresi PDF:**
  - Pilihan tingkat kompresi: Ringan (300 DPI), Direkomendasikan (150 DPI), dan Ekstrem (72 DPI).
  - Opsi hapus metadata dokumen & optimasi struktur objek.
  - Opsi konversi gambar dokumen ke *grayscale* untuk penghematan maksimal.
- **Pratinjau & Perbandingan Hasil:**
  - Visualisasi perbandingan ukuran berkas sebelum dan sesudah kompresi beserta persentase hematnya.
  - Slider interaktif perbandingan *Before / After* untuk gambar.
- **Privasi & Pembersihan Otomatis:**
  - Berkas diproses dan diset dengan batas waktu kedaluwarsa (TTL 15 menit).
  - Opsi "Hapus sekarang dari server" untuk pengguna yang ingin menghapus berkas seketika.

## Teknologi

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v6
- **State Management:** Zustand
- **Ikon & Komponen:** Lucide React
- **Pemrosesan PDF:** pdf-lib

## Menjalankan di Lokal

1. Pasang dependensi:
   ```bash
   npm install
   ```
2. Jalankan server pengembangan (*dev server*):
   ```bash
   npm run dev
   ```
3. Bangun untuk produksi (*production build*):
   ```bash
   npm run build
   ```

---

## Panduan Upload ke Hosting

Proyek ini telah dikonfigurasi dan siap di-deploy ke berbagai jenis hosting:

### 1. Vercel (Sangat Direkomendasikan — Gratis & Otomatis)
1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **Add New...** > **Project**.
3. Pilih repositori **juanmths/JMTools**.
4. Klik **Deploy** (Vercel otomatis mendeteksi Vite & `vercel.json` sudah disediakan).
5. Selesai! Setiap ada commit baru di branch `main`, web akan ter-update otomatis.

### 2. Netlify
1. Buka [netlify.com](https://netlify.com) dan import repositori GitHub **juanmths/JMTools**.
2. Build command: `npm run build`, Publish directory: `dist`.
3. File `_redirects` sudah disertakan di folder `dist` untuk penanganan rute SPA.

### 3. cPanel / Shared Hosting (Hostinger, Niagahoster, dll.)
1. Jalankan `npm run build` di komputer lokal Anda.
2. Buka folder `dist/`.
3. Kompres semua isi folder `dist/` menjadi file `.zip` (pastikan file `.htaccess` terikut).
4. Buka **File Manager** cPanel > masuk ke folder `public_html`.
5. Ekstrak file `.zip` langsung di dalam `public_html`.
6. File `.htaccess` bawaan akan otomatis menangani URL routing dan caching file statis.

### 4. VPS (Nginx)
Jika menggunakan Nginx, tambahkan baris `try_files` pada blok server Anda:
```nginx
location / {
    root /var/www/jmtools/dist;
    index index.html;
    try_files $uri $uri/ /index.html;
}
```
