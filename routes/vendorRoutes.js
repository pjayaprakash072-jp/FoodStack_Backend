const express = require("express");
const router = express.Router();
const { createVendor, getAllVendors, getVendorById, updateVendor, deleteVendor } = require("../controllers/vendorController");

const upload = require("../middleware/upload")

router.post("/vendors", upload.single("profileImg"), createVendor);
router.get("/vendors", getAllVendors);
router.get("/vendors/:id", getVendorById);
router.put("/vendors/:id", upload.single("profileImg"), updateVendor);
router.delete("/vendors/:id", deleteVendor);
