// server/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {  // Changed from userId as per previous update
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  products: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      }
    }
  ],
  shippingAddress: {
    addressLine1: { type: String, required: true },  // Matches Address.jsx
    addressLine2: { type: String },  // Optional in Address.jsx
    city: { type: String, required: true },
    state: { type: String, required: true },  // Matches the "state" field in Address.jsx
    zip: { type: String, required: true },  // Matches the "zip" field in Address.jsx
    country: { type: String, required: true, default: 'Philippines' },
    telephone: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    default: 'cash on delivery'
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
