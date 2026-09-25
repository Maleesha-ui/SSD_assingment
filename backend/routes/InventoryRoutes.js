const express = require('express');
const router = express.Router();


const inventoryController = require('../controllers/InventoryControllers');
const { protect, authorize } = require('../middleware/auth');

// Read inventory: Admins, Managers, and Staff
router.get('/', protect, authorize('admin', 'manager', 'funeral_manager', 'funeral_staff', 'staff'), inventoryController.getAllInventory); 
router.get('/:id', protect, authorize('admin', 'manager', 'funeral_manager', 'funeral_staff', 'staff'), inventoryController.getInventoryById); 
router.get('/status/:status', protect, authorize('admin', 'manager', 'funeral_manager', 'funeral_staff', 'staff'), inventoryController.getInventoryByStatus); 
router.get('/date/:startDate/:endDate', protect, authorize('admin', 'manager', 'funeral_manager', 'funeral_staff', 'staff'), inventoryController.getInventoryByDateRange); 
router.get('/product/:productName', protect, authorize('admin', 'manager', 'funeral_manager', 'funeral_staff', 'staff'), inventoryController.getInventoryByProductName);

// Mutating inventory: Admins and Managers
router.post('/', protect, authorize('admin', 'manager', 'funeral_manager'), inventoryController.createInventory); 
router.put('/:id', protect, authorize('admin', 'manager', 'funeral_manager'), inventoryController.updateInventory);
router.delete('/:id', protect, authorize('admin', 'manager', 'funeral_manager'), inventoryController.deleteInventory);

module.exports = router;