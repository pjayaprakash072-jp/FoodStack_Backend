const express = require("express");
const router = express.Router();
const { createVendor, getAllVendors, getVendorById, updateVendor, deleteVendor,loginVendor} = require("../controllers/vendorController");

const upload = require("../middleware/upload")

router.post("/create", upload.single("profileImg"), createVendor);
router.get("/getall", getAllVendors);
router.get("/get/:id", getVendorById);
router.put("/update/:id", upload.single("profileImg"), updateVendor);
router.delete("/delete/:id", deleteVendor);
router.post("/login", loginVendor);

module.exports = router;