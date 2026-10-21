<?php
/**
 * Database Configuration
 * 
 * Toggle between local (XAMPP) and production (InfinityFree)
 * by setting the ENVIRONMENT constant.
 */

define('ENVIRONMENT', 'local'); // Change to 'production' for InfinityFree

if (ENVIRONMENT === 'production') {
    define('DB_HOST', 'sql205.infinityfree.com');
    define('DB_USER', 'if0_41204291');
    define('DB_PASS', 'CPPROG123');
    define('DB_NAME', 'if0_41204291_mr_boy_db');
} else {
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_NAME', 'mr_boy_db');
}

/**
 * Get a MySQLi database connection.
 *
 * @return mysqli
 */
function getConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode([
            'status'  => 'error',
            'message' => 'Database connection failed: ' . $conn->connect_error
        ]);
        exit();
    }

    $conn->set_charset('utf8mb4');
    return $conn;
}
