const stripe = require('../config/stripe');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const { sendPaymentReceipt } = require('../utils/emailService');

const getOrderAmountInCents = (order) => {
  const amount = Math.round(Number(order.totalAmount) * 100);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
};

const canAccessOrder = (order, user) => (
  ['admin', 'manager'].includes(user.role) || order.user.toString() === user._id.toString()
);

const paymentController = {
  // Create payment intent
  createPaymentIntent: async (req, res) => {
    try {
      const { orderId } = req.body || {};
      
      if (!orderId) {
        return res.status(400).json({ message: 'OrderId is required' });
      }

      // Validate orderId format
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID format' });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (!canAccessOrder(order, req.user)) {
        return res.status(403).json({ message: 'Not authorized to pay this order' });
      }

      if (order.paymentStatus !== 'pending' || order.orderStatus === 'cancelled') {
        return res.status(409).json({ message: 'Order is not available for payment' });
      }

      const amount = getOrderAmountInCents(order);
      if (amount === null) {
        return res.status(400).json({ message: 'Order has an invalid payment total' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: { 
          orderId,
          userId: req.user._id.toString() 
        }
      });

      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      console.error('Payment Intent Error:', error);
      res.status(500).json({ message: 'Error creating payment intent' });
    }
  },

  // Update payment status
  updatePaymentStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { paymentIntentId } = req.body;

      if (!orderId || !paymentIntentId) {
        return res.status(400).json({ 
          message: 'Order ID and payment intent ID are required' 
        });
      }

      // Validate orderId format
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid order ID format' });
      }

      console.log('Updating payment status:', { orderId, paymentIntentId });

      // Find and update order
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (!canAccessOrder(order, req.user)) {
        return res.status(403).json({ message: 'Not authorized to complete payment for this order' });
      }

      if (order.paymentStatus !== 'pending' || order.orderStatus === 'cancelled') {
        return res.status(409).json({ message: 'Order is not awaiting payment' });
      }

      // Verify payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      const expectedAmount = getOrderAmountInCents(order);
      if (
        paymentIntent.metadata.orderId !== orderId ||
        paymentIntent.metadata.userId !== req.user._id.toString() ||
        paymentIntent.status !== 'succeeded' ||
        paymentIntent.currency !== 'usd' ||
        expectedAmount === null ||
        paymentIntent.amount !== expectedAmount ||
        paymentIntent.amount_received !== expectedAmount
      ) {
        return res.status(400).json({ 
          message: 'Payment intent does not match the order or is not successfully paid'
        });
      }

      // Create payment record
      const payment = await Payment.create({
        orderId,
        paymentIntentId,
        amount: paymentIntent.amount / 100, // Convert from cents
        paymentMethod: 'STRIPE',
        status: 'completed'
      });

      // Update order status
      order.paymentStatus = 'paid';
      order.paymentIntentId = paymentIntentId;
      await order.save();

      res.json({ 
        message: 'Payment status updated successfully',
        payment 
      });
    } catch (error) {
      console.error('Payment Status Update Error:', error);
      res.status(500).json({ 
        message: 'Error updating payment status',
        error: error.message 
      });
    }
  },

  processPayment: async (req, res) => {
    return res.status(410).json({
      message: 'Direct payment processing is unavailable. Use the Stripe payment-intent flow.'
    });
  },

  getPaymentHistory: async (req, res) => {
    try {
      // Regular users can only see their own payment history
      if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        const payments = await Payment.find({ 'orderId.user': req.user._id })
          .populate('orderId')
          .sort('-createdAt');
        res.json(payments);
      } else {
        // Admin/manager can see all payment history
        const payments = await Payment.find().populate('orderId').sort('-createdAt');
        res.json(payments);
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getPaymentById: async (req, res) => {
    try {
      const payment = await Payment.findById(req.params.id)
        .populate({
          path: 'orderId',
          select: 'orderNumber totalAmount status user',
          populate: {
            path: 'user',
            select: 'name email'
          }
        })
        .lean();

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // Check if user is admin/manager or payment owner
      if (req.user.role !== 'admin' && req.user.role !== 'manager' && payment.orderId.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this payment' });
      }

      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get all payments with order and user details
  getAllPayments: async (req, res) => {
    try {
      const payments = await Payment.find()
        .populate({
          path: 'orderId',
          select: 'orderNumber totalAmount status',
          populate: {
            path: 'user',
            select: 'name email'
          }
        })
        .sort('-createdAt')
        .lean();

      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get payments by user ID
  getUserPayments: async (req, res) => {
    try {
      // Check if user is admin/manager or requesting their own payments
      if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.params.userId !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view these payments' });
      }

      const payments = await Payment.find({ 'orderId.user': req.params.userId })
        .populate({
          path: 'orderId',
          select: 'orderNumber totalAmount status',
          populate: {
            path: 'user',
            select: 'name email'
          }
        })
        .sort('-createdAt')
        .lean();

      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  completePayment: async (req, res) => {
    req.params.orderId = req.params.orderId || req.params.id;
    return paymentController.updatePaymentStatus(req, res);
  }
};

module.exports = paymentController; 