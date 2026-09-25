const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { requireUserOwnership } = require('../middleware/ownership');
const {
  getAllPayments,
  getPaymentById,
  getUserPayments,
  processPayment,
  getPaymentHistory,
  createPaymentIntent,
  updatePaymentStatus
} = require('../controllers/paymentController');

// Get all payments: Admins and Managers only
router.get('/', protect, authorize('admin', 'manager', 'funeral_manager'), getAllPayments);

// Get specific payment by ID
router.get('/:id', protect, getPaymentById);

// Get all payments for a specific user: Owner or Admin/Manager only
router.get('/user/:userId', protect, requireUserOwnership, getUserPayments);

// Payment routes
router.post('/process', protect, processPayment);
router.get('/history', protect, getPaymentHistory);
router.post('/create-intent', protect, createPaymentIntent);
router.post('/:orderId/complete', protect, updatePaymentStatus);

module.exports = router; 