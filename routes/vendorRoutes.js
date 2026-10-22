const express = require("express");
const router = express.Router();
const { createVendor, getAllVendors, getVendorById, updateVendor, deleteVendor,loginVendor,forgotPassword,resetPassword,googleLogin} = require("../controllers/vendorController");

const upload = require("../middleware/upload")
const verifyToken = require("../middleware/verifyToken");
const authorizeRoles = require("../middleware/authorizeRoles")
router.post("/create/:authId", upload.single("profileImg"), createVendor);
router.post("/login", loginVendor);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password/:token",resetPassword);


router.get("/getall", getAllVendors);
router.get("/get/:id", getVendorById);
router.put("/update",verifyToken, authorizeRoles("vendor"), upload.single("profileImg"), updateVendor);
router.delete("/delete/:id", deleteVendor);
router.post("/google-login",googleLogin)

module.exports = router;