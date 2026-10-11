<?php
/**
 * ============================================================
 * KONFIGURASI SISTEM PEMBAYARAN OTOMATIS & BOT WHATSAPP JMTOOLS
 * ============================================================
 * 
 * Pemilik: JUAN KARLY MATHEUS (Founder JMTools)
 * Email Admin: juankarlymatheus@gmail.com
 * WhatsApp Pemilik: 082399585050 (6282399585050)
 */

// 1. KONEKSI DATABASE MYSQL HOSTINGER
define('DB_HOST', 'localhost');
define('DB_NAME', 'u810020080_jmtools');
define('DB_USER', 'u810020080_jmtools');
define('DB_PASS', 'edk;Unrf:U2');

// 2. ADMIN EMAIL RESMI
define('ADMIN_EMAIL', 'juankarlymatheus@gmail.com');
define('ADMIN_PHONE', '6282399585050');
define('APP_URL', 'https://tools.sarjanait.com');

// 3. PAYMENT GATEWAY TRIPAY (Sangat direkomendasikan untuk QRIS & VA Otomatis 24 Jam)
// Daftar gratis di https://tripay.co.id (Bisa untuk Perorangan cukup KTP)
define('TRIPAY_ENABLED', false); // Ubah ke true jika sudah memasukkan API Key di bawah
define('TRIPAY_API_KEY', 'MASUKKAN_TRIPAY_API_KEY_ANDA_DISINI');
define('TRIPAY_PRIVATE_KEY', 'MASUKKAN_TRIPAY_PRIVATE_KEY_ANDA_DISINI');
define('TRIPAY_MERCHANT_CODE', 'MASUKKAN_TRIPAY_MERCHANT_CODE_DISINI');
define('TRIPAY_IS_PRODUCTION', true); // false = Sandbox (Testing), true = Live (Produksi)

// 4. PAYMENT GATEWAY MIDTRANS (Alternatif)
define('MIDTRANS_ENABLED', false);
define('MIDTRANS_SERVER_KEY', 'MASUKKAN_MIDTRANS_SERVER_KEY_DISINI');
define('MIDTRANS_CLIENT_KEY', 'MASUKKAN_MIDTRANS_CLIENT_KEY_DISINI');
define('MIDTRANS_IS_PRODUCTION', true);

// 5. BOT WHATSAPP OTOMATIS (FONNTE API - https://fonnte.com)
// Mengirimkan notifikasi struk & kode lisensi otomatis ke WhatsApp pembeli saat uang masuk
define('FONNTE_ENABLED', false); // Ubah ke true jika sudah memasukkan Token Fonnte
define('FONNTE_TOKEN', 'MASUKKAN_TOKEN_FONNTE_DISINI');

// 6. HELPER KONEKSI DATABASE PDO AMAN
function getPaymentDB() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false, // Native Prepared Statements (100% Anti SQL Injection)
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        return null;
    }
}
