const menuCategoryController = require('../controllers/menuCategoryController');
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles")

router.post('/create',verifyToken,authorizeRoles("vendor", "manager"),  upload.single('image'), menuCategoryController.createMenuCategory);
router.get('/vendor/:vendorId', menuCategoryController.getMenuCategoriesByVendor);
router.get('/outlet', menuCategoryController.getMenuCategoriesByOutlet);
router.get('/getall', menuCategoryController.getAllMenuCategories);
router.get('/get/:id', menuCategoryController.getMenuCategoryById);
router.put('/update/:id',verifyToken, authorizeRoles("vendor", "manager"),upload.single('image'), menuCategoryController.updateMenuCategory);
router.delete('/delete/:id',verifyToken,authorizeRoles("vendor", "manager"), menuCategoryController.deleteMenuCategory);

module.exports = router;