const express = require("express");
const router = express.Router();
const { createVendor, getAllVendors, getVendorById, updateVendor, deleteVendor} = require("../controllers/vendorController");

const upload = require("../middleware/upload")
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles")
router.post("/create/:authId", upload.single("profileImg"), createVendor);
router.get("/getall", getAllVendors);
router.get("/getOne",verifyToken,getVendorById);
router.put("/update",verifyToken, authorizeRoles("vendor"), upload.single("profileImg"), updateVendor);
router.delete("/delete/:id", deleteVendor);


module.exports = router;