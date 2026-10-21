<?php
/**
 * API: Logout User
 * POST — clears current session
 */
require_once __DIR__ . '/../controllers/AuthController.php';
AuthController::logout();
