const express = require('express')
const router = express.Router();
const upload = require('../../middleware/upload')
// const verifyToken = require('../../middleware/verifyToken')
const {createCustomer ,verifyCustomerEmail, loginCustomer} = require("../../controllers/Customer/customerController")
router.post("/create",upload.single("profileImg"),createCustomer)
router.get("/verify-email/:verificationToken", verifyCustomerEmail)
router.post("/login",loginCustomer)
module.exports= router;