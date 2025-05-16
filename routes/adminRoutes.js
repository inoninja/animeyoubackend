// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new product
router.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, subcategory, countInStock } = req.body;
    
    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }
    
    // Create new product
    const product = new Product({
      name,
      description,
      price,
      category,
      subcategory,
      image: `/uploads/${req.file.filename}`,
      countInStock
    });
    
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product route
router.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      subcategory: req.body.subcategory,
      countInStock: req.body.countInStock
    };

    // Handle image updates
    if (req.file) {
      // If a new file was uploaded
      updateData.image = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      // If keeping the existing image
      updateData.image = req.body.imageUrl;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
