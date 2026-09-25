const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const InventoryOrderController = require('../controllers/InventoryOrderControllers');
const { model } = require('mongoose');

// All inventory order routes require authentication
router.use(protect);

// Read operations - accessible by admin, manager, and staff
router.get('/', authorize('admin', 'manager', 'staff'), InventoryOrderController.getAllInventoryOrders);
router.get('/:id', authorize('admin', 'manager', 'staff'), InventoryOrderController.getInventoryOrderById);

// Write operations - admin and manager only
router.post('/', authorize('admin', 'manager'), InventoryOrderController.createInventoryOrder);
router.put('/:id', authorize('admin', 'manager'), InventoryOrderController.updateInventoryOrder);
router.delete('/:id', authorize('admin', 'manager'), InventoryOrderController.deleteInventoryOrder);

module.exports = router; // Export the router for use in the main app file