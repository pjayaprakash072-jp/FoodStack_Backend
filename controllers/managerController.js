const Manager = require('../models/Manager');
const { crateManagerAuth } = require('../service/managerService');
const {
    getOutletById_s,
    updateOutlet_s,
    getMenuCategoriesByOutlet_s,
    createMenuCategory_s,
    getMenuCategoryById_s,
    updateMenuCategory_s,
    deleteMenuCategory_s,
    getMenuitemsByOutlet_s,
    getMenuItemsByCategory_s,
    getMenuItemById_s,
    createMenuItem_s,
    updateMenuItem_s,
    deleteMenuItem_s,
    getOrdersByOutlet_s,
    updateOrder_s
} = require('../service/outletServices')

const createManager = async(req,res)=>{
    try {
        const {
            authId,
            name,
            email,
            phone,
            vendor,
            outlet
        } = req.body;
        const manager = new Manager(
            {
                authId,
                name,
                email,
                phone,
                vendor,
                outlet
            }
        )
        await manager.save();
        res.status(201).json(
            {
                message:"manager Created successfully",
                crateManagerAuth
            }
        )
    } catch (error) {
        console.log("Error, Failed to create the manager",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to create manager!",
                error:error.message
            }
        )
    }
}
const getManager = async(req,res)=>{
    try {
        const {phone} = req.query;
        let manager;
        if(phone){
            manager =await Manager.findOne({phone});
        }else{
            const managerId = req.managerId;
            manager = await Manager.findById(managerId);

        }
        if(!manager){
            return res.status(400).json(
                {
                    message:"Manager not found, Failet to retrieve manager!"
                }
            )
        }
        if(!manager.outlet){
            return res.status(400).json(
                {
                    message:"outlet is not assigned for this manager!"
                }
            )
        }
        const outlet = await getOutletById_s(manager.outlet);
        const managerWithOutlet = {...manager,outlet:outlet.outlet};
        res.status(200).json(
            {
                message:"Manager record retrieved successfully!",
                manager:managerWithOutlet
            }
        )
    } catch (error) {
        console.log("Error, while retrieving manager !", error)
        res.status(500).json(
            {
                message:"Internal server Error, Failed to retrieve manager!",
                error:error.message
            }
        )
    }
}
const updateOutlet = async (req,res)=>{
    try {
        const token = req.headers.token;
        const id = req.outletId;
        let payload = req.body;
        if(req.file){
            const image_m = {
                url:req.file.path,
                public_id:req.file.filename
            }
            payload = {...payload,image_m};
        }
        const result = await updateOutlet_s(payload,id,token);
        res.status(200).json(
            {
                message:result.message,
                oulet:result.outlet
            }
        )
    } catch (error) {
        console.log("Error, Failed to update outlet(manager)",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to update outlet(manager)",
                error:error.message
            }
        )
    }
}
const getMenuCategoriesByOutlet = async(req,res)=>{
    try {
        const token = req.headers.token;
        const result = await getMenuCategoriesByOutlet_s(req.outletId,token);
        res.status(200).json(
            {
                message:result.message,
                menuCategories:result.menuCategories
            }
        )
        
    } catch (error) {
        console.log("Error, Failed to get categories by outlet(manager)",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to get categories by outlet(manager)",
                error:error.message
            }
        )
        
    }
}
const updateManager = async (req,res)=>{
    try {
        const outletId = req.query.outletId;
        const {remove,...otherFields} = req.body;
        const manager = await findOnd({outletId});
        if(remove){
            manager.outlet = null;
        }
        Object.assign(manager,otherFields);
        await manager.save();
        res.status(200).json(
            {
                message:"Manager update successfull!",
                manager
            }
        )
    } catch (error) {
        console.log("Error, Failed to update the manager!",error);
        res.status(500).json(
            {
                message:"Internal server Error, Failed to update manager",
                error:error.message
            }
        )
    }
}
const createMenuCategory = async(req,res)=>{
    try {
        const token = req.headers.token;
        const outletId = req.outletId;
        let payload = req.body;
        if(req.file){
            const image_m = {
                url:req.file.path,
                public_id:req.file.filename
            }
            payload = {...payload,image_m};
        }
        const result = await createMenuCategory_s(payload,outletId,token);
        res.status(200).json(
            {
                message:result.message,
                menuCategory:result.menuCategory
            }
        )
        
    } catch (error) {
        console.log("Error, Failed to Create Category(manager)",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to Create Category(manager)",
                error:error.message
            }
        )
        
    }
}
const getMenuCategoryById = async(req,res)=>{
    try {
        const token = req.headers.token;
        const result = await getMenuCategoryById_s(req.params.id,token);
        res.status(200).json(
            {
                message:result.message,
                menuCategory:result.menuCategory
            }
        )
        
    } catch (error) {
        console.log("Error, Failed to get category by id(manager)",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to get category by id(manager)",
                error:error.message
            }
        )
        
    }
}
const updateMenuCategory = async(req,res)=>{
    try {
        const token = req.headers.token;
        let payload = req.body;
        if(req.file){
            const image_m = {
                url:req.file.path,
                public_id:req.file.filename
            }
            payload = {...payload,image_m};
        }
        const id = req.params.id;
        const result = await updateMenuCategory_s(payload,id,token);
        res.status(200).json(
            {
                message:result.message,
                menuCategory:result.menuCategory
            }
        )
        
    } catch (error) {
        console.log("Error, Failed to Update category(manager)",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to Update category(manager)",
                error:error.message
            }
        )
        
    }
}
const deleteMenuCategory = async(req,res)=>{
    try {
        const token = req.headers.token;
        const id = req.params.id;
        const result = await deleteMenuCategory_s(id,token);
        res.status(200).json(
            {
                message:result.message,
                menuCategory:result.menuCategory
            }
        )
        
    } catch (error) {
        console.log("Error, Failed to delete category(manager)",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to delete category(manager)",
                error:error.message
            }
        )
        
    }
}
const getMenuitemsByOutlet = async(req,res)=>{
    try {
        const token = req.headers.token;
        const result = await getMenuitemsByOutlet_s(req.outletId,token);
        res.status(200).json(
            {
                message:result.message,
                menuItems:result.menuItems
            }
        )
        
    } catch (error) {
        console.log("Error, Failed to get Items by Outlet(manager)",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to get Items by Outlet(manager)",
                error:error.message
            }
        )
        
    }
}
const getMenuItemsByCategory = async(req,res)=>{
    try {
        const token = req.headers.token;
        const id = req.params.categoryId;
        const result = await getMenuItemsByCategory_s(id,token);
        res.status(200).json(
            {
                message:result.message,
                menuItems:result.menuItems
            }
        )
        
    } catch (error) {
        console.log("Error, Failed to get Items by category(manager)",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to get Items by category(manager)",
                error:error.message
            }
        )
        
    }
}
const getMenuItemById = async(req,res)=>{
    try {
        const token = req.headers.token;
        const id = req.params.menuItemId;
        const result = await getMenuItemById_s(id,token);
        res.status(200).json(
            {
                message:result.message,
                menuItem:result.menuItem
            }
        )
        
    } catch (error) {
        console.log("Error, Failed to get item by id(manager)",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to get item by id(manager)",
                error:error.message
            }
        )
        
    }
}
const createMenuItem = async(req,res)=>{
    try {
        const token = req.headers.token;
        const id = req.params.categoryId;
        let payload = req.body;
        if(req.file){
            const image_m = {
                url:req.file.path,
                public_id:req.file.filename
            }
            payload = {...payload,image_m};
        }
        const result = await createMenuItem_s(payload,id,token);
        res.status(200).json(
            {
                message:result.message,
                menuItem:result.menuItem
            }
        )
        
    } catch (error) {
        console.log("Error, Failed to Create Item(manager)",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to Create Item(manager)",
                error:error.message
            }
        )
        
    }
}
const updateMenuItem = async(req,res)=>{
    try {
        const token = req.headers.token;
        const id = req.params.menuItemId;
        let payload = req.body;
        if(req.file){
            const image_m = {
                url:req.file.path,
                public_id:req.file.filename
            }
            payload = {...payload,image_m};
        }
        const result = await updateMenuItem_s(payload,id,token);
        res.status(200).json(
            {
                message:result.message,
                menuItem:result.menuItem
            }
        )
        
    } catch (error) {
        console.log("Error, Failed to update Item(manager)",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to update Item(manager)",
                error:error.message
            }
        )
        
    }
}
const deleteMenuItem = async(req,res)=>{
    try {
        const token = req.headers.token;
        const id = req.params.menuItemId;
        const result = await deleteMenuItem_s(id,token);
        res.status(200).json(
            {
                message:result.message,
                menuItem:result.menuItem
            }
        )
        
    } catch (error) {
        console.log("Error, Failed to delete Item(manager)",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to delete Item(manager)",
                error:error.message
            }
        )
        
    }
}
const getOrdersByOutlet = async(req,res)=>{
    try {
        console.log("hitting controller")
        const token = req.headers.token;
        const id = req.outletId;
        const result = await getOrdersByOutlet_s(id,token);
        res.status(200).json(
            {
                message:result.message,
                orders:result.orders
            }
        )
        
    } catch (error) {
        console.log("Error, Failed to getOrdersByOutlet(manager)",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to getOrdersByOutlet(manager)",
                error:error.message
            }
        )
        
    }
}

const updateOrder = async(req,res)=>{
    try {
        const token = req.headers.token;
        const id = req.params.orderId;
        let payload = req.body;
        if(req.file){
            const image_m = {
                url:req.file.path,
                public_id:req.file.filename
            }
            payload = {...payload,image_m};
        }
        const result = await updateOrder_s(payload,id,token);
        res.status(200).json(
            {
                message:result.message,
                order:result.order
            }
        )
        
    } catch (error) {
        console.log("Error, Failed to update Order Status(manager)",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to update Order Status(manager)",
                error:error.message
            }
        )
        
    }
}
module.exports = {
    createManager,
    getManager,
    updateManager,
    updateOutlet,
    getMenuCategoriesByOutlet,
    createMenuCategory,
    getMenuCategoryById,
    updateMenuCategory,
    deleteMenuCategory,
    getMenuitemsByOutlet,
    getMenuItemsByCategory,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getOrdersByOutlet,
    updateOrder
}