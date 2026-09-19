const {getCartItems,addCartItem} = require("../../controllers/User/cartController")
const verifyToken = require('../../middleware/verifyToken')
const authorizeRoles = require('../../middleware/authorizeRoles')
const router = require('express').Router();

router.get('/getll',verifyToken,authorizeRoles("user"),getCartItems);
router.post('/add',verifyToken,authorizeRoles('user'),addCartItem)

module.exports = router;