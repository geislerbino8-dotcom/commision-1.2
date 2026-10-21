<?php
/**
 * Contact Model
 * 
 * Handles all database operations related to contact messages.
 */

require_once __DIR__ . '/../config/database.php';

class Contact {

    /**
     * Save a contact form message.
     *
     * @param string $name
     * @param string $email
     * @param string $contact
     * @param string $message
     * @return array Response with status and message.
     */
    public static function create($name, $email, $contact, $message) {
        $conn = getConnection();

        $stmt = $conn->prepare(
            "INSERT INTO contact_messages (name, email, contact, message) VALUES (?, ?, ?, ?)"
        );
        $stmt->bind_param('ssss', $name, $email, $contact, $message);

        if ($stmt->execute()) {
            $result = ['status' => 'success', 'message' => 'Message sent successfully.'];
        } else {
            $result = ['status' => 'error', 'message' => 'Error: ' . $stmt->error];
        }

        $stmt->close();
        $conn->close();
        return $result;
    }

    /**
     * Fetch all contact messages.
     *
     * @return array
     */
    public static function fetchAll() {
        $conn = getConnection();
        $result = $conn->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
        $messages = [];

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $messages[] = $row;
            }
        }

        $conn->close();
        return $messages;
    }

    /**
     * Delete contact message by ID.
     *
     * @param int $id
     * @return array
     */
    public static function delete($id) {
        $conn = getConnection();
        $stmt = $conn->prepare("DELETE FROM contact_messages WHERE id = ?");
        $stmt->bind_param('i', $id);
        $res = $stmt->execute();
        $stmt->close();
        $conn->close();

        return $res 
            ? ['status' => 'success', 'message' => 'Message deleted.']
            : ['status' => 'error', 'message' => 'Failed to delete message.'];
    }

    /**
     * Mark a contact message as read/unread.
     *
     * @param int $id
     * @param bool $isRead
     * @return array
     */
    public static function markRead($id, $isRead = true) {
        $conn = getConnection();
        $intVal = $isRead ? 1 : 0;
        $stmt = $conn->prepare("UPDATE contact_messages SET is_read = ? WHERE id = ?");
        $stmt->bind_param('ii', $intVal, $id);
        $res = $stmt->execute();
        $stmt->close();
        $conn->close();

        return $res 
            ? ['status' => 'success', 'message' => 'Message status updated.', 'is_read' => $isRead]
            : ['status' => 'error', 'message' => 'Failed to update message status.'];
    }

    /**
     * Mark all contact messages as read.
     *
     * @return array
     */
    public static function markAllRead() {
        $conn = getConnection();
        $res = $conn->query("UPDATE contact_messages SET is_read = 1");
        $conn->close();

        return $res 
            ? ['status' => 'success', 'message' => 'All messages marked as read.']
            : ['status' => 'error', 'message' => 'Failed to update messages.'];
    }
}
