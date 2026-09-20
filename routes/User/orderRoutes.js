const {createOrder,getAllOrders,getOneOrder} = require('../../controllers/User/orderController')
const verifyToken = require('../../middleware/verifyToken')
const authorizeRoles = require('../../middleware/authorizeRoles')

const router = require('express').Router();

router.post('/create',verifyToken,authorizeRoles("user"),createOrder);
router.get('/getall', verifyToken, authorizeRoles("user"),getAllOrders);
router.get('/get/:orderId',verifyToken,authorizeRoles("user"),getOneOrder);
module.exports =router