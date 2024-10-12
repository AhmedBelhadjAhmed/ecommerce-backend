const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'Category name cannot be empty'],
        unique: true,
        trim: true,  // Removes whitespace from the start and end
    }
}, {
    timestamps: true,  // Adds createdAt and updatedAt timestamps
    collection: 'categories'  // Equivalent to Sequelize's tableName
});

// Create the Category model
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
