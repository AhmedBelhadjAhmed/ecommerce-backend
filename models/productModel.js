const mongoose = require('mongoose');
const Category = require('../models/categoryModel')
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name can't be empty!"],  // Validation similar to Sequelize
        trim: true  // Remove leading/trailing whitespace
    },
    price: {
        type: Number,
        required: [true, "Product price can't be empty!"],  // Validation for required field
        min: [1, "Product price must be greater than 0!"],  // Minimum price validation
        validate: {
            validator: function(value) {
                return !isNaN(value);  // Ensure price is a number
            },
            message: "Product price must be a number!"
        }
    },
    description: {
        type: String,
        required: [true, "Product description can't be empty!"]
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to the Category model
        ref: Category,  // Ensure the relationship with the Category model
        required: [true, "Product must belong to a category!"],
    },
    images: {
        type: [String],  // Array of image URLs
        default: []  // Default is an empty array if no images are provided
    }
}, {
    timestamps: true,  // Adds createdAt and updatedAt timestamps
    collection: 'products'  // Specify the collection name in MongoDB
});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
