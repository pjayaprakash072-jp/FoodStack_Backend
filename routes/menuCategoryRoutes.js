const menuCategoryController = require('../controllers/menuCategoryController');
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');


router.post('/', upload.single('image'), menuCategoryController.createMenuCategory);
router.get('/outlet/:outletId', menuCategoryController.getMenuCategoriesByOutlet);
router.get('/', menuCategoryController.getAllMenuCategories);
router.get('/:id', menuCategoryController.getMenuCategoryById);
router.put('/:id', upload.single('image'), menuCategoryController.updateMenuCategory);
router.delete('/:id', menuCategoryController.deleteMenuCategory);

module.exports = router;