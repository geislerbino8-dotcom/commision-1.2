<?php
/**
 * API: Register User
 * POST — accepts JSON body with username, fullname, email, password
 */
require_once __DIR__ . '/../controllers/AuthController.php';
AuthController::register();
