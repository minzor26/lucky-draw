<?php
/**
 * API: Record New Lead / Participant
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true) ?: $_POST;

$fullName = trim($data['fullName'] ?? '');
$mobile = preg_replace('/[^0-9]/', '', $data['mobile'] ?? '');
$coupon = trim($data['coupon'] ?? '');
$ticketId = $data['ticketId'] ?? ('AURA-' . rand(100000, 999999));

if (empty($fullName) || strlen($mobile) < 10) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Full name and 10-digit mobile number are required.']);
    exit;
}

try {
    $pdo = getDbConnection();

    // Ensure campaign_leads table exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS campaign_leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            mobile TEXT NOT NULL,
            coupon_code TEXT,
            ticket_id TEXT UNIQUE,
            prize_won TEXT,
            prize_tier TEXT,
            claim_code TEXT,
            status TEXT DEFAULT 'Registered',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ");

    $stmt = $pdo->prepare("
        INSERT INTO campaign_leads (full_name, mobile, coupon_code, ticket_id, status)
        VALUES (?, ?, ?, ?, 'Registered')
    ");
    $stmt->execute([$fullName, $mobile, $coupon, $ticketId]);

    // Also populate coupons table
    try {
        $maxStmt = $pdo->query("SELECT COALESCE(MAX(coupon_number), 357) as max_c FROM coupons");
        $maxRow = $maxStmt->fetch();
        $nextCoupon = ($maxRow['max_c'] ?? 357) + 1;

        $cStmt = $pdo->prepare("
            INSERT INTO coupons (coupon_number, customer_name, mobile, status)
            VALUES (?, ?, ?, 'eligible')
        ");
        $cStmt->execute([$nextCoupon, $fullName, $mobile]);
    } catch (Exception $ce) {}

    echo json_encode(['success' => true, 'ticketId' => $ticketId]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
