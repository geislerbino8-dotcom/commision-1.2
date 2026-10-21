<?php
/**
 * ContactController
 * 
 * Processes contact form submissions
 * and delegates to the Contact model.
 */

require_once __DIR__ . '/../models/Contact.php';

class ContactController {

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
     * Handle contact form submission (POST form data).
     */
    public static function submit() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            header('Location: ../index.php');
            exit();
        }

        $name    = $_POST['name']    ?? '';
        $email   = $_POST['email']   ?? '';
        $contact = $_POST['contact'] ?? '';
        $message = $_POST['message'] ?? '';

        if (empty($name) || empty($email) || empty($message)) {
            echo "<script>
                    alert('Please fill in all required fields.');
                    window.history.back();
                  </script>";
            return;
        }

        $result = Contact::create($name, $email, $contact, $message);

        if ($result['status'] === 'success') {
            echo "<script>
                    alert('Thank you! Your message has been sent.');
                    window.location.href='../index.php';
                  </script>";
        } else {
            echo "<script>
                    alert('Error: " . addslashes($result['message']) . "');
                    window.history.back();
                  </script>";
        }
    }

    /**
     * Fetch all contacts as JSON.
     */
    public static function fetchContacts() {
        self::requireAdmin();
        header('Content-Type: application/json');
        $messages = Contact::fetchAll();
        echo json_encode($messages);
    }

    /**
     * Delete contact message (POST JSON).
     */
    public static function deleteContact() {
        self::requireAdmin();
        header('Content-Type: application/json');
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        $id = $data['id'] ?? 0;

        if (!$id) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid message ID.']);
            return;
        }

        $result = Contact::delete((int)$id);
        echo json_encode($result);
    }

    /**
     * Mark message as read/unread (POST JSON).
     */
    public static function markRead() {
        self::requireAdmin();
        header('Content-Type: application/json');
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!empty($data['mark_all'])) {
            $result = Contact::markAllRead();
            echo json_encode($result);
            return;
        }

        $id = $data['id'] ?? 0;
        $isRead = isset($data['is_read']) ? (bool)$data['is_read'] : true;

        if (!$id) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid message ID.']);
            return;
        }

        $result = Contact::markRead((int)$id, $isRead);
        echo json_encode($result);
    }
}
