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
