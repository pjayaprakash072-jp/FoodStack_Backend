const router = require('express').Router();

const {createVendorAuth,loginVendor} = require('../controllers/vendorAuthController');

router.post("/create",createVendorAuth);
router.post("/login",loginVendor);

module.exports = router