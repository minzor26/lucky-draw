<?php
/**
 * API: Record Winner & Prize Allocation
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

$ticketId = trim($data['ticketId'] ?? '');
$prizeName = trim($data['prizeName'] ?? 'Assured Reward');
$prizeTier = trim($data['prizeTier'] ?? 'reward');
$claimCode = trim($data['claimCode'] ?? ('WIN-' . rand(1000, 9999)));

if (empty($ticketId)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Ticket ID is required.']);
    exit;
}

try {
    $pdo = getDbConnection();

    $stmt = $pdo->prepare("
        UPDATE campaign_leads
        SET prize_won = ?, prize_tier = ?, claim_code = ?, status = 'Prize Won'
        WHERE ticket_id = ?
    ");
    $stmt->execute([$prizeName, $prizeTier, $claimCode, $ticketId]);

    // Also insert into winners table
    try {
        $leadStmt = $pdo->prepare("SELECT * FROM campaign_leads WHERE ticket_id = ?");
        $leadStmt->execute([$ticketId]);
        $lead = $leadStmt->fetch();
        if ($lead) {
            $wStmt = $pdo->prepare("
                INSERT INTO winners (coupon_number, customer_name, mobile, prize_name, prize_type, won_at)
                VALUES (?, ?, ?, ?, ?, datetime('now'))
            ");
            $wStmt->execute([$lead['id'], $lead['full_name'], $lead['mobile'], $prizeName, $prizeTier]);
        }
    } catch (Exception $we) {}

    echo json_encode(['success' => true, 'message' => 'Win recorded successfully!']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
