const Outlet = require('../models/Outlet');
const Vendor = require('../models/Vendor');
const MenuCategory = require('../models/MenuCategory');
const MenuItem = require('../models/MenuItem');

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
        await newOutlet.save();
        res.status(201).json({ message: "Outlet created successfully", outlet: newOutlet });    
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}


const getAllOutlets = async (req, res) => {
    try {
        const outlets = await Outlet.find().populate('vendor', 'name email phone');
        res.status(200).json({ message: "Outlets retrieved successfully", outlets });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }   
};


const getOutletById = async (req, res) => {
    try {
        const outletId = req.params.id; 
        const outlet = await Outlet.findById(outletId).populate('vendor', 'name email phone');
        if (!outlet) {
            return res.status(404).json({ message: "Outlet not found" });
        }
        res.status(200).json({ message: "Outlet retrieved successfully", outlet });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getOutletsByVendorId = async (req, res) => {
    try {
        const vendorId = req.params.vendorId;
        const outlets = await Outlet.find({ vendor: vendorId }).populate('vendor', 'name email phone');
        if (!outlets || outlets.length === 0) {
            return res.status(404).json({ message: "No outlets found for this vendor" });
        }
        res.status(200).json({ message: "Outlets retrieved successfully", outlets });
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
        const outletid = req.params.id;
        const outlet = await Outlet.findById(outlerid);
        if (!outlet) {
            return res.status(404).json({ message: "Outlet not found" });
        }
        //Delete image from cloudinary
        if (outlet.image?.public_id) {
            await cloudinary.uploader.destroy(outlet.image.public_id);
        }
        const menuCategories = await MenuCategory.find({ outlet: outlerid });
        if (menuCategories.length > 0) {
            await MenuCategory.deleteMany({ outlet: outlerid });
        }
        const menuItems = await MenuItem.find({ outlet: outlerid });
        if (menuItems.length > 0) {
            await MenuItem.deleteMany({ outlet: outlerid });
        }
        await Outlet.findByIdAndDelete(outlerid);
        res.status(200).json({ message: "Outlet deleted successfully", outlet });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }       

}

module.exports = {
    createOutlet,
    getAllOutlets,
    getOutletById,
    getOutletsByVendorId,
    updateOutlet,
    deleteOutlet
}
