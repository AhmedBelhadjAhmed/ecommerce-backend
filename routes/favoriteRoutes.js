const express = require('express')

const { create, getAll, deleteFavorite, getLikesByProduct , createOrDeleteFavorite } = require('../controllers/favoriteController')

const router = express.Router()

router.post('/' , create)
router.post('/getall', getAll)
router.post('/createOrDelete', createOrDeleteFavorite)
router.get('/likes', getLikesByProduct)
router.delete('/', deleteFavorite)

module.exports = router