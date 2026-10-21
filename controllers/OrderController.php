<?php
/**
 * OrderController
 * 
 * Processes incoming order-related API requests
 * and delegates to the Order model.
 */

require_once __DIR__ . '/../models/Order.php';

class OrderController {

    /**
     * Ensure the current session user is an admin. Exits with a JSON error otherwise.
     */
    private static function requireAdmin() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $user = $_SESSION['user'] ?? null;
        if (empty($user)) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'You must be logged in to do that.']);
            exit();
        }
        if (($user['role'] ?? '') !== 'admin') {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Administrator access required.']);
            exit();
        }
    }

    /**
     * Handle order submission (POST JSON).
     */
    public static function submit() {
        header('Content-Type: application/json');

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!$data) {
            echo json_encode(['status' => 'error', 'message' => 'No data received.']);
            return;
        }

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $sessionUser = $_SESSION['user'] ?? null;

        // Identity must come ONLY from the authenticated session. Trusting a
        // client-supplied user_id / customer_name would let anyone place orders
        // under another account.
        if (empty($sessionUser)) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Please log in before submitting your order.', 'require_auth' => true]);
            return;
        }

        $userId            = $sessionUser['id'] ?? null;
        $customerName      = $sessionUser['fullname'] ?? '';
        $customerUsername  = $sessionUser['username'] ?? '';
        $customerEmail     = $sessionUser['email'] ?? '';
        $orderDetails      = trim($data['order_details'] ?? '');
        $totalPrice        = floatval($data['total_price'] ?? 0);

        if (empty($customerName) || empty($orderDetails) || $totalPrice <= 0) {
            echo json_encode(['status' => 'error', 'message' => 'Missing required fields or empty order.']);
            return;
        }

        $result = Order::create($customerName, $orderDetails, $totalPrice, $userId, $customerUsername, $customerEmail, 'pending');
        echo json_encode($result);
    }

    /**
     * Fetch all orders or filter by user (GET → JSON).
     */
    public static function fetchAll() {
        header('Content-Type: application/json');
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $sessionUser = $_SESSION['user'] ?? null;
        $isAdmin     = !empty($sessionUser) && (($sessionUser['role'] ?? '') === 'admin');

        $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;

        if ($userId && $userId > 0) {
            // A non-admin may only ever fetch their own orders (prevents IDOR).
            if (!$isAdmin && intval($sessionUser['id'] ?? 0) !== $userId) {
                http_response_code(403);
                echo json_encode(['status' => 'error', 'message' => 'You may only view your own orders.']);
                return;
            }
            echo json_encode(Order::getByUserId($userId));
        } else {
            // Fetching ALL orders is an admin function.
            if (!$isAdmin) {
                http_response_code(403);
                echo json_encode(['status' => 'error', 'message' => 'Administrator access required.']);
                return;
            }
            echo json_encode(Order::getAll());
        }
    }

    /**
     * Update order status (POST JSON).
     */
    public static function updateStatus() {
        self::requireAdmin();
        header('Content-Type: application/json');

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        $id     = intval($data['id'] ?? 0);
        $status = trim($data['status'] ?? 'completed');

        if ($id <= 0) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid order ID.']);
            return;
        }

        // Restrict to the known lifecycle states (mirrors the Flask backend).
        $allowed = ['pending', 'received', 'completed', 'cancelled'];
        if (!in_array($status, $allowed, true)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid status "' . addslashes($status) . '".']);
            return;
        }

        $success = Order::updateStatus($id, $status);
        echo json_encode([
            'status'  => $success ? 'success' : 'error',
            'message' => $success ? "Order #$id status updated to $status." : 'Failed to update order status.',
        ]);
    }

    /**
     * Delete a single order by ID (POST JSON).
     */
    public static function delete() {
        self::requireAdmin();
        header('Content-Type: application/json');

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        $id   = intval($data['id'] ?? 0);

        if ($id <= 0) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid order ID.']);
            return;
        }

        $success = Order::delete($id);
        echo json_encode([
            'status'  => $success ? 'success' : 'error',
            'message' => $success ? 'Order deleted.' : 'Failed to delete order.',
        ]);
    }

    /**
     * Delete all orders (POST).
     */
    public static function deleteAll() {
        self::requireAdmin();
        header('Content-Type: application/json');

        $success = Order::deleteAll();
        echo json_encode([
            'status'  => $success ? 'success' : 'error',
            'message' => $success ? 'All orders cleared.' : 'Failed to clear orders.',
        ]);
    }
}
