-- ========================================================
-- SKEMA DATABASE MYSQL RESMI UNTUK JMTOOLS (HOSTINGER)
-- ========================================================
-- Pemilik: JUAN KARLY MATHEUS
-- Database Name: u810020080_jmtools
-- 
-- Cara Menggunakan di Hostinger:
-- 1. Buka hPanel Hostinger > Databases > phpMyAdmin.
-- 2. Pilih database u810020080_jmtools.
-- 3. Klik tab "SQL" atau "Import".
-- 4. Tempel skrip ini dan klik "Go" / "Kirim".
-- ========================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NULL,
  `password_hash` VARCHAR(255) NULL,
  `provider` ENUM('email', 'google') DEFAULT 'email',
  `avatar` VARCHAR(255) NULL,
  `credits` INT NOT NULL DEFAULT 5,
  `is_pro` TINYINT(1) NOT NULL DEFAULT 0,
  `plan` VARCHAR(50) NULL, -- 'monthly', 'yearly', 'lifetime'
  `license_key` VARCHAR(100) NULL,
  `expires_at` VARCHAR(100) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_license` (`license_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(60) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(50) NULL,
  `user_name` VARCHAR(100) NULL,
  `user_email` VARCHAR(150) NOT NULL,
  `user_phone` VARCHAR(30) NULL,
  `plan` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `unique_code` INT DEFAULT 0,
  `payment_method` VARCHAR(50) NOT NULL,
  `payment_reference` VARCHAR(100) NULL,
  `qr_url` TEXT NULL,
  `pay_code` VARCHAR(100) NULL,
  `license_key` VARCHAR(100) NULL,
  `status` ENUM('pending', 'paid', 'expired', 'failed') DEFAULT 'pending',
  `paid_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_email` (`user_email`),
  INDEX `idx_status` (`status`),
  INDEX `idx_ref` (`payment_reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
