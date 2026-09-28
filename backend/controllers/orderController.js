const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { sendOrderReceipt } = require('../utils/emailUtils');
const { sendPaymentReceipt } = require('../utils/emailService');

const MAX_ORDER_QUANTITY = 100;
const MAX_ORDER_ITEMS = 50;

const orderController = {
  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.find()
        .populate('user', 'name email')
        .populate('items.product');
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('items.product');
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check if user is admin/manager or order owner
      if (req.user.role !== 'admin' && req.user.role !== 'manager' && order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createOrder: async (req, res) => {
    try {
      const { items, paymentMethod, shippingAddress } = req.body;
      if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ORDER_ITEMS) {
        return res.status(400).json({ message: `Order must contain between 1 and ${MAX_ORDER_ITEMS} items` });
      }

      const orderNumber = `ORD${Date.now()}`;
      let totalAmount = 0;
      const orderItems = [];
      const quantitiesByProduct = new Map();

      for (const item of items) {
        if (!item || !mongoose.isValidObjectId(item.product)) {
          return res.status(400).json({ message: 'Each item must include a valid product ID' });
        }

        if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_ORDER_QUANTITY) {
          return res.status(400).json({
            message: `Quantity must be an integer between 1 and ${MAX_ORDER_QUANTITY}`
          });
        }

        const product = await Product.findById(item.product);
        if (!product || !product.isActive) {
          return res.status(404).json({ message: 'Product not found or unavailable' });
        }

        if (!Number.isSafeInteger(product.stock) || product.stock < 0 || item.quantity > product.stock) {
          return res.status(400).json({ message: `Only ${product.stock} units are available` });
        }

        const productId = product._id.toString();
        const combinedQuantity = (quantitiesByProduct.get(productId) || 0) + item.quantity;
        if (combinedQuantity > product.stock) {
          return res.status(400).json({ message: `Only ${product.stock} units are available` });
        }
        quantitiesByProduct.set(productId, combinedQuantity);

        const lineTotal = product.price * item.quantity;
        if (!Number.isFinite(product.price) || product.price < 0 || !Number.isFinite(lineTotal)) {
          return res.status(400).json({ message: 'Invalid product price' });
        }

        orderItems.push({
          product: product._id,
          productName: product.name,
          quantity: item.quantity,
          price: product.price,
        });
        totalAmount += lineTotal;
      }

      if (!Number.isFinite(totalAmount)) {
        return res.status(400).json({ message: 'Invalid order total' });
      }

      const order = await Order.create({
        orderNumber,
        user: req.user?._id,
        items: orderItems,
        totalAmount,
        paymentMethod,
        shippingAddress
      });

      const populatedOrder = await Order.findById(order._id)
        .populate('user', 'name email')
        .populate('items.product', 'name price');

      res.status(201).json(populatedOrder);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: error.message });
    }
  },

  updateOrder: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check if user is admin/manager or order owner
      if (req.user.role !== 'admin' && req.user.role !== 'manager' && order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this order' });
      }

      if (order.paymentStatus !== 'pending' || order.orderStatus !== 'pending') {
        return res.status(409).json({ message: 'Only pending orders can be updated' });
      }

      const { shippingAddress } = req.body || {};
      if (!shippingAddress || typeof shippingAddress !== 'object' || Array.isArray(shippingAddress)) {
        return res.status(400).json({ message: 'A valid shipping address is required' });
      }

      order.shippingAddress = shippingAddress;
      await order.save();
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check if user is admin/manager or order owner
      if (req.user.role !== 'admin' && req.user.role !== 'manager' && order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this order' });
      }

      await Order.findByIdAndDelete(req.params.id);
      res.json({ message: 'Order deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  sendEmailReceipt: async (req, res) => {
    try {
      const { orderId } = req.body;

      const order = await Order.findById(orderId)
        .populate('user', 'email')
        .populate('items.product');

      if (!order) {
        console.log('Order not found:', orderId);
        return res.status(404).json({ message: 'Order not found' });
      }

      const isPrivileged = ['admin', 'manager'].includes(req.user.role);
      if (!isPrivileged && order.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this order receipt' });
      }

      await sendOrderReceipt({
        email: order.user.email,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        orderDate: order.createdAt
      });

      res.status(200).json({
        success: true,
        message: 'Receipt sent successfully'
      });
    } catch (error) {
      console.error('Send email receipt error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send receipt',
        error: error.message
      });
    }
  },

  getUserOrders: async (req, res) => {
    try {
      const orders = await Order.find({ user: req.user._id })
        .populate('user', 'name email')
        .populate('items.product', 'name price')
        .sort('-createdAt');

      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: error.message });
    }
  },

  cancelOrder: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (!order.canBeCancelled()) {
        return res.status(400).json({ 
          message: 'Order cannot be cancelled in its current state' 
        });
      }

      const cancelled = order.cancel(req.body.reason);
      if (cancelled) {
        await order.save();
        res.json(order);
      } else {
        res.status(400).json({ message: 'Could not cancel order' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { orderStatus: status },
        { new: true }
      ).populate('user', 'name email');

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: error.message });
    }
  },

  getOrders: async (req, res) => {
    try {
      const orders = await Order.find({ user: req.user._id })
        .populate('user', 'name email')
        .populate('items.product', 'name price')
        .sort('-createdAt');

      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: error.message });
    }
  },

  getPendingPayments: async (req, res) => {
    try {
      const pendingOrders = await Order.find({
        user: req.user._id,
        paymentStatus: 'pending'
      })
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

      res.status(200).json(pendingOrders || []);
      
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      res.status(500).json({ 
        message: 'Error fetching pending payments',
        error: error.message 
      });
    }
  },

  getShippingStatus: async (req, res) => {
    try {
      const userId = req.user._id;
      
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          message: 'User not authenticated'
        });
      }

      const orders = await Order.find({
        user: userId,
        orderStatus: { $in: ['pending', 'processing', 'shipped', 'delivered'] }
      })
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

      res.status(200).json(orders || []);
      
    } catch (error) {
      console.error('Error fetching shipping status:', error);
      res.status(500).json({ 
        message: 'Error fetching shipping status',
        error: error.message 
      });
    }
  },

  getUserOrderHistory: async (req, res) => {
    try {
      const userId = req.user?._id;
      console.log('Getting orders for user:', userId);

      if (!userId) {
        console.log('No user ID in request. User object:', req.user);
        return res.status(401).json({ 
          success: false,
          message: 'User not authenticated'
        });
      }

      console.log('Attempting to find orders');
      
      const orders = await Order.find({ user: userId })
        .populate({
          path: 'items.product',
          select: 'name price'
        })
        .sort('-createdAt')
        .lean();

      console.log(`Found ${orders?.length || 0} orders for user ${userId}`);

      if (!orders) {
        return res.json([]);
      }

      const orderHistory = orders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        totalAmount: order.totalAmount,
        status: order.orderStatus,
        paymentStatus: order.paymentStatus,
        items: order.items.map(item => ({
          productName: item.product ? item.product.name : item.productName,
          quantity: item.quantity,
          price: item.price
        }))
      }));

      res.json(orderHistory);
    } catch (error) {
      console.error('Order history error details:', {
        error: error.message,
        stack: error.stack,
        userId: req.user?._id
      });
      res.status(500).json({ 
        success: false,
        message: 'Error fetching order history',
        error: error.message 
      });
    }
  },

  getUserShippingStatus: async (req, res) => {
    try {
      if (req.user._id.toString() !== req.params.userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view these orders'
        });
      }

      const orders = await Order.find({
        user: req.user._id,
        orderStatus: { $in: ['pending', 'processing', 'shipped', 'delivered'] }
      })
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });

      res.status(200).json(orders || []);
      
    } catch (error) {
      console.error('Error fetching shipping status:', error);
      res.status(500).json({ 
        message: 'Error fetching shipping status',
        error: error.message 
      });
    }
  }
};

module.exports = orderController; 