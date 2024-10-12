const express = require('express')
const router = express.Router()
const { create, getAll, getById, deleteCategory, updateCategory } = require('../controllers/categoryController')

router.post( '/' , create )
router.get( '/' ,  getAll )
router.get( '/:id' ,  getById )
router.delete( '/:id' , deleteCategory )
router.put( '/:id' , updateCategory )

module.exports = router