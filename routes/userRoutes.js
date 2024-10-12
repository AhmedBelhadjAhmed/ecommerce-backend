const express = require('express')
const router = express.Router()
const {  getAll, getById , deleteUser , getAllExceptAdmin , searchUsersByName , UpdateUser} = require('../controllers/userController')
const  verifyToken  = require('../middlewares/verifyToken')
const { handleSingleUpload } = require('../middlewares/uploadSingleImage')

router.get( '/' , getAll )
router.get('/exclude-admin', getAllExceptAdmin)
router.get('/search', searchUsersByName)
router.get('/:id' , verifyToken ,  getById )
router.delete('/:id' , deleteUser )
router.put('/:id'  ,handleSingleUpload, UpdateUser )



module.exports = router