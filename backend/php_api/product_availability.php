<?php
/**
 * API: Product Availability
 */
require_once __DIR__ . '/../config/database.php';

$conn = getConnection();
$sql = "CREATE TABLE IF NOT EXISTS product_availability (
    product_id VARCHAR(100) PRIMARY KEY,
    is_available TINYINT(1) DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";
$conn->query($sql);

$res = $conn->query("SELECT product_id, is_available FROM product_availability");
$availability = [];

if ($res) {
    while ($row = $res->fetch_assoc()) {
        $availability[$row['product_id']] = (bool)$row['is_available'];
    }
}

$conn->close();

header('Content-Type: application/json');
echo json_encode($availability);
