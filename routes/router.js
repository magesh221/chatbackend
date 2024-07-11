const express = require('express')
const router = express.Router()
const loginController = require('../controller/loginDetails')
const message = require('../controller/messageController')
const validation = require('../middleware/validation')
const helper = require('../middleware/helper')

// image upload 
const multer = require("multer");
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/login', validation.adminLoginValidation, loginController.login)
router.post('/register', validation.adminValidation, loginController.register)
router.get('/userList', helper.Authorization, loginController.usersList)
router.get('/profile_pic', helper.Authorization, loginController.profile_pic)
router.post("/imageupload", helper.Authorization, upload.single('file', 'filePath'), loginController.imageUpload)
router.post('/addmsg', helper.Authorization, message.addMessage)
router.post("/upload", upload.single('file', 'filePath'), loginController.uploads)
router.post("/multiupload", upload.array('files', 50), loginController.multipleUploads);



module.exports = router;
