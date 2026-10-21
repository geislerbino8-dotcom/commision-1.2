<?php
/**
 * API: Clear All Orders
 * POST — deletes all orders from the database
 */
require_once __DIR__ . '/../controllers/OrderController.php';
OrderController::deleteAll();
