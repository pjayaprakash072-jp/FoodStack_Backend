const menuItemController = require('../controllers/menuItemController');
const upload = require('../middleware/upload');

const router = require('express').Router();

router.post('/add/:categoryId',upload.single('image'),menuItemController.createMenuItem);
router.get('/all',menuItemController.getAllMenuItems);
router.get('/outlet/:outletId',menuItemController.getMenuitemsByOutlet);
router.get('/category/:categoryId',menuItemController.getMenuItemsByCategory);
router.put('/update/:menuItemId',upload.single('image'),menuItemController.updateMenuItem);
router.delete('/delete/:menuItemId',menuItemController.deleteMenuItem);
router.get('/:menuItemId',menuItemController.getMenuItemById);
module.exports = router;