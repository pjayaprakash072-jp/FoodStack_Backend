const {
    createMenuItem,
    getAllMenuItemsByVendor,
    getAllMenuItems,
    getMenuitemsByOutlet,
    getMenuItemsByCategory,
    updateMenuItem,
    deleteMenuItem,
    getMenuItemById
} = require('../controllers/menuItemController');
const upload = require('../middleware/upload');
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles")
const router = require('express').Router();

router.post('/add/:categoryId',verifyToken,authorizeRoles("vendor", "manager"), upload.single('image'),createMenuItem);
router.get('/vendor/:vendorId',getAllMenuItemsByVendor);
router.get('/getall',getAllMenuItems);
router.get('/outlet',getMenuitemsByOutlet);
router.get('/category/:categoryId',getMenuItemsByCategory);
router.put('/update/:menuItemId',verifyToken, authorizeRoles("vendor", "manager"), upload.single('image'),updateMenuItem);
router.delete('/delete/:menuItemId',verifyToken,authorizeRoles("vendor", "manager"),deleteMenuItem);
router.get('/get/:menuItemId',getMenuItemById);
module.exports = router;