const menuCategoryController = require('../controllers/menuCategoryController');
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const verifyToken = require("../middleware/verifyToken");


router.post('/create/:outletId',verifyToken, upload.single('image'), menuCategoryController.createMenuCategory);
router.get('/vendor/:vendorId', menuCategoryController.getMenuCategoriesByVendor);
router.get('/outlet/:outletId', menuCategoryController.getMenuCategoriesByOutlet);
router.get('/getall', menuCategoryController.getAllMenuCategories);
router.get('/get/:id', menuCategoryController.getMenuCategoryById);
router.put('/update/:id',verifyToken, upload.single('image'), menuCategoryController.updateMenuCategory);
router.delete('/delete/:id',verifyToken,menuCategoryController.deleteMenuCategory);

module.exports = router;