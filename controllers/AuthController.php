<?php
/**
 * AuthController
 * 
 * Manages user registration, login authentication, logout, and session state.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../models/User.php';

class AuthController {

    /**
     * Handle registration (POST JSON).
     */
    public static function register() {
        header('Content-Type: application/json');

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!$data) {
            echo json_encode(['status' => 'error', 'message' => 'No data received.']);
            return;
        }

        $username = trim($data['username'] ?? '');
        $fullname = trim($data['fullname'] ?? '');
        $email    = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (empty($username) || empty($fullname) || empty($email) || empty($password)) {
            echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
            return;
        }

        if (strlen($password) < 6) {
            echo json_encode(['status' => 'error', 'message' => 'Password must be at least 6 characters long.']);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['status' => 'error', 'message' => 'Please provide a valid email address.']);
            return;
        }

        $result = User::register($username, $email, $password, $fullname);

        if ($result['status'] === 'success') {
            $_SESSION['user'] = $result['user'];
        }

        echo json_encode($result);
    }

    /**
     * Handle login (POST JSON).
     */
    public static function login() {
        header('Content-Type: application/json');

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!$data) {
            echo json_encode(['status' => 'error', 'message' => 'No data received.']);
            return;
        }

        $loginIdentifier = trim($data['username'] ?? '');
        $password        = $data['password'] ?? '';

        if (empty($loginIdentifier) || empty($password)) {
            echo json_encode(['status' => 'error', 'message' => 'Username/Email and Password are required.']);
            return;
        }

        $result = User::login($loginIdentifier, $password);

        if ($result['status'] === 'success') {
            $_SESSION['user'] = $result['user'];
        }

        echo json_encode($result);
    }

    /**
     * Handle logout (POST).
     */
    public static function logout() {
        header('Content-Type: application/json');

        unset($_SESSION['user']);
        session_destroy();

        echo json_encode(['status' => 'success', 'message' => 'Logged out successfully.']);
    }

    /**
     * Get current user session info (GET).
     */
    public static function currentUser() {
        header('Content-Type: application/json');

        if (isset($_SESSION['user'])) {
            echo json_encode([
                'logged_in' => true,
                'user' => $_SESSION['user']
            ]);
        } else {
            echo json_encode([
                'logged_in' => false,
                'user' => null
            ]);
        }
    }

    /**
     * Handle change password (POST JSON).
     */
    public static function changePassword() {
        header('Content-Type: application/json');

        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!$data) {
            echo json_encode(['status' => 'error', 'message' => 'No data received.']);
            return;
        }

        $userId = $_SESSION['user']['id'] ?? null;
        $currentPassword = $data['current_password'] ?? '';
        $newPassword = $data['new_password'] ?? '';

        // Identity must come only from the authenticated session — never a
        // client-supplied user_id (that would let one user change another's password).
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'You must be logged in to change your password.']);
            return;
        }

        if (empty($currentPassword) || empty($newPassword)) {
            echo json_encode(['status' => 'error', 'message' => 'Both current and new password are required.']);
            return;
        }

        if (strlen($newPassword) < 6) {
            echo json_encode(['status' => 'error', 'message' => 'New password must be at least 6 characters long.']);
            return;
        }

        $result = User::changePassword((int)$userId, $currentPassword, $newPassword);
        echo json_encode($result);
    }
}
