const Vendor = require('../models/Vendor')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Outlet = require('../models/Outlet');
const MenuCategory = erquire('../models/MenuCategory');
const MenuItem = require('../models/MenuItem');


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
        const profileImg = req.file
        ? {
            url:req.file.path,
            public_id:req.file.filename
        }:{
            url:"",
            public_id:""
        }
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
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        // if new image is uploaded, delete the old image from cloudinary
        if(req.file){
            if(vendor.profileImg?.public_id){
                await cloudinary.uploader.destroy(vendor.profileImg.public_id);
            }
            //save new cloudinary image details.
            vendor.profileImg = {
                public_id: req.file.filename,
                url: req.file.path
            }
        }
        // update otehr values
        Object.assign(vendor,req.body);
        await vendor.save();
        res.status(200).json({ message: "Vendor updated successfully", vendor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const deleteVendor = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        // Delete image from cloudinary
        if (vendor.profileImg?.public_id) {
            await cloudinary.uploader.destroy(vendor.profileImg.public_id);
        }
        const outlets = await Outlet.find({ vendor: vendorId });
        if (outlets.length > 0) {
            await Outlet.deleteMany({ vendor: vendorId });
        }
        const menuCategories = await MenuCategory.find({ vendor: vendorId });
        if (menuCategories.length > 0) {
            await MenuCategory.deleteMany({ vendor: vendorId });
        }
        const menuItems = await MenuItem.find({ vendor: vendorId });
        if (menuItems.length > 0) {
            await MenuItem.deleteMany({ vendor: vendorId });
        }
        await Vendor.findByIdAndDelete(vendorId);
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

