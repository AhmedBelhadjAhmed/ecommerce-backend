const Favorite = require('../models/favoriteModel');
const Product = require('../models/productModel');

// Create favorite
const create = async (req, res) => {
    try {
        const arrayOfData = req.body; // Assuming this is an array of favorite objects
        const favorites = await Favorite.insertMany(arrayOfData); // Use insertMany for bulk insert
        res.status(200).send(favorites);
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
};

// Get all favorites
const getAll = async (req, res) => {
    try {
        const { userId } = req.body;

        // Query the 'favorites' collection using 'user' instead of 'userId'
        const favorites = await Favorite.find({ user: userId }) // Use user here
            .populate('product', ['_id', 'name', 'price', 'description', 'images']); // Populate to include product data

        res.status(200).send(favorites);
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
};

// get number of likes for each product
const getLikesByProduct = async (req, res) => {
    try {
        const likes = await Favorite.aggregate([
            {
                $group: {
                    _id: '$product',  // Make sure this matches the field in your Favorite schema
                    likes: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'products',  // Ensure this matches the name of your products collection
                    localField: '_id',  // Ensure this matches the output of the previous stage
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
            {
                $project: {
                    productId: '$_id',
                    likes: 1,
                    product: {
                        id: '$product._id',
                        name: '$product.name',
                        price: '$product.price',
                        description: '$product.description',
                        images: '$product.images'
                    }
                }
            },
            { $sort: { likes: -1 } } // Sort by number of likes
        ]);

        res.status(200).send(likes);
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
};

// Create or delete favorite
const createOrDeleteFavorite = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        // Check if the favorite already exists using the correct field names
        const existingFavorite = await Favorite.findOne({ user: userId, product: productId }); // Use user and product here

        if (existingFavorite) {
            // If it exists, delete the favorite
            await existingFavorite.deleteOne();
            return res.status(200).send({ message: 'Favorite removed successfully' });
        } else {
            // If it doesn't exist, create the favorite using the correct field names
            const newFavorite = new Favorite({ user: userId, product: productId }); // Use user and product here
            await newFavorite.save();
            return res.status(201).send(newFavorite);
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
};


// Delete favorite
const deleteFavorite = async (req, res) => {
    const { userId, productId } = req.body;

    try {
        const favorite = await Favorite.findOne({ user: userId, product: productId }); // Use the correct field names
        if (!favorite) return res.status(400).send({ error: 'Favorite not found' });

        await favorite.deleteOne();
        res.status(200).send({ message: 'Favorite deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
};

module.exports = {
    create,
    getAll,
    deleteFavorite,
    getLikesByProduct,
    createOrDeleteFavorite
};
