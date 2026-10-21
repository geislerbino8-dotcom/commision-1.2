<?php
/**
 * API: Save Contact Message
 * POST — accepts form data (name, email, contact, message)
 */
require_once __DIR__ . '/../controllers/ContactController.php';
ContactController::submit();
