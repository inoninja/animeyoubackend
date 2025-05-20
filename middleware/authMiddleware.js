// In middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
// Comment out or remove this line since we're handling admin-token specially
// const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Special case for development - accept admin-token
      if (token === 'admin-token') {
        // Create a mock admin user
        req.user = {
          _id: 'admin-id',
          name: 'Admin User',
          email: 'admin@example.com',
          isAdmin: true
        };
        return next();
      }

      // For normal tokens, verify with JWT
      // We'll skip the database lookup for now since we don't have userModel
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        _id: decoded.id,
        isAdmin: decoded.isAdmin || false
      };
      
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as admin');
  }
};

module.exports = { protect, admin };
