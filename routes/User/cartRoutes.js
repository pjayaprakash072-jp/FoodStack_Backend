const cartController = require("../../controllers/User/cartController")
const verifyToken = require('../../middleware/verifyToken')
const authorizeRoles = require('../../middleware/authroizeRoles')
const router = require('express').Router();

router.get('/getll',verifyToken,authorizeRoles("user"),cartController.getCartItems);
router.post('/add',verifyToken,authorizeRoles('user'),cartController.addCartItems)

module.exports = router;