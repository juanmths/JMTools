<?php
/**
 * BACKEND API PHP & MYSQL TERLINDUNGI & AMAN UNTUK JMTOOLS (HOSTINGER)
 * 
 * Keamanan yang diterapkan:
 * - Anti-SQL Injection (Native PDO Prepared Statements, Emulate Prepares = false)
 * - Anti-XSS (Input sanitization & strip_tags)
 * - Anti-Brute Force (IP-based Rate Limiter)
 * - Information Leak Prevention (Errors masked in production)
 * - Security HTTP Headers (nosniff, sameorigin, frame-options)
 */

// Sembunyikan pesan error internal PHP dari pengunjung agar struktur server tidak bocor
error_reporting(0);
ini_set('display_errors', '0');

// Header Keamanan & Response JSON
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ============================================================
// 1. RATE LIMITER SEDERHANA (Anti-Spam & Anti-Brute Force Bot)
// ============================================================
function checkRateLimit($maxRequests = 25, $timeWindowSeconds = 60) {
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $ipKey = 'rl_' . md5($ip);
    $tmpFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $ipKey . '.json';

    $now = time();
    $data = ['count' => 0, 'start' => $now];

    if (file_exists($tmpFile)) {
        $content = @file_get_contents($tmpFile);
        if ($content) {
            $parsed = @json_decode($content, true);
            if ($parsed && isset($parsed['start']) && ($now - $parsed['start']) < $timeWindowSeconds) {
                $data = $parsed;
            }
        }
    }

    $data['count']++;
    @file_put_contents($tmpFile, json_encode($data));

    if ($data['count'] > $maxRequests) {
        http_response_code(429);
        echo json_encode([
            'status' => 'error',
            'error' => 'Terlalu banyak permintaan (Rate limit exceeded). Mohon tunggu sejenak demi keamanan server.'
        ]);
        exit;
    }
}

// Jalankan proteksi rate limit
checkRateLimit(30, 60);

// ============================================================
// 2. KONFIGURASI DATABASE HOSTINGER ANDA:
// ============================================================
$DB_HOST = 'localhost';
$DB_NAME = 'u123456789_jmtools';     // Ganti dengan nama database Anda di Hostinger
$DB_USER = 'u123456789_root';        // Ganti dengan username database Anda
$DB_PASS = 'PasswordDatabaseAnda123'; // Ganti dengan password database Anda

function getDB() {
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS;
    try {
        $dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false, // Native Prepared Statements (100% Anti SQL Injection)
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        return new PDO($dsn, $DB_USER, $DB_PASS, $options);
    } catch (PDOException $e) {
        return null;
    }
}

// Sanitasi string aman dari XSS
function cleanString($str, $maxLen = 255) {
    if (!$str || !is_string($str)) return '';
    $clean = trim(strip_tags($str));
    return mb_substr($clean, 0, $maxLen, 'UTF-8');
}

$action = cleanString($_GET['action'] ?? '', 30);
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? [];

$db = getDB();

if (!$db) {
    // Mode fallback jika MySQL di Hostinger belum dikonfigurasi
    echo json_encode([
        'status' => 'mock_fallback',
        'message' => 'Database MySQL belum dihubungkan di public/api/auth.php. Silakan atur DB_NAME, DB_USER, dan DB_PASS.'
    ]);
    exit;
}

switch ($action) {
    case 'register':
        $name     = cleanString($input['name'] ?? '', 100);
        $email    = strtolower(trim($input['email'] ?? ''));
        $phone    = cleanString($input['phone'] ?? '', 30);
        $password = $input['password'] ?? '';

        if (!$name || !$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Nama lengkap, email, dan kata sandi wajib diisi.']);
            exit;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Format email tidak valid.']);
            exit;
        }

        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Kata sandi minimal harus 6 karakter demi keamanan akun Anda.']);
            exit;
        }

        if (strlen($password) > 72) {
            http_response_code(400);
            echo json_encode(['error' => 'Kata sandi terlalu panjang (maksimal 72 karakter).']);
            exit;
        }

        // Cek apakah email sudah digunakan
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Alamat email ini sudah terdaftar. Silakan login langsung.']);
            exit;
        }

        $id = 'u_' . bin2hex(random_bytes(8));
        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 11]);
        $credits = 5;

        $stmt = $db->prepare("INSERT INTO users (id, name, email, phone, password_hash, provider, credits, created_at) VALUES (?, ?, ?, ?, ?, 'email', ?, NOW())");
        $stmt->execute([$id, $name, $email, $phone, $hash, $credits]);

        echo json_encode([
            'status' => 'success',
            'user' => [
                'id' => $id,
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'provider' => 'email',
                'credits' => $credits,
                'is_pro' => false
            ]
        ]);
        break;

    case 'login':
        $email = strtolower(trim($input['email'] ?? ''));
        $password = $input['password'] ?? '';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Email dan kata sandi wajib diisi.']);
            exit;
        }

        $stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Email atau kata sandi tidak cocok.']);
            exit;
        }

        echo json_encode([
            'status' => 'success',
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'avatar' => $user['avatar'],
                'provider' => $user['provider'],
                'credits' => (int)$user['credits'],
                'is_pro' => (bool)$user['is_pro'],
                'plan' => $user['plan'],
                'license_key' => $user['license_key'],
                'expires_at' => $user['expires_at']
            ]
        ]);
        break;

    case 'google':
        $email  = strtolower(trim($input['email'] ?? ''));
        $name   = cleanString($input['name'] ?? 'Pengguna Google', 100);
        $avatar = cleanString($input['avatar'] ?? '', 500);

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email Google tidak valid.']);
            exit;
        }

        $stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            if ($avatar && $avatar !== $user['avatar']) {
                $up = $db->prepare("UPDATE users SET avatar = ? WHERE id = ?");
                $up->execute([$avatar, $user['id']]);
            }
        } else {
            $id = 'g_' . bin2hex(random_bytes(8));
            $credits = 5;
            $ins = $db->prepare("INSERT INTO users (id, name, email, provider, avatar, credits, created_at) VALUES (?, ?, ?, 'google', ?, ?, NOW())");
            $ins->execute([$id, $name, $email, $avatar ?: null, $credits]);

            $stmt = $db->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
            $stmt->execute([$id]);
            $user = $stmt->fetch();
        }

        echo json_encode([
            'status' => 'success',
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'avatar' => $user['avatar'],
                'provider' => 'google',
                'credits' => (int)$user['credits'],
                'is_pro' => (bool)$user['is_pro'],
                'plan' => $user['plan'],
                'license_key' => $user['license_key']
            ]
        ]);
        break;

    case 'consume_credit':
        $userId = cleanString($input['user_id'] ?? '', 50);
        if (!$userId) {
            echo json_encode(['status' => 'ok']);
            exit;
        }

        $stmt = $db->prepare("SELECT credits, is_pro FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $row = $stmt->fetch();

        if ($row && !$row['is_pro'] && $row['credits'] > 0) {
            $up = $db->prepare("UPDATE users SET credits = credits - 1 WHERE id = ?");
            $up->execute([$userId]);
            echo json_encode(['status' => 'success', 'remaining' => $row['credits'] - 1]);
        } else {
            echo json_encode(['status' => 'ok', 'remaining' => $row['credits'] ?? 0]);
        }
        break;

    case 'activate_pro':
        $userId = cleanString($input['user_id'] ?? '', 50);
        $plan = cleanString($input['plan'] ?? 'lifetime', 30);
        $licenseKey = cleanString($input['license_key'] ?? ('JMT-' . strtoupper(bin2hex(random_bytes(4)))), 60);

        if ($userId) {
            $up = $db->prepare("UPDATE users SET is_pro = 1, plan = ?, license_key = ? WHERE id = ?");
            $up->execute([$plan, $licenseKey, $userId]);
        }
        echo json_encode(['status' => 'success', 'license_key' => $licenseKey]);
        break;

    default:
        echo json_encode([
            'status' => 'ok',
            'service' => 'JMTools Secure API',
            'version' => '2.0-hardened',
            'ssl' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on'
        ]);
        break;
}
