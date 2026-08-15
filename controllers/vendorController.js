const Vendor = require('../models/Vendor')


const createVendor = async (req, res) => {
    try {
        const{
            name,
            email,
            password,
            phone,
            businessName
        } = req.body;

        const profileImg = req.file ? req.file.path : "";
        const vendor = new Vendor({
            name,
            email,
            password,
            phone,
            businessName,
            profileImg
        });

        res.status(201).json({ message: "Vendor created successfully", vendor });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }

}



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
    deleteVendor
};

