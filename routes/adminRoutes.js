// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer'); // You need to install this: npm install multer
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/'); // Create this directory if it doesn't exist
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
    res.status(500).json({ message: 'Error fetching products', error: error.message });
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
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// Create new product
router.post('/products', upload.single('image'), async (req, res) => {
  try {
    console.log("Creating product:", req.body);
    
    const productData = {
      ...req.body,
      price: parseFloat(req.body.price),
      countInStock: parseInt(req.body.countInStock)
    };
    
    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }
    
    const product = new Product(productData);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
});

// Update product
router.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    console.log("Updating product ID:", req.params.id);
    console.log("Update data:", req.body);
    
    const productData = {
      ...req.body,
      price: parseFloat(req.body.price),
      countInStock: parseInt(req.body.countInStock)
    };
    
    // Handle image upload if a new file is provided
    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      // Use existing image if no new file
      productData.image = req.body.imageUrl;
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      productData, 
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log("Product updated successfully:", product);
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ message: 'Error updating product', error: error.message });
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
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;