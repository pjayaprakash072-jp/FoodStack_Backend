const MenuCategory = require('../models/MenuCategory');
const Outlet = require('../models/Outlet');
const MenuItem = require('../models/MenuItem');


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
            return res.status(404).json({message:"Outlet not found"});
        }
        const image = req.file 
        ?{
            url:req.file.path,
            public_id:req.file.filename
        }:{
            url:"",
            public_id:""
        }
        const menuCategory = new MenuCategory({
            outlet:outletId,
            name,
            description,
            image,
            displayOrder,
            isActive
        });
        await menuCategory.save();
        res.status(201).json({message:"Menu category created successfully",menuCategory});
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}


const getMenuCategoriesByOutlet = async(req,res)=>{
    const outletId = req.params.outletId;
    try{
        const outlet = await Outlet.findById(outletId);
        if(!outlet){
            return res.status(404).json({message:"Outlet not found"});
        }
        const menuCategories = await MenuCategory.find({outlet:outletId}).populate('outlet','name city area');
        res.status(200).json({message:"Menu categories retrieved successfully",menuCategories});
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}


const getAllMenuCategories = async(req,res)=>{
    try{
        const menuCategories = await MenuCategory.find().populate('outlet','name city area');
        res.status(200).json({message:"Menu categories retrieved successfully",menuCategories});
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}

const getMenuCategoryById = async(req,res)=>{
    const menuCategoryId = req.params.id;
    try{
        const menuCategory = await MenuCategory.findById(menuCategoryId).populate('outlet','name city area');
        if(!menuCategory){
            return res.status(404).json({message:"Menu category not found"});
        }
        res.status(200).json({message:"Menu category retrieved successfully",menuCategory});
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}


const updateMenuCategory = async(req,res)=>{
    const menuCategoryId = req.params.id;
    try{    
        const menuCategory = await MenuCategory.findByIdAndUpdate(menuCategoryId,req.body,{new:true , runValidators:true});
        if(!menuCategory){
            return res.status(404).json({message:"Menu category not found"});
        }
        res.status(200).json({message:"Menu category updated successfully",menuCategory});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal server error",error:error.message});
    }   
}


const deleteMenuCategory = async(req,res)=>{
    const menuCategoryId = req.params.id;
    try{
        const menuCategory = await MenuCategory.findById(menuCategoryId);
        if(!menuCategory){
            return res.status(404).json({message:"Menu category not found"});
        }
        //Delete image from cloudinary
        if(menuCategory.image?.public_id){
            await cloudinary.uploader.destroy(menuCategory.image.public_id);
        }
        //Delete all menu items associated with this category
        const menuItems = await MenuItem.find({menuCategory:menuCategoryId});
        if(menuItems.length>0){
            await MenuItem.deleteMany({menuCategory:menuCategoryId});
        }
        await MenuCategory.findByIdAndDelete(menuCategoryId);
        res.status(200).json({message:"Menu category deleted successfully",menuCategory});
    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}


module.exports = {
    createMenuCategory,
    getMenuCategoriesByOutlet,
    getAllMenuCategories,   
    getMenuCategoryById,
    updateMenuCategory,
    deleteMenuCategory
}