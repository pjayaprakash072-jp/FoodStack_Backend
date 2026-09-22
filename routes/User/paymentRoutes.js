const {createPayment,verifyPayment} = require('../../controllers/User/paymentController')
const router = require('express').Router();
const verifyToken= require('../../middleware/verifyToken');
const authorizeRoles = require('../../middleware/authorizeRoles')
router.post('/create',verifyToken,authorizeRoles("user"),createPayment);
router.post('/verify',verifyToken,authorizeRoles("user"),verifyPayment);

module.exports = router;