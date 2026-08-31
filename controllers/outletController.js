const Outlet = require('../models/Outlet');
const Vendor = require('../models/Vendor');
const MenuCategory = require('../models/MenuCategory');
const MenuItem = require('../models/MenuItem');
const cloudinary = require('../config/cloudinary');
const {getCache , setCache, deleteCache} = require('../utils/cache')

const createOutlet = async (req, res) => {
    try {
        const{
            name,
            description,
            phone,
            address,
            city,
            area,
            cuisine,
            foodType,
            openingTime,
            closingTime
        }
        = req.body;

        const vendor = await Vendor.findById(req.vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        
        const image = req.file 
        ? {
            url:req.file.path,
            public_id:req.file.filename
        }:{
            url:"",
            public_id:""
        }
        const newOutlet = new Outlet({
            name,
            description,
            image,
            phone,  
            address,
            city,
            area,
            cuisine,
            foodType,
            openingTime,
            closingTime,
            vendor: vendor._id
        });
        vendor.outlets.push(newOutlet._id);
        await vendor.save();
        await newOutlet.save();
        await deleteCache("outlets:all",
                `outlets:vendor:${newOutlet.vendor}`
            );
        res.status(201).json({ message: "Outlet created successfully", outlet: newOutlet });    
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}


const getAllOutlets = async (req, res) => {
    try {
        const cachekey = "outlets:all";
        const cachedOutlets = await getCache(cachekey);
        if(cachedOutlets){
            console.log("Redis CACHE HIT - getAllOutlets");
            return res.status(200).json(
                {
                    message:"Outlets retrieved successfully",
                    outlets:cachedOutlets,
                    source:"Redis"
                }
            )
        }
        console.log("Redis CACHE MISS - getAllOutlets")
        const outlets = await Outlet.find().populate('vendor', 'name email phone');
        await setCache(cachekey,outlets,300)
        res.status(200).json(
            {
                message: "Outlets retrieved successfully",
                outlets,
                source:"mongoDB"
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }   
};


const getOutletById = async (req, res) => {
    try {
        const outletId = req.params.id; 
        const cacheKey = `outlet:${outletId}`;
        const cachedOutlet = await getCache(cacheKey);
        if(cachedOutlet){
            console.log("Redis CACHE HIT - getOutletBuId");
            return res.status(200).json(
                {
                    message:"Outlet retrieved Successfully!",
                    outlet:cachedOutlet,
                    source:"redis"
                }
            )
        }
        console.log("Redis CACHE MISS - getOutletById");
        const outlet = await Outlet.findById(outletId).populate('vendor', 'name email phone');
        if (!outlet) {
            return res.status(404).json({ message: "Outlet not found" });
        }
        await setCache(cacheKey,outlet,300);
        res.status(200).json(
            {
                message: "Outlet retrieved successfully",
                outlet,
                source:"mongoDb"
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getOutletsByVendorId = async (req, res) => {
    try {
        const vendorId = req.params.vendorId;
        const cacheKey = `outlets:vendor:${vendorId}`
        const cachedOutlets = await getCache(cacheKey);
        if(cachedOutlets){
            console.log("Redis CACHE HIT - getOutletsByVendor");
            return res.status(200).json(
                {
                    message:"Outlets retrieved Successfully!",
                    outlets:cachedOutlets,
                    source:"redis"
                }
            )
        }
        console.log("Redis CACHE MISS - getOutletsByVendor");

        const outlets = await Outlet.find({ vendor: vendorId }).populate('vendor', 'name email phone');
        await setCache(cacheKey,outlets,300);
        res.status(200).json(
            {
                message: outlets.length>0 ? "Outlets retrieved successfully" : "No Outlets found for this vendor", outlets
            }
        )
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const updateOutlet = async (req, res) => {
    try {
        const outletId = req.params.id;
        const outlet = await Outlet.findById(outletId);
        if (!outlet) {
            return res.status(404).json({ message: "Outlet not found" });
        }   
        // if new image is uploaded, delete the old image from cloudinary
        if(req.file){
            if(outlet.image?.public_id){
                await cloudinary.uploader.destroy(outlet.image.public_id);
            }
            //save new cloudinary image details.
            outlet.image = {
                public_id: req.file.filename,
                url: req.file.path
            }
        }
        // update otehr values
        await deleteCache(`outlet:${outlet._id}`,
            "outlets:all",
            `outlets:vendor:${outlet.vendor}`
        );
        Object.assign(outlet,req.body);
        await outlet.save();
        res.status(200).json({ message: "Outlet updated successfully", outlet });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

const deleteOutlet = async (req, res) => {
    try {
        const outletId = req.params.id;

        const outlet = await Outlet.findById(outletId);

        if (!outlet) {
            return res.status(404).json({
                message: "Outlet not found"
            });
        }

        const vendorId = outlet.vendor;

        // Find categories and menu items BEFORE deleting them
        const menuCategories = await MenuCategory.find({
            outlet: outletId
        });

        const menuItems = await MenuItem.find({
            outlet: outletId
        });

        // Delete outlet image
        if (outlet.image?.public_id) {
            await cloudinary.uploader.destroy(
                outlet.image.public_id
            );
        }

        // Delete category images
        for (const category of menuCategories) {
            if (category.image?.public_id) {
                await cloudinary.uploader.destroy(
                    category.image.public_id
                );
            }
        }

        // Delete menu item images
        for (const item of menuItems) {
            if (item.image?.public_id) {
                await cloudinary.uploader.destroy(
                    item.image.public_id
                );
            }
        }

        // Delete categories
        await MenuCategory.deleteMany({
            outlet: outletId
        });

        // Delete menu items
        await MenuItem.deleteMany({
            outlet: outletId
        });

        // Remove outlet from vendor
        await Vendor.findByIdAndUpdate(
            vendorId,
            {
                $pull: {
                    outlets: outletId
                }
            }
        );

        // Delete outlet
        await Outlet.findByIdAndDelete(outletId);

        // Individual category cache keys
        const categoryCacheKeys = menuCategories.map(
            category => `menuCategory:${category._id}`
        );

        // Individual menu item cache keys
        const menuItemCacheKeys = menuItems.map(
            item => `menuItem:${item._id}`
        );

        // Clear ALL affected Redis caches
        await deleteCache(
            // Outlet caches
            `outlet:${outletId}`,
            "outlets:all",
            `outlets:vendor:${vendorId}`,

            // Category caches
            "menuCategories:all",
            `menuCategories:outlet:${outletId}`,
            `menuCategories:vendor:${vendorId}`,

            // Menu item list caches
            "menuItems:all",
            `menuItems:outlet:${outletId}`,
            `menuItems:vendor:${vendorId}`,

            // Individual caches
            ...categoryCacheKeys,
            ...menuItemCacheKeys
        );

        res.status(200).json({
            message: "Outlet deleted successfully",
            outlet
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};
module.exports = {
    createOutlet,
    getAllOutlets,
    getOutletById,
    getOutletsByVendorId,
    updateOutlet,
    deleteOutlet
}
