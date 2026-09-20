const {getCartItems,addCartItem,updateCart,clearCart,removeItem,mergeCart} = require("../../controllers/User/cartController")
const verifyToken = require('../../middleware/verifyToken')
const authorizeRoles = require('../../middleware/authorizeRoles')
const router = require('express').Router();

router.get('/getall',verifyToken,authorizeRoles("user"),getCartItems);
router.post('/add',verifyToken,authorizeRoles('user'),addCartItem);
router.put('/update/:itemId',verifyToken,authorizeRoles("user"),updateCart);
router.delete('/remove/:itemId',verifyToken,authorizeRoles("user"),removeItem);
router.delete('/clear',verifyToken,authorizeRoles("user"),clearCart);
router.post('/merge',verifyToken,authorizeRoles("user"),mergeCart)

module.exports = router;