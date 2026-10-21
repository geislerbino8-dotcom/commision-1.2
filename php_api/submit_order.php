<?php
/**
 * API: Submit Order
 * POST — accepts JSON body with customer_name, order_details, total_price
 */
require_once __DIR__ . '/../controllers/OrderController.php';
OrderController::submit();
