const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { createProduct, getAllProducts } = require('../controllers/productController');

// Add logging middleware
router.use((req, res, next) => {
  console.log(`Product Route accessed: ${req.method} ${req.url}`);
  next();
});

// Public endpoint - anyone can view products
router.get('/', getAllProducts);

// Admin only - create products
router.post('/', protect, admin, createProduct);

module.exports = router; 