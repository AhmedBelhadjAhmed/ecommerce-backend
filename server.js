const port = 3000;
const mongoose = require('./config/db'); // Now using Mongoose
const express = require('express');
const app = express();
const cors = require('cors');

// Import Mongoose models
const Product = require('./models/productModel');
const User = require('./models/userModel');
const Category = require('./models/categoryModel');
const Favorite = require('./models/favoriteModel');

// Middleware setup
app.use(express.json());

// CORS configuration
const corsOptions = {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const favoritesRoutes = require('./routes/favoriteRoutes');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/favorites', favoritesRoutes);

// No need to manually sync database with Mongoose; Mongoose manages the schema.

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
