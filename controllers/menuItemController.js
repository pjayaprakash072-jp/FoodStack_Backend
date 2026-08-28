const MenuItem = require("../models/MenuItem");
const Category = require("../models/MenuCategory");
const Outlet = require('../models/Outlet')
const cloudinary = require('../config/cloudinary');
const Vendor = require('../models/Vendor')

const createMenuItem = async (req, res) => {
    // console.log(req.body)
    const categoryId = req.params.categoryId;
    try {
        
        const{
            name,
            description,
            price,
            stock,
            discount,
            foodType,
            preparationTime,
            isAvailable
        }
        = req.body;
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        const outletId = category.outlet;
        const outlet = await Outlet.findById(outletId)
        if (!outlet) {
            return res.status(404).json({ message: "Outlet not found" });
        }
        const image = req.file 
        ?{
            url:req.file.path,
            public_id:req.file.filename
        }:{
            url:"",
            public_id:""
        }
        const newMenuItem = new MenuItem({
            outlet: outletId,
            category: categoryId,
            name,
            description,
            price,
            stock,
            image,
            discount,
            foodType,
            preparationTime,
            isAvailable
        });
        category.menuItems.push(newMenuItem._id);
        await category.save();
        outlet.menuItems.push(newMenuItem._id);
        await outlet.save();
        await newMenuItem.save();
        res.status(201).json({ message: "Menu item created successfully", menuItem: newMenuItem });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" ,error:err.message });
    }
};

const getAllMenuItems = async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.status(200).json({message:"Menu items fetched successfully",menuItems});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error",error:err.message });
    }
};

const getMenuItemById = async (req, res) => {
    try {
        const menuItemId = req.params.menuItemId;
        const menuItem = await MenuItem.findById(menuItemId).populate('outlet' , 'name').populate('category','name')
        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }
        res.status(200).json({message:"Menu item fetched successfully",menuItem});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" ,error:err.message});
    }
};

const getMenuitemsByOutlet = async (req, res) => {
    try {
        const outletId = req.params.outletId;
        const menuItems = await MenuItem.find({ outlet: outletId });
        if (!menuItems) {
            return res.status(404).json({ message: "Menu items not found" });
        }
        res.status(200).json({message:"Menu items fetched successfully",menuItems});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" ,error:err.message});
    }
}

const getMenuItemsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const menuItems = await MenuItem.find({ category: categoryId });
        if (!menuItems) {
            return res.status(404).json({ message: "Menu items not found" });
        }
        res.status(200).json({message:"Menu items fetched successfully",menuItems});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error",error:err.message });
    }
}

const updateMenuItem = async (req, res) => {
    console.log(req.body);
    try{
        const menuItemId = req.params.menuItemId;
        const menuItem = await MenuItem.findById(menuItemId);
        if(!menuItem){
            return res.status(404).json({message:"Menu item not found"});
        }
        // If new image is uploaded, delete the old image from cloudinary
        if(req.file){
            if(menuItem.image?.public_id){
                await cloudinary.uploader.destroy(menuItem.image.public_id);
            }
            //save new cloudinary image details.
            menuItem.image = {
                public_id: req.file.filename,
                url: req.file.path
            }
        }
        // update otehr fields.
        Object.assign(menuItem,req.body);
        await menuItem.save();
        
        res.status(200).json({message:"Menu item updated successfully",menuItem})
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error",error:err.message });
    }
}

const deleteMenuItem = async (req, res) => {
    try{
        const menuItemId = req.params.menuItemId;

        const menuItem = await MenuItem.findById(menuItemId);

        if(!menuItem){
            return res.status(404).json({message:"Menu item not found"});
        }


        //Delete the image from cloudinary
        if(menuItem.image?.public_id){
            await cloudinary.uploader.destroy(menuItem.image.public_id);
        }

        //Delete the menu item from the outlet's menuItems array
        await Outlet.findByIdAndUpdate(
            menuItem.outlet,
            {
                $pull:{menuItems:menuItemId}
            }
        )
        // Delete the menu item from the menu category's menuItems array
        await Category.findByIdAndUpdate(
            menuItem.category,
            {
                $pull:{menuItems:menuItemId}
            }
        )
        await MenuItem.findByIdAndDelete(menuItemId);
        res.status(200).json({message:"Menu item deleted successfully",menuItem})
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error",error:err.message });
    }
}

const getAllMenuItemsByVendor = async (req, res) => {
    try{
        const vendorId = req.params.vendorId;
        const vendor = await Vendor.findById(vendorId);
        if(!vendor){
            return res.status(404).json({message:"Vendor not found"});
        }
        const outlets = await Outlet.find({vendor:vendorId});
        const outletIds = outlets.map(outlet=>outlet._id);
        const menuItems = await MenuItem.find({outlet:{$in:outletIds}}).populate('outlet','name city area').populate('category','name');
        res.status(200).json({message:"Menu items fetched successfully",menuItems});
     }
     catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error",error:err.message });
    }

}
module.exports = {
    createMenuItem,
    getMenuItemById,
    getMenuitemsByOutlet,
    getMenuItemsByCategory,
    updateMenuItem,
    deleteMenuItem,
    getAllMenuItems,
    getAllMenuItemsByVendor
};


