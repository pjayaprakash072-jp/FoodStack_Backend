const Vendor = require('../models/Vendor')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Outlet = require('../models/Outlet');
const MenuCategory = require('../models/MenuCategory');
const MenuItem = require('../models/MenuItem');
const cloudinary = require('../config/cloudinary');
const {sendWelcomeEmail, sendForgotPasswordLink}  =  require('../utils/email')
const crypto = require('crypto')

const {setCache} = require("../utils/cache")




const createVendor = async (req, res) => {
    try {
        const authId = req.params.authId;
        const{
            name,
            email,
            phone,
            businessName
        } = req.body;
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({ message: "Vendor with this email already exists" });
        }
        const profileImg = req.file
        ? {
            url:req.file.path,
            public_id:req.file.filename
        }:{
            url:"",
            public_id:""
        }
        const vendor = new Vendor({
            authId,
            name,
            email,
            phone,
            businessName,
            profileImg,
            authProvider: "local"
        });

        await vendor.save();
        try {
            await sendWelcomeEmail(email,name);
        } catch (error) {
            console.error("Email send failed" , error)
        }

        res.status(201).json(
            { 
                essage: "Vendor created successfully", 
                vendor 
            }
        );
    }
    catch (error) {
        console.error(error);
        res.status(500).json(
            {
                message: "Internal server error, Failed to create Vendor!", 
                error: error.message 
            }
        );
    }

}
const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find();
        res.status(200).json(
            { 
                message: "Vendors retrieved successfully", 
                vendors 
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            { 
                message: "Internal server error, Failed to retrieve all vendors!", 
                error: error.message 
            }
        );
    }
};

const getVendorById = async (req, res) => {
    try {
        const vendorId = req.vendorId;
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found, Failed to retrieve vendor By Id." });
        }
        res.status(200).json(
            { 
                message: "Vendor retrieved successfully",
                vendor 
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            { 
                message: "Internal server error, Failed to get vendor By id.", 
                error: error.message 
            }
        );
    }
};

const updateVendor = async (req, res) => {
    try {
        const vendorId = req.vendorId;
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
        const {...otherFields} = req.body;
        Object.assign(vendor,otherFields);
        await vendor.save();
        // const vendorResponse = vendor.toObject();
        res.status(200).json(
            { 
                message: "Vendor updated successfully", 
                vendor
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            { 
                message: "Internal server error, Failed to update Vendor!", 
                error: error.message 
            }
        );
    }
};


const deleteVendor = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        const outlets = await Outlet.find({vendor:vendorId});
        for(const outlet of outlets){
            const categories = await MenuCategory.find({outlet:outlet._id});
            for(const category of categories){
                const menuItems = await MenuItem.find({category:category._id});
                for(const item of menuItems){
                    if(item.image?.public_id){
                        await cloudinary.uploader.destroy(item.image.public_id);
                    }
                }
                await MenuItem.deleteMany({category:category._id});
                if(category.image?.public_id){
                    await cloudinary.uploader.destroy(category.image.public_id);
                }
                await MenuCategory.deleteMany({outlet:outlet._id});
            }
            if(outlet.image?.public_id){
                await cloudinary.uploader.destroy(outlet.image.public_id);
            }
        }
        await Outlet.deleteMany({vendor:vendorId});
        if(vendor.profileImg?.public_id){
            await cloudinary.uploader.destroy(vendor.profileImg.public_id);
        }
        await Vendor.findByIdAndDelete(vendorId);
        console.log("deleted.")
        res.status(200).json(
            { 
                message: "Vendor deleted successfully", 
                vendor 
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            { 
                message: "Internal server error, Failed to Delete the Vendor!", 
                error: error.message 
            }
        );
    }
};

module.exports = {
    createVendor,
    getAllVendors,
    getVendorById,
    updateVendor,
    deleteVendor
};

