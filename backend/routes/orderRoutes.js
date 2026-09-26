const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const orderController = require('../controllers/orderController');
const { orderCreationRateLimiter, emailReceiptRateLimiter } = require('../middleware/rateLimiter');

// User-specific order endpoints (already have ownership checks in controllers)
router.get('/history', protect, orderController.getUserOrderHistory);
router.get('/pending-payments', protect, orderController.getPendingPayments);
router.get('/shipping-status', protect, orderController.getShippingStatus);
router.get('/user-shipping/:userId', protect, orderController.getUserShippingStatus);

// Create order - any authenticated user
router.post('/', protect, orderCreationRateLimiter, orderController.createOrder);
router.post('/email-receipt', protect, emailReceiptRateLimiter, orderController.sendEmailReceipt);

// Admin-only order management endpoints
router.get('/', protect, authorize('admin', 'manager'), orderController.getAllOrders);

// Order by ID with ownership check in controller (admin/manager or owner)
router.get('/:id', protect, orderController.getOrderById);
router.put('/:id', protect, orderController.updateOrder);
router.delete('/:id', protect, orderController.deleteOrder);

module.exports = router; 