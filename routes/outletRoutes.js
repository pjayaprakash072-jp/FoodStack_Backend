const outletController = require("../controllers/outletController");
const upload = require("../middleware/upload");

const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");

router.post("/create", verifyToken, upload.single("image"), outletController.createOutlet);
router.get("/all", outletController.getAllOutlets);
router.get("/:id", outletController.getOutletById);
router.get("/vendor/:vendorId", outletController.getOutletsByVendorId);
router.put("/update/:id", verifyToken, upload.single("image"), outletController.updateOutlet);
router.delete("/delete/:id", verifyToken, outletController.deleteOutlet);

module.exports = router;
