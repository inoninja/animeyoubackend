// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

// Create new order
router.post('/', protect, async (req, res) => {
  try {
    const {
      products, // From frontend checkout page
      shippingAddress,
      paymentMethod = 'cash on delivery', // Default value if not provided
      totalAmount // From frontend checkout page
    } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Map products from frontend to orderItems format expected by Order model
    const orderItems = products.map(product => ({
      name: product.name,
      qty: product.quantity, // Convert quantity to qty
      image: product.image,
      price: product.price,
      product: product.productId // Convert productId to product
    }));

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress: {
        street: shippingAddress.street || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        postalCode: shippingAddress.postalCode || '',
        country: shippingAddress.country || 'Philippines' // Default country
      },
      paymentMethod,
      totalPrice: totalAmount, // Convert totalAmount to totalPrice
      status: 'processing' // Initial status
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get logged in user's orders
router.get('/myorders', protect, async (req, res) => {
  try {
    // Check if the user is a guest user with a non-ObjectId ID
    if (req.user._id === 'guest-id' || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      // Return empty array for guest users or invalid IDs
      return res.json([]);
    }

    const orders = await Order.find({ user: req.user._id })
                            .sort({ createdAt: -1 }); // Newest first
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Make sure users can only see their own orders
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (for admin use)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Verify user is admin
    if (req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized as admin' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
