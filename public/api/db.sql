-- ========================================================
-- SKEMA DATABASE MYSQL UNTUK JMTOOLS (HOSTINGER)
-- ========================================================
-- Cara menggunakan:
-- 1. Buka hPanel Hostinger > Manajemen Database MySQL.
-- 2. Buat database baru (contoh: u123456789_jmtools).
-- 3. Buka phpMyAdmin > Pilih database Anda > Klik menu "Import".
-- 4. Pilih file db.sql ini dan klik "Go" / "Kirim".
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
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `user_email` VARCHAR(150) NOT NULL,
  `plan_id` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `status` ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  `proof_image` VARCHAR(255) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_email` (`user_email`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
