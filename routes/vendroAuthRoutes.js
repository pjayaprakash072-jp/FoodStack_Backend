const router = require('express').Router();
const verifyToken = require('../middleware/verifyTokenAuth')
const {createVendorAuth,loginVendor,googleLogin,deleteVendorAuth,updateVendorAuth} = require('../controllers/vendorAuthController');

router.post("/create",createVendorAuth);
router.post("/login",loginVendor);
router.post("/google-login",googleLogin);
router.put('/update',verifyToken,updateVendorAuth);
router.delete('/delete',verifyToken,deleteVendorAuth)
module.exports = router