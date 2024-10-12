const express = require('express')
const router = express.Router()
const {  register,login , checkPassword , forgetPass , resetPass} = require('../controllers/authController')
const { handleSingleUpload } = require('../middlewares/uploadSingleImage')

router.post( '/register' , handleSingleUpload , register )
router.post('/checkPassword' , checkPassword)
router.post( '/login' , login )
router.post( '/forgetPass' , forgetPass )
router.post( '/resetPass' , resetPass )

module.exports = router