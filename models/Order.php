<?php
/**
 * Order Model
 * 
 * Handles all database operations related to orders.
 */

require_once __DIR__ . '/../config/database.php';

class Order {
    
    /**
     * Create a new order bound to user credentials.
     *
     * @param string      $customerName
     * @param string      $orderDetails
     * @param float       $totalPrice
     * @param int|null    $userId
     * @param string|null $customerUsername
     * @param string|null $customerEmail
     * @param string      $status
     * @return array Response with status and message.
     */
    public static function create($customerName, $orderDetails, $totalPrice, $userId = null, $customerUsername = null, $customerEmail = null, $status = 'pending') {
        $conn = getConnection();

        // Check columns dynamically in MySQL
        $stmt = $conn->prepare(
            "INSERT INTO orders (user_id, customer_name, customer_username, customer_email, order_details, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        
        if ($stmt) {
            $stmt->bind_param('issssds', $userId, $customerName, $customerUsername, $customerEmail, $orderDetails, $totalPrice, $status);
            if ($stmt->execute()) {
                $result = ['status' => 'success', 'message' => 'Order saved and bound to account.'];
            } else {
                $result = ['status' => 'error', 'message' => 'SQL Error: ' . $stmt->error];
            }
            $stmt->close();
        } else {
            // Fallback for legacy tables without the new columns
            $fallbackStmt = $conn->prepare(
                "INSERT INTO orders (customer_name, order_details, total_price) VALUES (?, ?, ?)"
            );
            $fallbackStmt->bind_param('ssd', $customerName, $orderDetails, $totalPrice);
            if ($fallbackStmt->execute()) {
                $result = ['status' => 'success', 'message' => 'Order saved to database.'];
            } else {
                $result = ['status' => 'error', 'message' => 'SQL Error: ' . $fallbackStmt->error];
            }
            $fallbackStmt->close();
        }

        $conn->close();
        return $result;
    }

    /**
     * Fetch all orders, newest first.
     *
     * @return array List of order records.
     */
    public static function getAll() {
        $conn = getConnection();

        $sql    = "SELECT * FROM orders ORDER BY order_date DESC";
        $result = $conn->query($sql);
        $orders = [];

        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $orders[] = $row;
            }
        }

        $conn->close();
        return $orders;
    }

    /**
     * Fetch orders by user ID.
     *
     * @param int $userId
     * @return array List of order records for this user.
     */
    public static function getByUserId($userId) {
        $conn = getConnection();
        $stmt = $conn->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC");
        $orders = [];

        if ($stmt) {
            $stmt->bind_param('i', $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result && $result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $orders[] = $row;
                }
            }
            $stmt->close();
        }

        $conn->close();
        return $orders;
    }

    /**
     * Update an order's status (e.g. pending, received, completed, cancelled).
     *
     * @param int    $id
     * @param string $status
     * @return bool
     */
    public static function updateStatus($id, $status) {
        $conn = getConnection();
        $stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->bind_param('si', $status, $id);
        $success = $stmt->execute();
        $stmt->close();
        $conn->close();
        return $success;
    }

    /**
     * Delete an order by ID.
     *
     * @param int $id
     * @return bool
     */
    public static function delete($id) {
        $conn = getConnection();

        $stmt = $conn->prepare("DELETE FROM orders WHERE id = ?");
        $stmt->bind_param('i', $id);
        $success = $stmt->execute();

        $stmt->close();
        $conn->close();
        return $success;
    }

    /**
     * Delete all orders.
     *
     * @return bool
     */
    public static function deleteAll() {
        $conn    = getConnection();
        $success = $conn->query("DELETE FROM orders");
        $conn->close();
        return $success;
    }

    /**
     * Get sales summary (today, this month, this year).
     *
     * @return array Associative array with 'today', 'month', 'year' totals.
     */
    public static function getSalesSummary() {
        $conn = getConnection();

        $today = $conn->query(
            "SELECT SUM(total_price) as total FROM orders WHERE DATE(order_date) = CURDATE()"
        )->fetch_assoc()['total'] ?? 0;

        $month = $conn->query(
            "SELECT SUM(total_price) as total FROM orders 
             WHERE MONTH(order_date) = MONTH(CURDATE()) 
             AND YEAR(order_date) = YEAR(CURDATE())"
        )->fetch_assoc()['total'] ?? 0;

        $year = $conn->query(
            "SELECT SUM(total_price) as total FROM orders 
             WHERE YEAR(order_date) = YEAR(CURDATE())"
        )->fetch_assoc()['total'] ?? 0;

        $conn->close();
        return [
            'today' => $today,
            'month' => $month,
            'year'  => $year,
        ];
    }
}
