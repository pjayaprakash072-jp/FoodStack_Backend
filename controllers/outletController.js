const Outlet = require('../models/Outlet');


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
        
        const image = req.file ? req.file.path : "";
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
            closingTime
        });
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

        const outlet = await Outlet.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true,
                
            runValidators: true});
        if (!outlet) {
            return res.status(404).json({ message: "Outlet not found" });
        }   
        res.status(200).json({ message: "Outlet updated successfully", outlet });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}


const deleteOutlet = async (req, res) => {
    try {
        const outlet = await Outlet.findByIdAndDelete(req.params.id);
        if (!outlet) {
            return res.status(404).json({ message: "Outlet not found" });
        }
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
