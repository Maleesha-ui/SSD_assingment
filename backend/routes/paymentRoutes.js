const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { paymentRateLimiter } = require('../middleware/rateLimiter');
const {
  getAllPayments,
  getPaymentById,
  getUserPayments,
  processPayment,
  getPaymentHistory,
  createPaymentIntent,
  updatePaymentStatus
} = require('../controllers/paymentController');

// Admin-only payment management
router.get('/', protect, authorize('admin', 'manager'), getAllPayments);

// Get specific payment by ID with ownership check in controller
router.get('/:id', protect, getPaymentById);

// Get all payments for a specific user with ownership check in controller
router.get('/user/:userId', protect, getUserPayments);

// Payment operations
router.post('/process', protect, paymentRateLimiter, processPayment);
router.get('/history', protect, getPaymentHistory);
router.post('/create-intent', protect, paymentRateLimiter, createPaymentIntent);
router.post('/:orderId/complete', protect, paymentRateLimiter, updatePaymentStatus);

module.exports = router; 