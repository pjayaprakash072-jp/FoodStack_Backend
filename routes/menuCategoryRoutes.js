const menuCategoryController = require('../controllers/menuCategoryController');
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authroizeRoles")

router.post('/create/:outletId',verifyToken,authorizeRoles("vendor"),  upload.single('image'), menuCategoryController.createMenuCategory);
router.get('/vendor/:vendorId', menuCategoryController.getMenuCategoriesByVendor);
router.get('/outlet/:outletId', menuCategoryController.getMenuCategoriesByOutlet);
router.get('/getall', menuCategoryController.getAllMenuCategories);
router.get('/get/:id', menuCategoryController.getMenuCategoryById);
router.put('/update/:id',verifyToken, authorizeRoles("vendor"),upload.single('image'), menuCategoryController.updateMenuCategory);
router.delete('/delete/:id',verifyToken,authorizeRoles("vendor"), menuCategoryController.deleteMenuCategory);

module.exports = router;