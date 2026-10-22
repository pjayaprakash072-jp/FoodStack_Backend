const User = require('../../models/Auth/UserAuth')
const bcrypt = require('bcryptjs');
const crypto = require('crypto')
const { sendWelcomeEmail , sendVerificationEmail} = require('../../utils/email');
const {setCache} = require('../../utils/cache')
const cloudinary = require('../../config/cloudinary')
const jwt = require("jsonwebtoken")
const sendWhatsAppMessage = require('../../utils/whatsapp')
const createUserAuth = async(req,res)=>{
    try{
        const {
            name,
            email,
            password,
            phone
        } = req.body;
        if(!name || !email|| !password){
            return res.status(400).json(
                {
                    message:"Name, email and password are required!"
                }
            )
        }
        const existingUser = await User.findOne({email:email.toLowerCase()});
        if(existingUser){
            return res.status(400).json(
                {
                    message:"User with this email already Existe."
                }
            )
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpires = new Date(
            Date.now()+ 10*60*1000
        )
        const user = new User(
            {
                name,
                email:email.toLowerCase(),
                password:hashedPassword,
                phone,
                authProvider:"local",
                emailVerificationToken:verificationToken,
                emailVerificationExpires:verificationTokenExpires
            }
        )
        await user.save();
        const verificationURL = `${process.env.FRONTEND_URL_CLIENT}/verify-email/${verificationToken}`
        console.log("token",verificationToken);
        console.log("url",verificationURL);
        try{
            await sendVerificationEmail(email,name,verificationURL);
        }catch(err){
            console.log("Email send failed",err)
        }
        //Send Whatsapp message
        try {
            if(phone){
                await sendWhatsAppMessage(phone,name);
                console.log("Whatsapp welcome message sent!")
            }
        } catch (error) {
            console.log("WhatsApp message failed",error.message)
        }
    res.status(201).json(
        {
            message:"user Created Successfull! Please Verify email",
            userAuth:user
        }
    )
    }catch(err){
        console.log("Error",err);
        res.status(500).json(
            {
                message:"Internal server Error, Failed to create User/Customer!" , 
                error:err.message
            }
        )
    }
}

const loginUser = async(req,res)=>{
    try {
        const {email,password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json(
                {
                    message: "User is not found"
                }
            )
        }
        if(!user.isVerified){
            const verificationToken = crypto.randomBytes(32).toString("hex");
            const verificationTokenExpires = new Date(
                Date.now()+10*60*1000
            )
            user.emailVerificationToken = verificationToken;
            user.emailVerificationExpires = verificationTokenExpires;
            user.save();
            const verificationURL = `${process.env.FRONTEND_URL_CLIENT}/verify-email/${verificationToken}`
            try{
                await sendVerificationEmail(email,user.name,verificationURL)
            }catch(err){
                console.log("Email sent Failed")
            }
            return res.status(400).json(
                {
                    message:"Verification link is sent ot your email,Please verify your email before logging in."
                }
            )
        }
        const isMatch = await bcrypt.compare(password || "",user.password);
        if(!isMatch){
            return res.status(401).json(
                {
                    message:"Invalid Email or password"
                }
            )
        }
        const sessionId = crypto.randomUUID();
        await setCache(
            `${user.role}:session:${user._id}`,
            sessionId,
            3600
        )
        const token = jwt.sign(
            {
                id:user._id,
                role:user.role,
                sessionId:sessionId
            },process.env.JWT_SECRET,
            {
                expiresIn:'1h'
            }
        )
        res.status(200).json(
            {
                message:"User logged in successfully!",
                token,
                userAuth:user
            }
        )
    } catch (error) {
        console.log("Error in User LoginP",error);
        res.status(500).json(
            {
                message:"Internal server Error, Failed to Loding User!",
                error:error.message
            }
        )
    }
}

const verifyUserEmail = async(req,res)=>{
    try {
        const {verificationToken} = req.params;
        const user = await User.findOne(
            {
                emailVerificationToken:verificationToken
            }
        )
        if(!user){
            return res.status(400).json(
                {
                    message:"Invalid verification link or token already used."
                }
            )
        }
        if(!user.emailVerificationExpires || user.emailVerificationExpires < new Date()){
            return res.status(400).json(
                {
                    message:"Verification link has expired."
                }
            )
        }
        user.isVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires= null;

        await user.save();
        res.status(200).json(
            {
                message:"Email verified successfully!"
            }
        )

    } catch (error) {
        console.log("Email Verification Error",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to verify User Email!",
                error:error.message
            }
        )
    }
}
module.exports = {
    createUserAuth,
    loginUser,
    verifyUserEmail
}