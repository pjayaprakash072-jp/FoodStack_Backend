const menuItemController = require('../controllers/menuItemController');
const upload = require('../middleware/upload');
const verifyToken = require("../middleware/verifyToken");

const router = require('express').Router();

router.post('/add/:categoryId',verifyToken,upload.single('image'),menuItemController.createMenuItem);
router.get('/vendor/:vendorId',menuItemController.getAllMenuItemsByVendor);
router.get('/getall',menuItemController.getAllMenuItems);
router.get('/outlet/:outletId',menuItemController.getMenuitemsByOutlet);
router.get('/category/:categoryId',menuItemController.getMenuItemsByCategory);
router.put('/update/:menuItemId',verifyToken,upload.single('image'),menuItemController.updateMenuItem);
router.delete('/delete/:menuItemId',verifyToken,menuItemController.deleteMenuItem);
router.get('/get/:menuItemId',menuItemController.getMenuItemById);
module.exports = router;