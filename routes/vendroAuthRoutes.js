const router = require('express').Router();
const verifyToken = require('../middleware/verifyTokenAuth')
const {createVendorAuth,loginVendor,googleLogin,deleteVendorAuth,updateVendorAuth,forgotPassword,resetPassword} = require('../controllers/vendorAuthController');
router.post("/create",createVendorAuth);
router.post("/login",loginVendor);
router.post("/google-login",googleLogin);
router.put('/update',verifyToken,updateVendorAuth);
router.delete('/delete',verifyToken,deleteVendorAuth)
router.post("/forgot-password",forgotPassword);
router.post("/reset-password/:token",resetPassword);
module.exports = router