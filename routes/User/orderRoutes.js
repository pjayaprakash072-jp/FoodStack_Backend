const {createOrder,getAllOrdersByUser,getOneOrder,getAllOrderByVendor,getOrdersByOutlet} = require('../../controllers/User/orderController')
const verifyToken = require('../../middleware/verifyToken')
const authorizeRoles = require('../../middleware/authorizeRoles')

const router = require('express').Router();

router.post('/create',verifyToken,authorizeRoles("user"),createOrder);
router.get('/getall', verifyToken, authorizeRoles("user"),getAllOrdersByUser);
router.get('/get/:orderId',verifyToken,authorizeRoles("user"),getOneOrder);
router.get('/vendor',verifyToken,getAllOrderByVendor)
router.get('/outlet',verifyToken,getOrdersByOutlet)
module.exports =router