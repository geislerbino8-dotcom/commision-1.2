<?php
/**
 * API: Sales Analytics
 * Admin only — mirrors the Flask backend's access control.
 */
require_once __DIR__ . '/../config/database.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

$sessionUser = $_SESSION['user'] ?? null;
if (empty($sessionUser)) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'You must be logged in to do that.']);
    exit();
}
if (($sessionUser['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Administrator access required.']);
    exit();
}

$conn = getConnection();

$totalRes = $conn->query("SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as total FROM orders WHERE status != 'cancelled'");
$totalRow = $totalRes ? $totalRes->fetch_assoc() : ['count' => 0, 'total' => 0];

$allCountRes = $conn->query("SELECT COUNT(*) as count FROM orders");
$allCount = $allCountRes ? (int)$allCountRes->fetch_assoc()['count'] : 0;

$todayRes = $conn->query("SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as total FROM orders WHERE DATE(order_date) = CURDATE() AND status != 'cancelled'");
$todayRow = $todayRes ? $todayRes->fetch_assoc() : ['count' => 0, 'total' => 0];

$monthRes = $conn->query("SELECT COUNT(*) as count, COALESCE(SUM(total_price), 0) as total FROM orders WHERE MONTH(order_date) = MONTH(CURRENT_DATE()) AND YEAR(order_date) = YEAR(CURRENT_DATE()) AND status != 'cancelled'");
$monthRow = $monthRes ? $monthRes->fetch_assoc() : ['count' => 0, 'total' => 0];

$statusRes = $conn->query("SELECT status, COUNT(*) as count, COALESCE(SUM(total_price), 0) as revenue FROM orders GROUP BY status");
$statusCounts = ['pending' => 0, 'received' => 0, 'completed' => 0, 'cancelled' => 0];
$statusRevenue = ['pending' => 0.0, 'received' => 0.0, 'completed' => 0.0, 'cancelled' => 0.0];

if ($statusRes) {
    while ($sr = $statusRes->fetch_assoc()) {
        $s = $sr['status'] ?? 'pending';
        $statusCounts[$s] = (int)$sr['count'];
        $statusRevenue[$s] = (float)$sr['revenue'];
    }
}

$conn->close();

$totalGross = (float)$totalRow['total'];
$validCount = (int)$totalRow['count'];
$aov = $validCount > 0 ? round($totalGross / $validCount, 2) : 0.0;

echo json_encode([
    'status' => 'success',
    'total_revenue' => $totalGross,
    'total_orders' => $allCount,
    'valid_orders_count' => $validCount,
    'average_order_value' => $aov,
    'today' => [
        'revenue' => (float)$todayRow['total'],
        'orders' => (int)$todayRow['count']
    ],
    'this_month' => [
        'revenue' => (float)$monthRow['total'],
        'orders' => (int)$monthRow['count']
    ],
    'status_breakdown' => [
        'counts' => $statusCounts,
        'revenue' => $statusRevenue
    ]
]);
