<?php
/**
 * API: Login User
 * POST — accepts JSON body with username (or email) and password
 */
require_once __DIR__ . '/../controllers/AuthController.php';
AuthController::login();
