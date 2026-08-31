const MenuCategory = require('../models/MenuCategory');
const Outlet = require('../models/Outlet');
const MenuItem = require('../models/MenuItem');
const cloudinary = require('../config/cloudinary');
const {getCache,setCache,deleteCache} = require("../utils/cache")

const createMenuCategory = async(req,res)=>{
    const outletId = req.params.outletId;
    try{
        const{
            name,
            description,
            displayOrder,
            isActive,
        } = req.body;

        const outlet = await Outlet.findById(outletId);
        if(!outlet){
            return res.status(404).json(
                {
                    message:"Outlet not found"
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
        const menuCategory = new MenuCategory(
            {
            outlet:outletId,
            name,
            description,
            image,
            displayOrder,
            isActive
        }
    );
        outlet.menuCategories.push(menuCategory._id);
        await outlet.save();
        await menuCategory.save();
        await deleteCache("menuCategories:all")
        await deleteCache(`menuCategories:vendor:${outlet.vendor}`)
        await deleteCache(`menuCategories:outlet:${outletId}`)
        await deleteCache("outlets:all")
        await deleteCache(`outlet:${outletId}`)
        res.status(201).json(
            {
                message:"Menu category created successfully",
                menuCategory
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            {
                message:"Internal server error",error:error.message
            }
        );
    }
}


const getMenuCategoriesByOutlet = async(req,res)=>{
    try{
        const outletId = req.params.outletId;
        const cacheKey = `menuCategories:outlet:${outletId}`;
        const cachedCategories =await getCache(cacheKey);
        if(cachedCategories){
            console.log("Redis CACHE HIT - getAllMenuCategories");
            return res.status(200).json(
                {
                    message:"Menu Categories retrieved successfully!",
                    menuCategories:cachedCategories,
                    source:"Redis"
                }
            )
        }
        console.log("Redis CACHE MISS - getAllMenuCategories")
        const outlet = await Outlet.findById(outletId);
        if(!outlet){
            return res.status(404).json(
                {
                    message:"Outlet not found"
                }
            );
        }
        const menuCategories = await MenuCategory.find({outlet:outletId}).populate('outlet','name city area');
        await setCache(
            cacheKey,
            menuCategories,
            30
        )
        res.status(200).json(
            {
                message:"Menu categories retrieved successfully",
                menuCategories
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}


const getAllMenuCategories = async(req,res)=>{
    try{
        const cacheKey = "menuCategories:all";
        const cachedCategories =await getCache(cacheKey);
        if(cachedCategories){
            console.log("Redis CACHE HIT - getAllMenuCategories");
            return res.status(200).json(
                {
                    message:"Menu Categories retrieved successfully!",
                    menuCategories:cachedCategories,
                    source:"Redis"
                }
            )
        }
        console.log("Redis CACHE MISS - getAllMenuCategories")
        const menuCategories = await MenuCategory.find().populate('outlet','name city area');
        await setCache(
            cacheKey,
            menuCategories,
            30
        )
        res.status(200).json(
            {
                message:"Menu categories retrieved successfully",
                menuCategories,
                source:"mongoDB"
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            {
                message:"Internal server error",
                error:error.message
            }
        );
    }
}

const getMenuCategoryById = async(req,res)=>{
    try{
        const menuCategoryId = req.params.id;
        const cacheKey =`menuCategory:${menuCategoryId}`;
        const cachedCategory = await getCache(cacheKey);
        if(cachedCategory){
            console.log("Redis CACHE HIT - getCategorById");
            return res.status(200).json(
                {
                    message:"Menu category retrieved successfully",
                    menuCategory:cachedCategory,
                    source:"Redis"
                }
            )
        }
        console.log("Redis CACHE MISS - getCategoryById");
        const menuCategory = await MenuCategory.findById(menuCategoryId).populate('outlet','name city area');
        if(!menuCategory){
            return res.status(404).json(
                {
                    message:"Menu category not found"
                }
            );
        }
        await setCache(cacheKey,menuCategory,30);
        res.status(200).json(
            {
                message:"Menu category retrieved successfully",
                menuCategory
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            {
                message:"Internal server error",
                error:error.message
            }
        );
    }
}



const updateMenuCategory = async(req,res)=>{
    try{    
        const menuCategoryId = req.params.id;
        const menuCategory = await MenuCategory.findById(menuCategoryId).populate(
            {
                path: "outlet",
                select: "vendor"
            }
        );
        if(!menuCategory){
            return res.status(404).json(
                {
                    message:"Menu category not found"
                }
            );
        }
        //getting vendor it to delete the redis key
        const vendorId = menuCategory.outlet.vendor;
        // if new image is uploaded, delete the old image from cloudinary
        if(req.file){
            if(menuCategory.image?.public_id){
                await cloudinary.uploader.destroy(menuCategory.image.public_id);
            }
            //save new cloudinary image details.
            menuCategory.image = {
                public_id: req.file.filename,
                url: req.file.path
            }
        }
        // update otehr values.
        Object.assign(menuCategory,req.body);
        await menuCategory.save();
        await deleteCache("menuCategories:all")
        await deleteCache(`menuCategories:outlet:${menuCategory.outlet}`)
        await deleteCache(`menuCategory:${menuCategory._id}`)
        await deleteCache(`menuCategories:vendor:${vendorId}`)
        res.status(200).json(
            {
                message:"Menu category updated successfully",
                menuCategory
            }
        );
    }
    catch (error) {
        console.error(error);
        res.status(500).json(
            {
                message:"Internal server error",
                error:error.message
            }
        );
    }   
}


const deleteMenuCategory = async(req,res)=>{
    const menuCategoryId = req.params.id;
    try{
        const menuCategory = await MenuCategory.findById(menuCategoryId).populate(
            {
                path:"outlet",
                select:"vendor"
            }
        )


        if(!menuCategory){
            return res.status(404).json(
                {
                    message:"Menu category not found"
                }
            );
        }
        const vendorId = menuCategory.outlet.vendor;
        await deleteCache("menuCategories:all")
        await deleteCache(`menuCategories:outlet:${menuCategory.outlet}`)
        await deleteCache(`menuCategory:${menuCategory._id}`)
        await deleteCache(`menuCategories:vendor:${vendorId}`)

        //Delete image from cloudinary
        if(menuCategory.image?.public_id){
            await cloudinary.uploader.destroy(menuCategory.image.public_id);
        }


        //Delete all menu items associated with this category
        const menuItems = await MenuItem.find({category:menuCategoryId});
        for(const item of menuItems){
            if(item.image?.public_id){
                await cloudinary.uploader.destroy(item.image.public_id);
            }
            await Outlet.findByIdAndUpdate(
                item.outlet,
                {
                    $pull:{menuItems:item._id}
                }
            )
        }
        await MenuItem.deleteMany({category:menuCategoryId});

        //Delete the menu category from the outlet's menuCategories array
        await Outlet.findByIdAndUpdate(
            menuCategory.outlet,
            {
                $pull:{menuCategories:menuCategoryId}
            }
        )
        await MenuCategory.findByIdAndDelete(menuCategoryId);
        res.status(200).json(
            {
                message:"Menu category deleted successfully",
                menuCategory
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            {
                message:"Internal server error",
                error:error.message
            }
        );
    }
}



const getMenuCategoriesByVendor = async(req,res)=>{
    
    try{
        const vendorId = req.params.vendorId;
        const cacheKey = `menuCategories:vendor:${vendorId}`;
        const cachedCategories = await getCache(cacheKey);
        if(cachedCategories){
            console.log("Redis CACHE HIT - getCategoriedByVendor");
            return res.status(200).json(
                {
                    message:"Menu categories fetched successfully",
                    menuCategories:cachedCategories,
                    source:"Redis"
                }
            )
        }
        console.log("Redis CACHE MISS - getCategoriesByVendor");
        const outlets = await Outlet.find({vendor:vendorId});
        const outletIds = outlets.map(outlet=>outlet._id);
        const menuCategories = await MenuCategory.find({outlet:{$in:outletIds}}).populate('outlet',"name city area");
        await setCache(cacheKey,menuCategories,30);
        res.status(200).json(
            {
                message:"Menu categories fetched successfully",
                menuCategories
            }
        );
    }catch(error){
        console.error(error);
        res.status(500).json(
            {
                message:"Internal server error",
                error:error.message
            }
        );
    }
}
module.exports = {
    createMenuCategory,
    getMenuCategoriesByOutlet,
    getAllMenuCategories,   
    getMenuCategoryById,
    updateMenuCategory,
    deleteMenuCategory,
    getMenuCategoriesByVendor
}