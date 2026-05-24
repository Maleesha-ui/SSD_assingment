const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { createProduct, getAllProducts } = require('../controllers/productController');

// Add logging middleware
router.use((req, res, next) => {
  console.log(`Product Route accessed: ${req.method} ${req.url}`);
  next();
});

router.post('/', protect, admin, createProduct);
router.get('/', protect, getAllProducts);

module.exports = router; 