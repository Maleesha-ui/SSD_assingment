const express = require('express');
const router = express.Router();

const supplierController = require('../controllers/SupplierControllers');
const { protect, authorize } = require('../middleware/auth');

// All supplier management operations require valid JWT and Admin/Manager role
router.use(protect);
router.use(authorize('admin', 'manager', 'funeral_manager'));


router.get('/', supplierController.getAllSupplier);
router.get('/:id', supplierController.getSupplierById);
router.post('/', supplierController.createSupplier);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);


module.exports = router;