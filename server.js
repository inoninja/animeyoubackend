const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const adminRoutes = require('./routes/adminRoutes');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

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

// Set up static file serving with environment variable support
const uploadPath = process.env.UPLOAD_PATH || path.join(__dirname, 'uploads');
console.log('Serving static files from:', uploadPath);
app.use('/uploads', express.static(uploadPath));

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/admin', adminRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
