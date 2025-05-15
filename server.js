const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

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

// Set up static folder for uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/products', require('./routes/productRoutes'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// In your server.js file
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static('uploads'));
