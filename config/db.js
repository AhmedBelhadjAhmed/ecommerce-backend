const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB Atlas successfully.'))
    .catch((error) => console.error('Unable to connect to MongoDB:', error));

module.exports = mongoose;


