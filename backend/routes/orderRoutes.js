const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { requireOrderOwnership, requireUserOwnership } = require('../middleware/ownership');
const orderController = require('../controllers/orderController');

router.get('/history', protect, orderController.getUserOrderHistory);
router.get('/pending-payments', protect, orderController.getPendingPayments);
router.get('/shipping-status', protect, orderController.getShippingStatus);

// List all orders: Admin and Manager only
router.get('/', protect, authorize('admin', 'manager', 'funeral_manager'), orderController.getAllOrders);

router.post('/', protect, orderController.createOrder);
router.post('/email-receipt', protect, orderController.sendEmailReceipt);

// Single order operations: Owner or Admin/Manager only
router.get('/:id', protect, requireOrderOwnership, orderController.getOrderById);
router.put('/:id', protect, requireOrderOwnership, orderController.updateOrder);
router.delete('/:id', protect, authorize('admin', 'manager'), orderController.deleteOrder);

router.get('/user-shipping/:userId', protect, requireUserOwnership, orderController.getUserShippingStatus);

module.exports = router; 