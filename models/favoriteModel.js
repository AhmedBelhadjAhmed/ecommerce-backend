const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to the User model
        ref: 'User',  // Referencing the 'User' model
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,  // Reference to the Product model
        ref: 'Product',  // Referencing the 'Product' model
        required: true
    }
}, {
    timestamps: true,  // Automatically adds createdAt and updatedAt fields
    collection: 'favorites'  // Use 'favorites' collection in MongoDB
});


const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
