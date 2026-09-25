const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const inventoryController = require('../controllers/InventoryControllers');

// All inventory routes require authentication
router.use(protect);

// Read operations - accessible by admin, manager, and staff
router.get('/', authorize('admin', 'manager', 'staff'), inventoryController.getAllInventory);
router.get('/:id', authorize('admin', 'manager', 'staff'), inventoryController.getInventoryById);
router.get('/status/:status', authorize('admin', 'manager', 'staff'), inventoryController.getInventoryByStatus);
router.get('/date/:startDate/:endDate', authorize('admin', 'manager', 'staff'), inventoryController.getInventoryByDateRange);
router.get('/product/:productName', authorize('admin', 'manager', 'staff'), inventoryController.getInventoryByProductName);

// Write operations - admin and manager only
router.post('/', authorize('admin', 'manager'), inventoryController.createInventory);
router.put('/:id', authorize('admin', 'manager'), inventoryController.updateInventory);
router.delete('/:id', authorize('admin', 'manager'), inventoryController.deleteInventory);

module.exports = router;