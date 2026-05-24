const express = require('express');
const router = express.Router();


const inventoryController = require('../controllers/InventoryControllers');

router.get('/', inventoryController.getAllInventory); 
router.get('/:id', inventoryController.getInventoryById); 
router.post('/', inventoryController.createInventory); 
router.put('/:id', inventoryController.updateInventory);
router.delete('/:id', inventoryController.deleteInventory); 
router.get('/status/:status', inventoryController.getInventoryByStatus); 
router.get('/date/:startDate/:endDate', inventoryController.getInventoryByDateRange); 
router.get('/product/:productName', inventoryController.getInventoryByProductName);

module.exports = router;