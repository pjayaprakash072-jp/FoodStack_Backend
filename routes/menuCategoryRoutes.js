const menuCategoryController = require('../controllers/menuCategoryController');
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');


router.post('/create/:outletId', upload.single('image'), menuCategoryController.createMenuCategory);
router.get('/outlet/:outletId', menuCategoryController.getMenuCategoriesByOutlet);
router.get('/all', menuCategoryController.getAllMenuCategories);
router.get('/get/:id', menuCategoryController.getMenuCategoryById);
router.put('/update/:id', upload.single('image'), menuCategoryController.updateMenuCategory);
router.delete('/delete/:id', menuCategoryController.deleteMenuCategory);

module.exports = router;