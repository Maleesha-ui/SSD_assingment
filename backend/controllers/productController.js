const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .select('name price description stock')
      .sort('name')
      .lean();
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
}; 