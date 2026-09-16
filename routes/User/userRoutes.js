const express = require('express')
const router = express.Router();
const upload = require('../../middleware/upload')
// const verifyToken = require('../../middleware/verifyToken')
const {createUser ,verifyUserEmail, loginUser} = require("../../controllers/User/userController")
router.post("/create",upload.single("profileImg"),createUser)
router.get("/verify-email/:verificationToken", verifyUserEmail)
router.post("/login",loginUser)
module.exports= router;