// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
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

// Update product
router.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, subcategory, countInStock, imageUrl } = req.body;
    
    // Prepare update object
    const updateData = {
      name,
      description,
      price,
      category,
      subcategory,
      countInStock
    };
    
    // Handle image update
    if (req.file) {
      // If a new image was uploaded
      updateData.image = `/uploads/${req.file.filename}`;
    } else if (imageUrl) {
      // If using existing image
      updateData.image = imageUrl;
    }
    
    // Find and update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Product update error:', error);
    res.status(400).json({ message: error.message });
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
