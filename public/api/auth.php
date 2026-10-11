<?php
/**
 * BACKEND API PHP & MYSQL UNTUK JMTOOLS (HOSTINGER)
 * 
 * Pengaturan:
 * Masukkan nama database, user, dan password database Hostinger Anda di bawah ini.
 */
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ==========================================
// KONFIGURASI DATABASE HOSTINGER ANDA:
// ==========================================
$DB_HOST = 'localhost';
$DB_NAME = 'u123456789_jmtools'; // Ganti dengan nama database Anda di Hostinger
$DB_USER = 'u123456789_root';    // Ganti dengan username database Anda
$DB_PASS = 'PasswordDatabaseAnda123'; // Ganti dengan password database Anda

function getDB() {
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS;
    try {
        $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        return $pdo;
    } catch (PDOException $e) {
        return null;
    }
}

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

$db = getDB();

if (!$db) {
    // Jika belum disetting koneksi database di Hostinger, berikan respon informatif
    echo json_encode([
        'status' => 'mock_fallback',
        'message' => 'Database MySQL belum dihubungkan. Silakan atur konfigurasi DB_NAME dan DB_PASS di public/api/auth.php.'
    ]);
    exit;
}

switch ($action) {
    case 'register':
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $phone = trim($input['phone'] ?? '');
        $password = $input['password'] ?? '';

        if (!$name || !$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Nama, email, dan kata sandi wajib diisi.']);
            exit;
        }

        // Cek email ganda
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Email ini sudah terdaftar. Silakan login.']);
            exit;
        }

        $id = 'u_' . bin2hex(random_bytes(8));
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $credits = 5;

        $stmt = $db->prepare("INSERT INTO users (id, name, email, phone, password_hash, provider, credits) VALUES (?, ?, ?, ?, ?, 'email', ?)");
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
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Email atau kata sandi salah.']);
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
        $email = trim($input['email'] ?? '');
        $name = trim($input['name'] ?? 'Pengguna Google');
        $avatar = $input['avatar'] ?? null;

        if (!$email) {
            http_response_code(400);
            echo json_encode(['error' => 'Email Google tidak ditemukan.']);
            exit;
        }

        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            // Update avatar jika ada
            if ($avatar && $avatar !== $user['avatar']) {
                $up = $db->prepare("UPDATE users SET avatar = ? WHERE id = ?");
                $up->execute([$avatar, $user['id']]);
            }
        } else {
            // Insert user baru Google
            $id = 'g_' . bin2hex(random_bytes(8));
            $credits = 5;
            $ins = $db->prepare("INSERT INTO users (id, name, email, provider, avatar, credits) VALUES (?, ?, ?, 'google', ?, ?)");
            $ins->execute([$id, $name, $email, $avatar, $credits]);

            $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
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
        $userId = $input['user_id'] ?? null;
        if (!$userId) {
            echo json_encode(['status' => 'ok']);
            exit;
        }

        $stmt = $db->prepare("SELECT credits, is_pro FROM users WHERE id = ?");
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
        $userId = $input['user_id'] ?? null;
        $plan = $input['plan'] ?? 'lifetime';
        $licenseKey = $input['license_key'] ?? ('JMT-' . strtoupper(bin2hex(random_bytes(4))));

        if ($userId) {
            $up = $db->prepare("UPDATE users SET is_pro = 1, plan = ?, license_key = ? WHERE id = ?");
            $up->execute([$plan, $licenseKey, $userId]);
        }
        echo json_encode(['status' => 'success', 'license_key' => $licenseKey]);
        break;

    default:
        echo json_encode(['status' => 'ok', 'version' => '1.0']);
        break;
}
