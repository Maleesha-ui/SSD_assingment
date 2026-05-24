const express = require('express');
const router = express.Router();

const InventoryOrderController = require('../controllers/InventoryOrderControllers');
const { model } = require('mongoose');

router.get('/', InventoryOrderController.getAllInventoryOrders); // Get all inventory orders
router.get('/:id', InventoryOrderController.getInventoryOrderById); // Get inventory order by ID
router.post('/', InventoryOrderController.createInventoryOrder); // Create a new inventory order
router.put('/:id', InventoryOrderController.updateInventoryOrder); // Update an inventory order
router.delete('/:id', InventoryOrderController.deleteInventoryOrder); // Delete an inventory order


module.exports = router; // Export the router for use in the main app file