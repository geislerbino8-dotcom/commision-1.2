<?php
/**
 * API: Update Order Status
 * POST — accepts JSON body with id and status (pending, received, completed, cancelled)
 */
require_once __DIR__ . '/../controllers/OrderController.php';
OrderController::updateStatus();
