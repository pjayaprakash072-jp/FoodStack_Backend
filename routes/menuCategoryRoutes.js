const {
    createMenuCategory,
    getMenuCategoriesByVendor,
    getMenuCategoriesByOutlet,
    getAllMenuCategories,
    getMenuCategoryById,
    updateMenuCategory,
    deleteMenuCategory
} = require('../controllers/menuCategoryController');
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles")

router.post('/create',verifyToken,authorizeRoles("vendor", "manager"),  upload.single('image'), createMenuCategory);
router.get('/vendor/:vendorId', getMenuCategoriesByVendor);
router.get('/outlet', getMenuCategoriesByOutlet);
router.get('/getall', getAllMenuCategories);
router.get('/get/:id', getMenuCategoryById);
router.put('/update/:id',verifyToken, authorizeRoles("vendor", "manager"),upload.single('image'), updateMenuCategory);
router.delete('/delete/:id',verifyToken,authorizeRoles("vendor", "manager"), deleteMenuCategory);

module.exports = router;