const MenuItem = require("../models/MenuItem");
const Categor = require("../models/MenuCategory");
const createMenuItem = async (req, res) => {
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
        const category = await Categor.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        const outletId = category.outlet;
        if (!outletId) {
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
        const menuItem = await MenuItem.findById(menuItemId);
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
        await MenuItem.findByIdAndDelete(menuItemId);
        res.status(200).json({message:"Menu item deleted successfully",menuItem})
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
    getAllMenuItems
};


