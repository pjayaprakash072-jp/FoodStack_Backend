
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const {setCache} = require("../utils/cache")
const Vendor = require("../models/Auth/VendorAuth")
const {sendWelcomeEmail,sendForgotPasswordLink} = require('../utils/email')
const {OAuth2Client } = require('google-auth-library')
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
)
const createVendorAuth = async (req, res) => {
    try {
        const{
            name,
            email,
            password,
            phone,
        } = req.body;
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({ message: "Vendor with this email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const vendor = new Vendor({
            name,
            email,
            phone,
            password: hashedPassword,
            authProvider: "local"
        });

        await vendor.save();
        try {
            await sendWelcomeEmail(email,name);
        } catch (error) {
            console.error("Email send failed" , error)
        }

        res.status(201).json(
            { 
                essage: "Vendor created successfully", 
                vendorAuth:vendor
            }
        );
    }
    catch (error) {
        console.error(error);
        res.status(500).json(
            {
                message: "Internal server error, Failed to create Vendor!", 
                error: error.message 
            }
        );
    }

}

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
        // await redisClient.set(
        //     `vendor:session:${vendor._id}`,sessionId, { EX:1800}
        // )
        const cacheKey = `${vendor.role}:session:${vendor._id}`;
        await setCache(cacheKey,sessionId,1800)
        const token = jwt.sign(
            {
                id:vendor._id,
                role:vendor.role,
                sessionId:sessionId
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7d"
            }
        )

        try{
            sendWelcomeEmail(email,name);
        }catch(err){
            console.log("Failed to send Welcome email" , err);
        }
        return res.status(200).json(
            {
                message:"Google login successful",
                token,
                vendorAuth:vendor
            }
        )
    }catch(err){
        console.log("Google login errror",err);
        return res.status(500).json(
            {
                message:"Internal server error, Failed Google Login!",
                error:eror.message
            }
        )
    }
}
const loginVendor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found, Failed to login!" });
        }
        if(!vendor.password){
            return res.statu(400).json(
                {
                    message:"You don't have password!, please update password through forgot password."
                }
            )
        }
        const isMatch = await bcrypt.compare(password, vendor.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const sessionId = crypto.randomUUID();
        await setCache(
            `${vendor.role}:session:${vendor._id}`,
            sessionId,
            1800
        )
        const token = jwt.sign(
            {
                id: vendor._id,
                role:vendor.role,
                sessionId:sessionId 
            },
            process.env.JWT_SECRET, 
            { 
                expiresIn: '1h'
            }
        );
        res.status(200).json(
            { 
                message: "Vendor logged in successfully", 
                token, 
                vendorAuth:vendor
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(
            { 
                message: "Internal server error, Failed to Login vendor", 
                error: error.message 
            }
        );
    }
};
const updateVendorAuth =  async(req,res)=>{
    console.log(req.body)
    try {
        const authId = req.authId;
        const vendor = await Vendor.findById(authId);
        if(!vendor){
            return res.status(500).json(
                {
                    message:" record not found, Fialed to update vendorAuth"
                }
            )
        }
        const {password, ...otherFields} = req.body;
        Object.assign(vendor,otherFields);
        if(password){
            const hashedPassowrd = await bcrypt.hash(password,10);
            vendor.password = hashedPassowrd;
        }
        await vendor.save();
        res.status(200).json(
            {
                message:"vendorAuth updated successfully!",
                vendorAuth:vendor
            }
        )
    } catch (error) {
        console.log(error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to update vendorAuth.",
                error:error.message
            }
        )
    }
}

const forgotPassword = async(req,res)=>{
    try {
        const {email} = req.body;
        const vendor = await Vendor.findOne({email})
        if(!vendor){
            return res.status(400).json(
                {
                    message:"Vendor not found, Please create Account!"
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

        const resetURL =`${process.env.FRONTEND_URL_VENDOR}/reset-password/${resetToken}`

        await sendForgotPasswordLink(vendor.email,vendor.name,resetURL);
        return res.status(200).json(
            {
                message:"Password reset link is sent!"
            }
        )
    } catch (error) {
        console.error(error)
        return res.status(500).json(
            {
                message:"Internal server error, Failed to sent the Forgot password link!",
                error:error.message
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
                message:"Internal server error, Failed to resetPassword!",
                error:error.message
            }
        )
    }
}

const deleteVendorAuth = async (req,res)=>{
    try {
        const authId = req.authId;
        const vendor = await Vendor.findById(authId);
        if(!vendor){
            return res.status(400).json(
                {
                    message:"Failed to delete the VendorAuth"
                }
            )
        }
        await Vendor.findByIdAndDelete(authId);
        res.status(200).json(
            {
                message:"vendorAuth deleted Successfully"
            }
        )
    } catch (error) {
        console.log(error);
        res.status(500).json(
            {
                message:"Internal server error,Failed to delete vendorAuth",
                error:error.message
            }
        )
    }
}
module.exports ={
    createVendorAuth,
    loginVendor,
    googleLogin,
    updateVendorAuth,
    deleteVendorAuth,
    forgotPassword,
    resetPassword
}