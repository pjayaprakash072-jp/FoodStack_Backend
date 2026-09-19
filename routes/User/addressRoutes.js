const router = require('express').Router();
const {
    createAddress,
    getAddresses,
    getOneAddress,
    updateAddress,
    delteAddress
} = require('../../controllers/User/addressController')

const verifyToken = require('../../middleware/verifyToken')
const authorizeRoles = require('../../middleware/authorizeRoles')

router.post('/create',verifyToken,authorizeRoles("user"),createAddress);
router.get('/getall',verifyToken,authorizeRoles("user"),getAddresses);
router.get('/:addressId',verifyToken,authorizeRoles("user"),getOneAddress);
router.put('/update/:addressId',verifyToken,authorizeRoles("user"),updateAddress)
router.delete('/delete/:addressId',verifyToken,authorizeRoles("user"),delteAddress)