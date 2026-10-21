<?php
/**
 * API: Fetch Orders
 * GET — returns all orders as JSON
 */
require_once __DIR__ . '/../controllers/OrderController.php';
OrderController::fetchAll();
