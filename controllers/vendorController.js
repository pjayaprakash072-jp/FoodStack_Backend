const Vendor = require('../models/Vendor')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const createVendor = async (req, res) => {
    try {
        const{
            name,
            email,
            password,
            phone,
            businessName
        } = req.body;
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({ message: "Vendor with this email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const profileImg = req.file ? req.file.path : "";
        const vendor = new Vendor({
            name,
            email,
            password: hashedPassword,
            phone,
            businessName,
            profileImg
        });

        await vendor.save();

        res.status(201).json({ message: "Vendor created successfully", vendor });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }

}

const loginVendor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        const isMatch = await bcrypt.compare(password, vendor.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: "Vendor logged in successfully", token, vendor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find();
        res.status(200).json({ message: "Vendors retrieved successfully", vendors });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getVendorById = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        res.status(200).json({ message: "Vendor retrieved successfully", vendor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const updateVendor = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const updateData = req.body;
        const profileImg = req.file ? req.file.path : undefined;
        if (profileImg) {
            updateData.profileImg = profileImg;
        }
        const vendor = await Vendor.findByIdAndUpdate(vendorId, updateData, { new: true, runValidators: true });

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.status(200).json({ message: "Vendor updated successfully", vendor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const deleteVendor = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor.findByIdAndDelete(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        res.status(200).json({ message: "Vendor deleted successfully", vendor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



module.exports = {
    createVendor,
    getAllVendors,
    getVendorById,
    updateVendor,
    deleteVendor,
    loginVendor
};

