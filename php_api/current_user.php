<?php
/**
 * API: Get Current Logged-in User
 * GET — returns user session state
 */
require_once __DIR__ . '/../controllers/AuthController.php';
AuthController::currentUser();
