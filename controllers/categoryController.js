const Category = require('../models/categoryModel'); // Assuming you're using Mongoose

// Create category
const create = async (req, res) => {
    try {
        const data = req.body;
        const category = new Category(data);  // Create a new instance of the category model
        await category.save();  // Save the category to MongoDB
        res.status(200).send(category);
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
};

// Get all categories
const getAll = async (req, res) => {
    try {
        const categories = await Category.find();  // Find all categories
        res.status(200).send(categories);
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
};

// Get category by ID
const getById = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findById(id);  // Find category by ID
        if (!category) return res.status(404).send({ error: 'Not Found' });
        res.status(200).send(category);
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
};

// Delete category
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findByIdAndDelete(id);  // Find and delete by ID
        if (!category) return res.status(404).send({ error: 'Not Found' });
        res.status(200).send({ success: 'Category Deleted' });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
};

// Update category
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const category = await Category.findByIdAndUpdate(id, data, { new: true });  // Update category by ID
        if (!category) return res.status(404).send({ error: 'Not Found' });
        res.status(200).send(category);
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
};

module.exports = {
    create,
    getAll,
    getById,
    deleteCategory,
    updateCategory
};
