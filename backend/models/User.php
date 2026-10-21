<?php
/**
 * User Model
 * 
 * Handles database operations for user registration, authentication, and retrieval.
 */

require_once __DIR__ . '/../config/database.php';

class User {

    /**
     * Ensure users table exists and seed default admin if needed.
     */
    public static function initTable() {
        $conn = getConnection();

        $sql = "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            fullname VARCHAR(150) NOT NULL,
            role VARCHAR(20) DEFAULT 'customer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        $conn->query($sql);

        // Seed default admin if none exists
        $check = $conn->query("SELECT id FROM users WHERE username = 'admin'");
        if ($check && $check->num_rows === 0) {
            $adminPass = password_hash('admin123', PASSWORD_DEFAULT);
            $stmt = $conn->prepare("INSERT INTO users (username, email, password, fullname, role) VALUES (?, ?, ?, ?, ?)");
            $adminUser = 'admin';
            $adminEmail = 'admin@mrboyspecialtea.com';
            $adminName = 'System Administrator';
            $adminRole = 'admin';
            $stmt->bind_param('sssss', $adminUser, $adminEmail, $adminPass, $adminName, $adminRole);
            $stmt->execute();
            $stmt->close();
        }

        $conn->close();
    }

    /**
     * Register a new user.
     *
     * @param string $username
     * @param string $email
     * @param string $password
     * @param string $fullname
     * @param string $role
     * @return array
     */
    public static function register($username, $email, $password, $fullname, $role = 'customer') {
        self::initTable();
        $conn = getConnection();

        // Check if username or email exists
        $checkStmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $checkStmt->bind_param('ss', $username, $email);
        $checkStmt->execute();
        $checkRes = $checkStmt->get_result();

        if ($checkRes->num_rows > 0) {
            $checkStmt->close();
            $conn->close();
            return ['status' => 'error', 'message' => 'Username or Email already in use.'];
        }
        $checkStmt->close();

        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $conn->prepare("INSERT INTO users (username, email, password, fullname, role) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param('sssss', $username, $email, $hashedPassword, $fullname, $role);

        if ($stmt->execute()) {
            $userId = $stmt->insert_id;
            $stmt->close();
            $conn->close();

            return [
                'status' => 'success',
                'message' => 'Registration successful!',
                'user' => [
                    'id' => $userId,
                    'username' => $username,
                    'email' => $email,
                    'fullname' => $fullname,
                    'role' => $role
                ]
            ];
        } else {
            $err = $stmt->error;
            $stmt->close();
            $conn->close();
            return ['status' => 'error', 'message' => 'Registration failed: ' . $err];
        }
    }

    /**
     * Authenticate user with username/email and password.
     *
     * @param string $loginIdentifier (username or email)
     * @param string $password
     * @return array
     */
    public static function login($loginIdentifier, $password) {
        self::initTable();
        $conn = getConnection();

        $stmt = $conn->prepare("SELECT id, username, email, password, fullname, role FROM users WHERE username = ? OR email = ?");
        $stmt->bind_param('ss', $loginIdentifier, $loginIdentifier);
        $stmt->execute();
        $res = $stmt->get_result();

        if ($res && $row = $res->fetch_assoc()) {
            if (password_verify($password, $row['password'])) {
                $stmt->close();
                $conn->close();
                return [
                    'status' => 'success',
                    'message' => 'Login successful!',
                    'user' => [
                        'id' => $row['id'],
                        'username' => $row['username'],
                        'email' => $row['email'],
                        'fullname' => $row['fullname'],
                        'role' => $row['role']
                    ]
                ];
            }
        }

        $stmt->close();
        $conn->close();
        return ['status' => 'error', 'message' => 'Invalid username/email or password.'];
    }

    /**
     * Find user by ID.
     *
     * @param int $id
     * @return array|null
     */
    public static function findById($id) {
        $conn = getConnection();
        $stmt = $conn->prepare("SELECT id, username, email, fullname, role, created_at FROM users WHERE id = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $res = $stmt->get_result();
        $user = $res ? $res->fetch_assoc() : null;
        $stmt->close();
        $conn->close();
        return $user;
    }

    /**
     * Change user password after verifying current password.
     *
     * @param int $id
     * @param string $currentPassword
     * @param string $newPassword
     * @return array
     */
    public static function changePassword($id, $currentPassword, $newPassword) {
        self::initTable();
        $conn = getConnection();

        $stmt = $conn->prepare("SELECT id, password FROM users WHERE id = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $res = $stmt->get_result();

        if (!$res || !$row = $res->fetch_assoc()) {
            $stmt->close();
            $conn->close();
            return ['status' => 'error', 'message' => 'User account not found.'];
        }
        $stmt->close();

        if (!password_verify($currentPassword, $row['password'])) {
            $conn->close();
            return ['status' => 'error', 'message' => 'Current password is incorrect. Please try again.'];
        }

        if ($currentPassword === $newPassword) {
            $conn->close();
            return ['status' => 'error', 'message' => 'New password cannot be identical to current password.'];
        }

        $newHashed = password_hash($newPassword, PASSWORD_DEFAULT);
        $updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $updateStmt->bind_param('si', $newHashed, $id);

        if ($updateStmt->execute()) {
            $updateStmt->close();
            $conn->close();
            return ['status' => 'success', 'message' => 'Password updated successfully!'];
        } else {
            $err = $updateStmt->error;
            $updateStmt->close();
            $conn->close();
            return ['status' => 'error', 'message' => 'Failed to update password: ' . $err];
        }
    }
}
