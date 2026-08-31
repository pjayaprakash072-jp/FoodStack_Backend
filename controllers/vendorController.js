const Vendor = require('../models/Vendor')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Outlet = require('../models/Outlet');
const MenuCategory = require('../models/MenuCategory');
const MenuItem = require('../models/MenuItem');
const cloudinary = require('../config/cloudinary');
const {sendWelcomeEmail, sendForgotPasswordLink}  =  require('../utils/email')
const crypto = require('crypto')
const {OAuth2Client } = require('google-auth-library')
const { redisClient } = require("../config/redis")

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
)

const googleLogin = async(req,res)=>{
    try{
        const{credential} = req.body;
        if(!credential){
            return res.status(400).json(
                {
                    message:"Google Credential is required"
                }
            )
        }
        // verify google credential
        const ticket = await googleClient.verifyIdToken(
            {
                idToken:credential,
                audience:process.env.GOOGLE_CLIENT_ID
            }
        )

        const payload = ticket.getPayload();

        const {
            sub:googleId,
            email,
            name,
            
            email_verified
        }=payload

        if(!email || !email_verified){
            return res.status(400).json(
                {
                    message:"Google email is not verified"
                }
            )
        }

        // find vendor by emial

        let vendor = await Vendor.findOne(
            {
                email:email.toLowerCase()
            }
        )

        if(!vendor){
            vendor = new Vendor(
                {
                    name,
                    email:email.toLowerCase(),
                    googleId,
                    authProvider:"google",
                    
                }
            )
            await vendor.save();
        }else{
            if(!vendor.googleId){
                vendor.googleId = googleId;
            }
            vendor.authProvider = "google";
            await vendor.save();
        }
        // create jwt for frontend inclueding sessionId to prevent multiple tabs.

        const sessionId = crypto.randomUUID();
        await redisClient.set(
            `vendor:session:${vendor._id}`,sessionId, { EX:1800}
        )
        const token = jwt.sign(
            {
                id:vendor._id,
                sessionId:sessionId
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7d"
            }
        )

        return res.status(200).json(
            {
                message:"Google login successful",
                token,
                vendor
            }
        )
    }catch(err){
        console.log("Google login errror",err);
        return res.status(500).json(
            {
                message:"Internal server error"
            }
        )
    }
}
const createVendor = async (req, res) => {
    try {
        const{
            name,
            email,
            password,
            phone,
            businessName
        } = req.body;
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({ message: "Vendor with this email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const profileImg = req.file
        ? {
            url:req.file.path,
            public_id:req.file.filename
        }:{
            url:"",
            public_id:""
        }
        const vendor = new Vendor({
            name,
            email,
            password: hashedPassword,
            phone,
            businessName,
            profileImg,
            authProvider: "local"
        });

        await vendor.save();
        try {
            await sendWelcomeEmail(email,name);
        } catch (error) {
            console.error("Email send failed" , error)
        }

        res.status(201).json({ message: "Vendor created successfully", vendor });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }

}

const loginVendor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        const isMatch = await bcrypt.compare(password, vendor.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const sessionId = crypto.randomUUID();
        await redisClient.set(
            `vendor:session:${vendor._id}`,sessionId, { EX:1800}
        )
        const token = jwt.sign({ id: vendor._id,sessionId:sessionId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: "Vendor logged in successfully", token, vendor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find();
        res.status(200).json({ message: "Vendors retrieved successfully", vendors });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getVendorById = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        res.status(200).json({ message: "Vendor retrieved successfully", vendor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const updateVendor = async (req, res) => {
    try {
        const vendorId = req.params.id;
        // console.log(vendorId);
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        // if new image is uploaded, delete the old image from cloudinary
        if(req.file){
            if(vendor.profileImg?.public_id){
                await cloudinary.uploader.destroy(vendor.profileImg.public_id);
            }
            //save new cloudinary image details.
            vendor.profileImg = {
                public_id: req.file.filename,
                url: req.file.path
            }
        }
        // update otehr values
        const {password, ...otherFields} = req.body;
        Object.assign(vendor,otherFields);
        if(password){
            const hashedPassword = await bcrypt.hash(password, 10);
            vendor.password = hashedPassword;
        }
        await vendor.save();
        // remove password from response
        const vendorResponse = vendor.toObject();
        delete vendorResponse.password;
        res.status(200).json({ message: "Vendor updated successfully", vendor:vendorResponse });
    } catch (error) {
        // console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const deleteVendor = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        const outlets = await Outlet.find({vendor:vendorId});
        for(const outlet of outlets){
            const categories = await MenuCategory.find({outlet:outlet._id});
            for(const category of categories){
                const menuItems = await MenuItem.find({category:category._id});
                for(const item of menuItems){
                    if(item.image?.public_id){
                        await cloudinary.uploader.destroy(item.image.public_id);
                    }
                }
                await MenuItem.deleteMany({category:category._id});
                if(category.image?.public_id){
                    await cloudinary.uploader.destroy(category.image.public_id);
                }
                await MenuCategory.deleteMany({outlet:outlet._id});
            }
            if(outlet.image?.public_id){
                await cloudinary.uploader.destroy(outlet.image.public_id);
            }
        }
        await Outlet.deleteMany({vendor:vendorId});
        if(vendor.profileImg?.public_id){
            await cloudinary.uploader.destroy(vendor.profileImg.public_id);
        }
        await Vendor.findByIdAndDelete(vendorId);
        res.status(200).json({ message: "Vendor deleted successfully", vendor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const forgotPassword = async(req,res)=>{
    try {
        const {email} = req.body;
        const vendor = await Vendor.findOne({email})
        if(!vendor){
            return res.status(400).json(
                {
                    message:"Vendor not found,Please create Account"
                }
            )
        }

        // generate random token
        const resetToken = crypto.randomBytes(32).toString("hex");
        // console.log("original token" , resetToken)
        // hashing token before soting in db

        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

        vendor.passwordResetToken = hashedToken;

        vendor.passwordResetTokenExpires =   Date.now()+10*60*1000;


        await vendor.save({validateBeforeSave:false})

        const resetURL =`${process.env.FRONTEND_URL}/reset-password/${resetToken}`

        sendForgotPasswordLink(vendor.email,vendor.name,resetURL);
        return res.status(200).json(
            {
                message:"Password reset link is sent!"
            }
        )
    } catch (error) {
        console.error(error)
        return res.status(500).json(
            {
                message:"Internal server error"
            }
        )
    }
}


const resetPassword = async (req,res)=>{
    try {
        const {token} = req.params;
        const {password} = req.body;
        if(!password){
            return res.status(400).json(
                {
                    message:"Password is required!"
                }
            )
        }

        // hashed token 
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

        // find vendor by using token + expire

        const vendor = await Vendor.findOne({
            passwordResetToken :hashedToken,
            passwordResetTokenExpires:{
                $gt:Date.now()
            }
        })

        if(!vendor){
            return res.status(400).json(
                {
                    message:"Invalid or expired reset Link"
                }
            )
        }

        const hashPassword = await bcrypt.hash(password,10);

        vendor.password = hashPassword;


        // remove resetToken

        vendor.passwordResetToken = null;

        vendor.passwordResetTokenExpires = null;


        await vendor.save();

        res.status(200).json(
            {
                message:"password reset successfully!"
            }
        )
    } catch (error) {
        console.error(error);
        return res.status(500).json(
            {
                message:"Internal server Errro."
            }
        )
    }
}

module.exports = {
    createVendor,
    getAllVendors,
    getVendorById,
    updateVendor,
    deleteVendor,
    loginVendor,
    forgotPassword,
    resetPassword,
    googleLogin
};

