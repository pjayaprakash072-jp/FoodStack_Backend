const router = require('express').Router();
const verifyToken = require('../middleware/verifyTokenAuth')
const {createVendorAuth,loginVendor,googleLogin,updateVendorAuth} = require('../controllers/vendorAuthController');

router.post("/create",createVendorAuth);
router.post("/login",loginVendor);
router.post("/google-login",googleLogin);
router.put('/update',verifyToken,updateVendorAuth);
module.exports = router