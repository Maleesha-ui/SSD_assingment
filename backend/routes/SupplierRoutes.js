const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const supplierController = require('../controllers/SupplierControllers');

// All supplier routes require authentication
router.use(protect);

// Read operations - accessible by admin, manager, and staff
router.get('/', authorize('admin', 'manager', 'staff'), supplierController.getAllSupplier);
router.get('/:id', authorize('admin', 'manager', 'staff'), supplierController.getSupplierById);

// Write operations - admin and manager only
router.post('/', authorize('admin', 'manager'), supplierController.createSupplier);
router.put('/:id', authorize('admin', 'manager'), supplierController.updateSupplier);
router.delete('/:id', authorize('admin', 'manager'), supplierController.deleteSupplier);

module.exports = router;