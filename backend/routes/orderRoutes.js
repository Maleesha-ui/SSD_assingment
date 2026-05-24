const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

router.get('/history', protect, orderController.getUserOrderHistory);
router.get('/pending-payments', protect, orderController.getPendingPayments);

router.get('/shipping-status', protect, orderController.getShippingStatus);

router.get('/', protect, orderController.getAllOrders);
router.post('/', protect, orderController.createOrder);
router.post('/email-receipt', protect, orderController.sendEmailReceipt);

router.get('/:id', protect, orderController.getOrderById);
router.put('/:id', protect, orderController.updateOrder);
router.delete('/:id', protect, orderController.deleteOrder);

router.get('/user-shipping/:userId', protect, orderController.getUserShippingStatus);

module.exports = router; 