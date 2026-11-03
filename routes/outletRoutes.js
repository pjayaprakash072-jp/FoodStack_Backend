const {
    createOutlet,
    getAllOutlets,
    getOutletById,
    getOutletsByVendorId,
    updateOutlet,
    deleteOutlet
} = require("../controllers/outletController");
const upload = require("../middleware/upload");
const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles")
router.post("/create", verifyToken, authorizeRoles("vendor"), upload.single("image"),createOutlet);
router.get("/getall", getAllOutlets);
router.get("/get/:id", getOutletById);
router.get("/vendor/:vendorId", getOutletsByVendorId);
router.put("/update", verifyToken, authorizeRoles("vendor", "manager"), upload.single("image"), updateOutlet);
router.delete("/delete/:id", verifyToken, authorizeRoles("vendor"), deleteOutlet);

module.exports = router;
