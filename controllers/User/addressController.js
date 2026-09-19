const Address = require("../../models/User/Address")

const createAddress = async (req,res)=>{
    try {
        if(rea.role != "user"){
            return res.status(400).json(
                {
                    meassage:"Only users can create the Address."
                }
            )
        }
        const {
            label,
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            latitude,
            logitude,
            isDefault
        } = req.body;
        const address = new Address(
            {
                label,
                fullName,
                phone,
                addressLine1,
                addressLine2,
                city,
                state,
                pincode,
                latitude,
                logitude,
                isDefault,
                user:req.userId
            }
        )
        await address.save();
        res.status(201).json(
            {
                message:"Address Saved successfully!",
                address
            }
        )
    } catch (error) {
        console.log("Error", error);
        res.status(500).json(
            {
                message:"Internal server Error, Failed to Create Address.",
                error:error.message
            }
        )
    }
}

const getAddresses = async (req,res)=>{
    try {
        const addresses = await Address.find(
            {
                user:req.userId
            }
        ).sort(
            {
                isDefault:-1,
                createdAt:-1
            }
        )
        res.status(200).json(
            {
                message:"Addresses retrieved successfully!",
                addresses
            }
        )
    } catch (error) {
        console.log("Error",error);
        res.status(500).json(
            {
                message:"Internal server Errror, Failed to get Addresses.",
                error: error.message    
            }
        )
    }
}

const getOneAddress = async (req,res)=>{
    try {
        const addressId = req.params.addressId;
        const address = await Address.findOne(
            {
                _id:addressId,
                user:req.userId
            }
        )
        if(!address){
            return res.status(400).json(
                {
                    message:"Requested Address not found."
                }
            )
        }
        res.status(200).json(
            {
                message:"Address retrieved successfully!",
                address
            }
        )
    } catch (error) {
        console.log("Error", error)
        res.status(500).josn(
            {
                message:"Internal server Error, Failed to get an address.",
                error:error.meassage
            }
        )
    }
}
const updateAddress = async(req,res)=>{
    try {
        const addressId = req.params.addressId;
        const {isDefault, ...otherFields} = req.body;
        // address exitsts
        const address = await Address.findOne(
            {
                _id:addressId,
                user:req.userId
            }
        )
        if(!address){
            return res.status(400).json(
                {
                    message:"Address Not found."
                }
            )
        }
        if(isDefault === true){
            await Address.updateMany(
                {
                    user:req.userId,
                    _id:{
                        $ne: addressId
                    }
                },{
                    $set:{
                        isDefault:false
                    }
                }
            )
        }
        Object.assign(address,otherFields);
        if(typeof isDefault === 'boolean'){
            address.isDefault = isDefault
        }
        await address.save();
        res.status(200).json(
            {
                message:"Address Updated successfully!",
                address
            }
        )
    } catch (error) {
        console.log("Error",error);
        res.status(500).json(
            {
                messae:"Internal server error,Failed to Update Address",
                error:error.messae
            }
        )
    }
}
const delteAddress = async (req,res)=>{
    try {
        const addressId = req.params.addressId;
        const address = await Address.findByIdAndDelete(
            {
                _id:addressId,
                user:req.userId
            }
        )
        if(!address){
            return res.status(400).json(
                {
                    message:"Address Not found"
                }
            )
        }
        res.status(200).json(
            {
                message:"Address Deleted successfully."
            }
        )
    } catch (error) {
        console.log("Error",error);
        res.status(500).josn(
            {
                message:"Internal server error, Failed Delete Address",
                error:error.messae
            }
        )
    }
}

module.exports ={
    createAddress,
    getAddresses,
    getOneAddress,
    updateAddress,
    delteAddress
}