const Order = require('../models/Order');

/**
 * Ownership Verification Middleware
 * Invariant 2 & Invariant 3: Customer can only access their own records.
 * Admin and Managers have cross-account operational access.
 */

// Verify User Profile Ownership: /api/users/:userId
const requireUserOwnership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const privilegedRoles = ['admin', 'manager', 'funeral_manager'];
  if (privilegedRoles.includes(req.user.role)) {
    return next();
  }

  const targetUserId = req.params.userId || req.params.id;
  if (!targetUserId || targetUserId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ 
      message: 'Forbidden: You do not have permission to access another user\'s profile.' 
    });
  }

  next();
};

// Verify Order Ownership: /api/orders/:id
const requireOrderOwnership = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const privilegedRoles = ['admin', 'manager', 'funeral_manager'];
    if (privilegedRoles.includes(req.user.role)) {
      return next();
    }

    const orderId = req.params.id || req.params.orderId;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order belongs to the requesting customer
    const orderOwnerId = order.user ? order.user.toString() : (order.userId ? order.userId.toString() : null);
    if (orderOwnerId !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Forbidden: You do not have permission to view or modify this order.' 
      });
    }

    req.order = order;
    next();
  } catch (err) {
    console.error('Order ownership check error:', err);
    res.status(500).json({ message: 'Error checking order ownership' });
  }
};

module.exports = {
  requireUserOwnership,
  requireOrderOwnership,
};
