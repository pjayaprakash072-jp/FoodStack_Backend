const router = require("express").Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const upload = require('../middleware/upload')
const {loginManager} = require('../controllers/managerController')
const {updateOutlet} = require('../controllers/outletController')
const {getMenuCategoriesByOutlet,getMenuCategoryById,createMenuCategory,updateMenuCategory,deleteMenuCategory} = require('../controllers/menuCategoryController')
const {getMenuitemsByOutlet,getMenuItemsByCategory,getMenuItemById,createMenuItem,updateMenuItem,deleteMenuItem} = require('../controllers/menuItemController')

router.post('/login',loginManager);
router.put('/outlet/update',verifyToken,authorizeRoles("manager"),updateOutlet);
router.get('/categories/outlet',verifyToken,authorizeRoles("manager"),getMenuCategoriesByOutlet);
router.post('/category/create',verifyToken,authorizeRoles("manager"),upload.single("image"),createMenuCategory);
router.get('/category/get/:id',verifyToken,authorizeRoles("manager"),getMenuCategoryById);
router.put('/category/update/:id',verifyToken,authorizeRoles("manager"),upload.single('image'),updateMenuCategory);
router.delete('/category/delete/:id',verifyToken,authorizeRoles("manager"),deleteMenuCategory);
router.get('/items/outlet',verifyToken,authorizeRoles("manager"),getMenuitemsByOutlet);
router.get('/items/category/:categoryId',verifyToken,authorizeRoles("manager"),getMenuItemsByCategory);
router.get("/items/get/:menuItemId",verifyToken,authorizeRoles("manager"),getMenuItemById);
router.post('/items/add/:categoryId',verifyToken,authorizeRoles("manager"),upload.single('image'),createMenuItem);
router.put("/items/update/:menuItemId",verifyToken,authorizeRoles("manager"),upload.single('image'),updateMenuItem);
router.delete("/items/delete/:menuItemId",verifyToken,authorizeRoles("manager"),deleteMenuItem)
module.exports =router 