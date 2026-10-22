const express = require('express')
const router = express.Router();
const upload = require('../../middleware/upload')
const verifyCaptcha = require("../../middleware/verifyCaptcha")
const verifyToken = require('../../middleware/verifyToken')
const authorizeRoles = require('../../middleware/authorizeRoles')
const {createUser,updateUser ,verifyUserEmail, loginUser,getOneUser} = require("../../controllers/User/userController")
router.post("/create/:authId",upload.single("profileImg"),createUser)
router.post("/login",verifyCaptcha,loginUser)
router.get("/getOne/:authId",getOneUser)


router.put("/update",upload.single("profileImg"),verifyToken,authorizeRoles("user"),updateUser)
module.exports= router;