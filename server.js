const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const User = require('./models/User');


// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: ['https://anime-you-one.vercel.app', 'http://localhost:3000']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Since we're using Cloudinary, we don't need local uploads
// but we can keep it for backward compatibility if needed
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);


// Update your admin routes to use authentication middleware
const { protect, admin } = require('./middleware/authMiddleware');
app.use('/api/admin', protect, admin, adminRoutes);

// Create admin user if it doesn't exist
const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@animeyou.com' });
    
    if (!adminExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin',  // Changed from admin@animeyou.com
        password: 'admin', // Changed from Admin123!
        role: 'admin'
      });
      console.log('Admin user created');
    }

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

createAdminUser();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));