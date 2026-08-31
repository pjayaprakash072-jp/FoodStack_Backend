const MenuItem = require("../models/MenuItem");
const Category = require("../models/MenuCategory");
const Outlet = require('../models/Outlet')
const cloudinary = require('../config/cloudinary');
const Vendor = require('../models/Vendor')
const {getCache,setCache,deleteCache} = require('../utils/cache')

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
            return res.status(404).json(
                { 
                    message: "Category not found" 
                }
            );
        }
        const outletId = category.outlet;
        const outlet = await Outlet.findById(outletId)
        if (!outlet) {
            return res.status(404).json(
                { 
                    message: "Outlet not found" 
                }
            );
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
        await clearMenuCategoryCache(
            {
                outletId,
                categoryId,
                vendorId:outlet.vendor
            }
        )
        res.status(201).json(
            {
                message: "Menu item created successfully", 
                menuItem: newMenuItem 
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json(
            { 
                message: "Internal server error" ,
                error:err.message 
            }
        );
    }
};

const getAllMenuItems = async (req, res) => {
    try {
        const cacheKey = "menuItems:all";
        const cachedItems = await getCache(cacheKey);
        if(cachedItems){
            console.log("Redis - CACHE HIT - getAllMenuItems");
            return res.status(200).json(
                {
                    message:"Menu items fetched successfully",
                    menuItems:cachedItems,
                    source:"Redis"
                }
            )
        }
        console.log("Redis CACHE MISS - getAllMenuItems");
        const menuItems = await MenuItem.find();
        await setCache(cacheKey, menuItems,300);
        res.status(200).json(
            {
                message:"Menu items fetched successfully",
                menuItems,
                source:"mongoDB"
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json(
            {
                message: "Internal server error",
                error:err.message 
            }
        );
    }
};

const getMenuItemById = async (req, res) => {
    try {
        const menuItemId = req.params.menuItemId;
        const cacheKey =`menuItem:${menuItemId}`;
        const cachedItem = await getCache(cacheKey);
        if(cachedItem){
            console.log("Redis  CACHE HIT - getMenuItemById");
            return res.status(200).json(
                {
                    message:"Menu item fetched successfully",
                    menuItem:cachedItem,
                    source:"Redis"
                }
            )
        }
        console.log("Redis CACHE MISS - getMenuItemById");
        const menuItem = await MenuItem.findById(menuItemId).populate('outlet' , 'name').populate('category','name')
        if (!menuItem) {
            return res.status(404).json(
                {
                    message: "Menu item not found" 
                }
            );
        }
        await setCache(cacheKey,menuItem,30);
        res.status(200).json(
            {
                message:"Menu item fetched successfully",
                menuItem,
                source:"mongoDb"
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json(
            { 
                message: "Internal server error" ,
                error:err.message
            })
            ;
    }
};

const getMenuitemsByOutlet = async (req, res) => {
    try {
        const outletId = req.params.outletId;
        const cacheKey =`menuItems:outlet:${outletId}`;
        const cachedItems = await getCache(cacheKey);
        if(cachedItems){
            console.log("Redis  CACHE HIT - getAllMenuItemsByOutlet");
            return res.status(200).json(
                {
                    message:"Menu items fetched successfully",
                    menuItems:cachedItems,
                    source:"Redis"
                }
            )
        }
        console.log("Redis CACHE MISS - getAllMenuItemsByOutlet");
        const menuItems = await MenuItem.find({ outlet: outletId });
        if (menuItems.length === 0) {
            return res.status(404).json(
                {
                    message: "Menu items not found" 
                }
            );
        }
        await setCache(cacheKey,menuItems,30);
        res.status(200).json(
            {
                message:"Menu items fetched successfully",
                menuItems,
                source:"mongoDB"
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json(
            { 
                message: "Internal server error" ,
                error:err.message
            }
        );
    }
}

const getMenuItemsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const cacheKey =`menuItems:category:${categoryId}`;
        const cachedItems = await getCache(cacheKey);
        if(cachedItems){
            console.log("Redis  CACHE HIT - getAllMenuItemsByCategory");
            return res.status(200).json(
                {
                    message:"Menu items fetched successfully",
                    menuItems:cachedItems,
                    source:"Redis"
                }
            )
        }
        console.log("Redis CACHE MISS - getAllMenuItemsByCategory");
        const menuItems = await MenuItem.find({ category: categoryId });
        if (menuItems.length === 0) {
            return res.status(404).json(
                { 
                    message: "Menu items not found" 
                }
            );
        }
        await setCache(cacheKey,menuItems,30);
        res.status(200).json(
            {
                message:"Menu items fetched successfully",
                menuItems,
                source:"Redis"
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json(
            { 
                message: "Internal server error",
                error:err.message 
            }
        );
    }
}

const updateMenuItem = async (req, res) => {
    // console.log(req.body);
    try{
        const menuItemId = req.params.menuItemId;
        const menuItem = await MenuItem.findById(menuItemId).populate(
            {
                path:"outlet",
                select:"vendor"
            }
        )
        console.log(menuItem);
        if(!menuItem){
            return res.status(404).json(
                {
                    message:"Menu item not found"
                }
            );
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
        await clearMenuItemUpdateCache(
            {
                menuItemId,
                categoryId:menuItem.category,
                outletId:menuItem.outlet._id,
                vendorId:menuItem.outlet.vendor
            }
        )
        res.status(200).json(
            {
                message:"Menu item updated successfully",
                menuItem
            }
        )
    }
    catch (err) {
        console.error(err);
        res.status(500).json(
            { 
                message: "Internal server error",
                error:err.message 
            }
        );
    }
}

const deleteMenuItem = async (req, res) => {
    try{
        const menuItemId = req.params.menuItemId;

        const menuItem = await MenuItem.findById(menuItemId).populate(
            {
                path:"outlet",
                select:"vendor"
            }
        )

        if(!menuItem){
            return res.status(404).json(
                {
                    message:"Menu item not found"
                }
            );
        }


        //Delete the image from cloudinary
        if(menuItem.image?.public_id){
            await cloudinary.uploader.destroy(menuItem.image.public_id);
        }

        //Delete the menu item from the outlet's menuItems array
        await Outlet.findByIdAndUpdate(
            menuItem.outlet._id,
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
        await clearMenuCategoryCache(
            {
                vendorId:menuItem.outlet.vendor,
                categoryId:menuItem.category,
                outletId:menuItem.outlet._id

            }
        )
        await deleteCache(`menuItem:${menuItemId}`)
        await MenuItem.findByIdAndDelete(menuItemId);
        res.status(200).json(
            {
                message:"Menu item deleted successfully",
                menuItem
            }
        )
    }
    catch (err) {
        console.error(err);
        res.status(500).json(
            { 
                message: "Internal server error",error:err.message 
            }
        );
    }
}

const getAllMenuItemsByVendor = async (req, res) => {
    try{
        const vendorId = req.params.vendorId;
        const cacheKey =`menuItems:vendor:${vendorId}`;
        const cachedItems = await getCache(cacheKey);
        if(cachedItems){
            console.log("Redis  CACHE HIT - getAllMenuItemsByVendor");
            return res.status(200).json(
                {
                    message:"Menu items fetched successfully",
                    menuItems:cachedItems,
                    source:"Redis"
                }
            )
        }
        console.log("Redis CACHE MISS - getAllMenuItemsByVendor");
        const vendor = await Vendor.findById(vendorId);
        if(!vendor){
            return res.status(404).json(
                {
                    message:"Vendor not found"
                }
            );
        }
        const outlets = await Outlet.find({vendor:vendorId});
        const outletIds = outlets.map(outlet=>outlet._id);
        const menuItems = await MenuItem.find({outlet:{$in:outletIds}}).populate('outlet','name city area').populate('category','name');
        await setCache(cacheKey,menuItems,30);
        res.status(200).json(
            {
                message:"Menu items fetched successfully",
                menuItems,
                source:"mongoDB"
            }
        );
    }
    catch (err) {
        console.error(err);
        res.status(500).json(
            { 
                message: "Internal server error",
                error:err.message 
            }
        );
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


const clearMenuCategoryCache=async ({outletId,categoryId,vendorId})=>{
    await deleteCache(
        "menuItems:all",
        `menuItems:outlet:${outletId}`,
        `outlet:${outletId}`,
        `menuItems:category:${categoryId}`,
        `menuItems:vendor:${vendorId}`,
        "menuCategories:all",
        "outlets:all",
        `menuCategory:${categoryId}`,
        `menuCategories:outlet:${outletId}`,
        `menuCategories:vendor:${vendorId}`,
        `outlets:vendor:${vendorId}`
    );
}
const clearMenuItemUpdateCache = async ({menuItemId,categoryId,outletId,vendorId})=>{
    await deleteCache(
        "menuItems:all",
        `menuItems:outlet:${outletId}`,
        `menuItems:category:${categoryId}`,
        `menuItems:vendor:${vendorId}`,
        `menuItem:${menuItemId}`
    )
}

