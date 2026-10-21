<?php
/**
 * API: Delete Order
 * POST — accepts JSON body with order id
 */
require_once __DIR__ . '/../controllers/OrderController.php';
OrderController::delete();
