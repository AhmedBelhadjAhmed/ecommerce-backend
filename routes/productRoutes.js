const express = require('express')
const router = express.Router()
const { create , getAll, getById, deleteProduct , deleteMultipleProducts ,UpdateProduct ,deleteAllProducts , searchByName ,getAllPagination, getProductsByCategoryWithPagination}  = require('../controllers/productController')
const { handleMultipleUploads } = require('../middlewares/uploadMultipleImages')

// Routes for products
router.post('/', handleMultipleUploads, create);
router.get('/', getAll);
router.get('/pagination', getAllPagination);
router.post('/category', getProductsByCategoryWithPagination);
router.get('/search', searchByName);
router.delete('/delete-all', deleteAllProducts);  // Use a more specific route here
router.get('/:id', getById);
router.delete('/:id', deleteProduct);
router.delete('/', deleteMultipleProducts);
router.put('/:id', handleMultipleUploads, UpdateProduct);

module.exports = router