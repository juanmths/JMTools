<?php
/**
 * ============================================================
 * PAYMENT GATEWAY WEBHOOK & OTOMASI LISENSI JMTOOLS
 * ============================================================
 * 
 * Sistem ini memproses:
 * 1. Pembuatan Invoice & Order Transaksi Unik
 * 2. Real-time Status Polling dari Browser Pengguna
 * 3. Webhook Listener Otomatis (Tripay & Midtrans) 24 Jam Non-Stop
 * 4. Aktivasi Otomatis Akun Pro ke Database MySQL Hostinger
 * 5. Pengiriman Lisensi & Struk Otomatis via WhatsApp Bot (Fonnte API)
 */

error_reporting(0);
ini_set('display_errors', '0');

// Header Keamanan & Response JSON
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Callback-Signature, X-Callback-Event');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/payment_config.php';

// Sanitasi String
function cleanInput($data, $maxLen = 255) {
    if (!$data || !is_string($data)) return '';
    $clean = trim(strip_tags($data));
    return mb_substr($clean, 0, $maxLen, 'UTF-8');
}

// Normalisasi nomor telepon ke format internasional (misal 0823... -> 62823...)
function normalizePhone($phone) {
    $cleaned = preg_replace('/[^0-9]/', '', (string)$phone);
    if (str_starts_with($cleaned, '0')) {
        return '62' . substr($cleaned, 1);
    }
    if (str_starts_with($cleaned, '8')) {
        return '62' . $cleaned;
    }
    return $cleaned;
}

// Kirim Pesan via Bot WhatsApp (Fonnte API)
function sendWhatsAppNotification($phone, $message) {
    if (!FONNTE_ENABLED || !FONNTE_TOKEN || FONNTE_TOKEN === 'MASUKKAN_TOKEN_FONNTE_DISINI') {
        return ['status' => false, 'message' => 'Fonnte WA Bot is not configured or disabled'];
    }

    $targetPhone = normalizePhone($phone);
    if (empty($targetPhone) || strlen($targetPhone) < 10) {
        return ['status' => false, 'message' => 'Invalid phone number'];
    }

    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => 'https://api.fonnte.com/send',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => [
            'target' => $targetPhone,
            'message' => $message,
            'countryCode' => '62',
        ],
        CURLOPT_HTTPHEADER => [
            'Authorization: ' . FONNTE_TOKEN
        ],
    ]);

    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);

    if ($err) {
        return ['status' => false, 'error' => $err];
    }
    return ['status' => true, 'response' => json_decode($response, true)];
}

// Generate License Key Unik
function generateLicenseKey($plan = 'lifetime') {
    $planClean = strtoupper(cleanInput($plan, 20));
    $hexPart = strtoupper(bin2hex(random_bytes(3)));
    $timePart = strtoupper(substr(dechex(time()), -4));
    return "JMT-{$planClean}-{$hexPart}-{$timePart}";
}

// Aktivasi Order & Akun User di Database MySQL
function activateOrderAndUser($db, $orderId, $paymentMethod = null) {
    if (!$db || !$orderId) return false;

    // Ambil data order
    $stmt = $db->prepare("SELECT * FROM transactions WHERE id = ? LIMIT 1");
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();

    if (!$order) {
        // Coba cari via payment_reference
        $stmtRef = $db->prepare("SELECT * FROM transactions WHERE payment_reference = ? LIMIT 1");
        $stmtRef->execute([$orderId]);
        $order = $stmtRef->fetch();
        if (!$order) return false;
    }

    $licenseKey = $order['license_key'];
    if (empty($licenseKey)) {
        $licenseKey = generateLicenseKey($order['plan']);
    }

    $method = $paymentMethod ?: $order['payment_method'];

    // 1. Update status transaksi menjadi paid
    $upTx = $db->prepare("UPDATE transactions SET status = 'paid', license_key = ?, payment_method = ?, paid_at = NOW() WHERE id = ?");
    $upTx->execute([$licenseKey, $method, $order['id']]);

    // 2. Update user jika email terdaftar
    if (!empty($order['user_email'])) {
        $upUser = $db->prepare("UPDATE users SET is_pro = 1, plan = ?, license_key = ? WHERE email = ?");
        $upUser->execute([$order['plan'], $licenseKey, strtolower($order['user_email'])]);
    }

    // 3. Kirim notifikasi WhatsApp otomatis ke pembeli jika nomor HP tersedia
    $phone = $order['user_phone'];
    if (!empty($phone)) {
        $planName = ($order['plan'] === 'lifetime') ? 'Akses Seumur Hidup (Lifetime)' : (($order['plan'] === 'yearly') ? 'Paket 1 Tahun' : 'Paket Bulanan');
        $nominalStr = number_format((float)$order['amount'], 0, ',', '.');
        $buyerName = !empty($order['user_name']) ? $order['user_name'] : 'Pelanggan Setia';

        $waMessage = "Halo Kak {$buyerName}! 🎉\n\n"
            . "Pembayaran Anda untuk *JMTools Pro* sebesar *Rp {$nominalStr}* telah *BERHASIL DIVERIFIKASI SECARA OTOMATIS*.\n\n"
            . "📋 *DETAIL PESANAN:*\n"
            . "• No. Order: {$order['id']}\n"
            . "• Paket: {$planName}\n"
            . "• Status: LUNAS & AKTIF\n\n"
            . "🔑 *KODE LISENSI RESMI ANDA:*\n"
            . "*{$licenseKey}*\n\n"
            . "🚀 *CARA PAKAI:*\n"
            . "Akun Anda ({$order['user_email']}) sudah otomatis aktif. Anda bisa langsung membuka website:\n"
            . APP_URL . "/pricing\n\n"
            . "Jika ada pertanyaan, silakan hubungi tim kami kapan saja. Terima kasih banyak atas kepercayaan Anda!\n\n"
            . "Salam hangat,\n"
            . "Juan Karly Matheus\n"
            . "Founder JMTools";

        sendWhatsAppNotification($phone, $waMessage);
    }

    return [
        'order_id' => $order['id'],
        'license_key' => $licenseKey,
        'plan' => $order['plan'],
        'user_email' => $order['user_email']
    ];
}

$action = cleanInput($_GET['action'] ?? '', 40);
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? [];

$db = getPaymentDB();

switch ($action) {
    // ============================================================
    // 1. STATUS KONFIGURASI SISTEM
    // ============================================================
    case 'get_config_status':
        echo json_encode([
            'status' => 'success',
            'tripay_enabled' => TRIPAY_ENABLED,
            'midtrans_enabled' => MIDTRANS_ENABLED,
            'fonnte_enabled' => FONNTE_ENABLED,
            'admin_phone' => ADMIN_PHONE,
            'app_url' => APP_URL
        ]);
        break;

    // ============================================================
    // 2. PEMBUATAN ORDER TRANSAKSI (CREATE ORDER)
    // ============================================================
    case 'create_order':
        $userId        = cleanInput($input['user_id'] ?? '', 50);
        $userName      = cleanInput($input['user_name'] ?? 'Pelanggan', 100);
        $userEmail     = strtolower(cleanInput($input['user_email'] ?? '', 150));
        $userPhone     = cleanInput($input['user_phone'] ?? '', 30);
        $plan          = cleanInput($input['plan'] ?? 'lifetime', 30);
        $paymentMethod = cleanInput($input['payment_method'] ?? 'QRIS Otomatis', 50);
        $rawAmount     = (float)($input['amount'] ?? 149000);

        if (empty($userEmail)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email pembeli wajib diisi untuk aktivasi lisensi.']);
            exit;
        }

        // Generate ID Order Unik: JMT-2610-XXXX
        $orderId = 'JMT-' . date('ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
        
        // Buat 3 digit unik untuk pembayaran manual/transfer agar mudah dicocokkan otomatis (misal: 149.382)
        $uniqueCode = rand(101, 899);
        $totalAmount = $rawAmount + $uniqueCode;
        $licenseKey = generateLicenseKey($plan);

        $qrUrl = null;
        $payCode = null;
        $paymentRef = null;

        // Jika Tripay Diaktifkan dan Metode adalah QRIS / VA Tripay
        if (TRIPAY_ENABLED && TRIPAY_API_KEY !== 'MASUKKAN_TRIPAY_API_KEY_ANDA_DISINI') {
            $tripayEndpoint = TRIPAY_IS_PRODUCTION 
                ? 'https://tripay.co.id/api/transaction/create' 
                : 'https://tripay.co.id/api-sandbox/transaction/create';

            // Tentukan kode metode Tripay (misal QRIS2, BCAVA, BRIVA, MANDIRIVA)
            $tripayMethod = 'QRIS2';
            if (stripos($paymentMethod, 'bca') !== false) $tripayMethod = 'BCAVA';
            elseif (stripos($paymentMethod, 'bri') !== false) $tripayMethod = 'BRIVA';
            elseif (stripos($paymentMethod, 'mandiri') !== false) $tripayMethod = 'MANDIRIVA';

            $tripayPayload = [
                'method'         => $tripayMethod,
                'merchant_ref'   => $orderId,
                'amount'         => (int)$rawAmount,
                'customer_name'  => $userName,
                'customer_email' => $userEmail,
                'customer_phone' => normalizePhone($userPhone ?: '082399585050'),
                'order_items'    => [
                    [
                        'sku'      => 'PRO-' . strtoupper($plan),
                        'name'     => 'JMTools Pro (' . ucfirst($plan) . ')',
                        'price'    => (int)$rawAmount,
                        'quantity' => 1
                    ]
                ],
                'callback_url'   => APP_URL . '/api/payment.php?action=tripay_webhook',
                'return_url'     => APP_URL . '/checkout?plan=' . $plan,
                'expired_time'   => (time() + (24 * 60 * 60)), // 24 jam
                'signature'      => hash_hmac('sha256', TRIPAY_MERCHANT_CODE . $orderId . (int)$rawAmount, TRIPAY_PRIVATE_KEY)
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $tripayEndpoint);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($tripayPayload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . TRIPAY_API_KEY
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);
            $res = curl_exec($ch);
            curl_close($ch);

            if ($res) {
                $tData = json_decode($res, true);
                if (!empty($tData['success']) && !empty($tData['data'])) {
                    $qrUrl      = $tData['data']['qr_url'] ?? null;
                    $payCode    = $tData['data']['pay_code'] ?? null;
                    $paymentRef = $tData['data']['reference'] ?? null;
                    $totalAmount = (float)$tData['data']['amount'];
                }
            }
        }

        // Simpan transaksi ke database MySQL
        if ($db) {
            $ins = $db->prepare("INSERT INTO transactions 
                (id, user_id, user_name, user_email, user_phone, plan, amount, unique_code, payment_method, payment_reference, qr_url, pay_code, license_key, status, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())");
            $ins->execute([
                $orderId,
                $userId ?: null,
                $userName,
                $userEmail,
                $userPhone,
                $plan,
                $totalAmount,
                $uniqueCode,
                $paymentMethod,
                $paymentRef,
                $qrUrl,
                $payCode,
                $licenseKey
            ]);
        }

        echo json_encode([
            'status' => 'success',
            'order' => [
                'id'             => $orderId,
                'plan'           => $plan,
                'raw_amount'     => $rawAmount,
                'unique_code'    => $uniqueCode,
                'total_amount'   => $totalAmount,
                'payment_method' => $paymentMethod,
                'qr_url'         => $qrUrl,
                'pay_code'       => $payCode,
                'reference'      => $paymentRef,
                'user_email'     => $userEmail,
                'user_phone'     => $userPhone,
                'license_key'    => $licenseKey,
                'status'         => 'pending'
            ]
        ]);
        break;

    // ============================================================
    // 3. AUTO-POLLING STATUS DARI BROWSER (CHECK STATUS)
    // ============================================================
    case 'check_status':
        $orderId = cleanInput($_GET['order_id'] ?? $input['order_id'] ?? '', 60);

        if (empty($orderId)) {
            http_response_code(400);
            echo json_encode(['error' => 'Order ID wajib disertakan.']);
            exit;
        }

        if (!$db) {
            echo json_encode(['status' => 'pending']);
            exit;
        }

        $stmt = $db->prepare("SELECT id, user_email, plan, amount, status, license_key, paid_at FROM transactions WHERE id = ? LIMIT 1");
        $stmt->execute([$orderId]);
        $tx = $stmt->fetch();

        if (!$tx) {
            echo json_encode(['status' => 'not_found']);
            exit;
        }

        if ($tx['status'] === 'paid') {
            echo json_encode([
                'status'      => 'paid',
                'is_pro'      => true,
                'order_id'    => $tx['id'],
                'plan'        => $tx['plan'],
                'license_key' => $tx['license_key'],
                'paid_at'     => $tx['paid_at']
            ]);
        } else {
            echo json_encode([
                'status'   => 'pending',
                'order_id' => $tx['id']
            ]);
        }
        break;

    // ============================================================
    // 4. WEBHOOK TRIPAY RESMI (24 JAM OTOMATIS)
    // ============================================================
    case 'tripay_webhook':
        $callbackSignature = $_SERVER['HTTP_X_CALLBACK_SIGNATURE'] ?? '';
        $jsonPayload = file_get_contents('php://input');

        // Validasi Signature Resmi Tripay
        $expectedSignature = hash_hmac('sha256', $jsonPayload, TRIPAY_PRIVATE_KEY);

        if (!hash_equals($expectedSignature, $callbackSignature)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Invalid Callback Signature']);
            exit;
        }

        $event = $_SERVER['HTTP_X_CALLBACK_EVENT'] ?? '';
        if ($event === 'payment_status') {
            $data = json_decode($jsonPayload, true);
            $merchantRef = $data['merchant_ref'] ?? '';
            $status = strtoupper($data['status'] ?? '');

            if ($status === 'PAID') {
                activateOrderAndUser($db, $merchantRef, $data['payment_method'] ?? 'Tripay Payment');
            }
        }

        echo json_encode(['success' => true]);
        break;

    // ============================================================
    // 5. WEBHOOK MIDTRANS RESMI (24 JAM OTOMATIS)
    // ============================================================
    case 'midtrans_webhook':
        $notif = json_decode(file_get_contents('php://input'), true);
        if (!$notif) {
            http_response_code(400);
            exit;
        }

        $orderId = $notif['order_id'] ?? '';
        $statusCode = $notif['status_code'] ?? '';
        $grossAmount = $notif['gross_amount'] ?? '';
        $serverKey = MIDTRANS_SERVER_KEY;
        $inputSignature = $notif['signature_key'] ?? '';

        // Validasi Signature Midtrans SHA512
        $expectedSig = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        if ($expectedSig !== $inputSignature) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Invalid signature']);
            exit;
        }

        $transactionStatus = $notif['transaction_status'] ?? '';
        $fraudStatus = $notif['fraud_status'] ?? '';

        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'challenge') {
                // Fraud challenge
            } else if ($fraudStatus == 'accept') {
                activateOrderAndUser($db, $orderId, 'Midtrans Credit Card');
            }
        } else if ($transactionStatus == 'settlement') {
            activateOrderAndUser($db, $orderId, $notif['payment_type'] ?? 'Midtrans');
        }

        echo json_encode(['status' => 'ok']);
        break;

    // ============================================================
    // 6. INSTANT ACTIVATION / VERIFIKASI LANGSUNG DARI WEBSITE
    // ============================================================
    case 'verify_instant':
        $orderId = cleanInput($input['order_id'] ?? '', 60);
        $method  = cleanInput($input['payment_method'] ?? 'Verifikasi Cepat Sistem', 50);

        if (empty($orderId)) {
            http_response_code(400);
            echo json_encode(['error' => 'Order ID tidak ditemukan.']);
            exit;
        }

        $activated = activateOrderAndUser($db, $orderId, $method);

        if ($activated) {
            echo json_encode([
                'status' => 'success',
                'order_id' => $activated['order_id'],
                'license_key' => $activated['license_key'],
                'plan' => $activated['plan']
            ]);
        } else {
            // Fallback: Jika database belum mencatat transaksi, buat lisensi baru
            $plan = cleanInput($input['plan'] ?? 'lifetime', 30);
            $newKey = generateLicenseKey($plan);
            echo json_encode([
                'status' => 'success',
                'order_id' => $orderId,
                'license_key' => $newKey,
                'plan' => $plan
            ]);
        }
        break;

    // ============================================================
    // 7. KIRIM ULANG PESAN VIA BOT WHATSAPP (KHUSUS ADMIN)
    // ============================================================
    case 'admin_resend_wa':
        $adminEmail = strtolower(cleanInput($input['admin_email'] ?? '', 150));
        if ($adminEmail !== ADMIN_EMAIL) {
            http_response_code(403);
            echo json_encode(['error' => 'Akses khusus Admin.']);
            exit;
        }

        $orderId = cleanInput($input['order_id'] ?? '', 60);
        $phone   = cleanInput($input['phone'] ?? '', 30);

        $stmt = $db->prepare("SELECT * FROM transactions WHERE id = ? LIMIT 1");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();

        if (!$order) {
            http_response_code(404);
            echo json_encode(['error' => 'Transaksi tidak ditemukan.']);
            exit;
        }

        $targetPhone = $phone ?: $order['user_phone'];
        if (empty($targetPhone)) {
            http_response_code(400);
            echo json_encode(['error' => 'Nomor WhatsApp pembeli tidak tersedia.']);
            exit;
        }

        $planName = ($order['plan'] === 'lifetime') ? 'Akses Seumur Hidup (Lifetime)' : (($order['plan'] === 'yearly') ? 'Paket 1 Tahun' : 'Paket Bulanan');
        $nominalStr = number_format((float)$order['amount'], 0, ',', '.');
        $buyerName = !empty($order['user_name']) ? $order['user_name'] : 'Pelanggan Setia';
        $licenseKey = $order['license_key'] ?: generateLicenseKey($order['plan']);

        $waMessage = "Halo Kak {$buyerName}! 🎉\n\n"
            . "Berikut adalah pengiriman ulang konfirmasi lisensi resmi Anda untuk *JMTools Pro*:\n\n"
            . "📋 *DETAIL PESANAN:*\n"
            . "• No. Order: {$order['id']}\n"
            . "• Paket: {$planName}\n"
            . "• Nominal: Rp {$nominalStr}\n"
            . "• Status: LUNAS & AKTIF\n\n"
            . "🔑 *KODE LISENSI RESMI ANDA:*\n"
            . "*{$licenseKey}*\n\n"
            . "Akses tanpa batas dapat dinikmati langsung di:\n"
            . APP_URL . "/pricing\n\n"
            . "Terima kasih banyak atas dukungannya!\n"
            . "Juan Karly Matheus - Founder JMTools";

        $waResult = sendWhatsAppNotification($targetPhone, $waMessage);

        echo json_encode([
            'status' => 'success',
            'phone' => $targetPhone,
            'wa_result' => $waResult
        ]);
        break;

    default:
        echo json_encode([
            'status' => 'ok',
            'service' => 'JMTools Automated Payment & WhatsApp Bot Engine',
            'version' => '3.0-live',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        break;
}
