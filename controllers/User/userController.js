const User = require('../../models/User/User')
const bcrypt = require('bcryptjs');
const crypto = require('crypto')
const { sendWelcomeEmail , sendVerificationEmail} = require('../../utils/email');
const {setCache} = require('../../utils/cache')
const cloudinary = require('../../config/cloudinary')
const jwt = require("jsonwebtoken")

const createUser = async(req,res)=>{
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
        const profileImg = req.file?
        {
            url:req.file.path,
            public_id:req.file.filename
        }:{
            url:"",
            public_id:""
        }
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
                profileImg,
                authProvider:"local",
                emailVerificationToken:verificationToken,
                emailVerificationExpires:verificationTokenExpires
            }
        )
        await user.save();
        const verificationURL = `${process.env.BACKEND_URL}/user/verify-email/${verificationToken}`
        console.log(verificationURL);
        try{
            await sendVerificationEmail(email,name,verificationURL);
        }catch(err){
            console.log("Email send failed",err)
        }
    res.status(201).json(
        {
            message:"user Created Successfull! Please Verify email",user
        }
    )
    }catch(err){
        console.log("Error",err);
        res.status(500).json(
            {
                message:"Internal server Error" , error:err.message
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
            const verificationURL = `${process.env.BACKEND_URL}/user/verify-email/${verificationToken}`
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
                message:"User logged in successfully!",token,user
            }
        )
    } catch (error) {
        console.log("Error in User LoginP",error);
        res.status(500).json(
            {
                message:"Internal server Error",error:error.message
            }
        )
    }
}

const updateUser = async(req,res)=>{
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if(!user){
            return res.status(400).json(
                {
                    message:"user Not found, Failed to find user to update user."
                }
            )
        }
        if(req.file){
            if(user.profileImg?.public_id){
                await cloudinary.uploader.destroy(user.profileImg.public_id)
            }
            user.profileImg = {
                public_id:req.file.filename,
                url:req.file.path
            }
        }
        const {password,...otherFields} = req.body;
        Object.assign(user,otherFields);
        if(password){
            const hashedPassword = await bcrypt.hash(password,10);
            user.password = hashedPassword;
        }
        await user.save();
        const userResponse = user.toObject();
        delete user.password;
        res.status(200).json(
            {
                message:"User updated successfully!",
                user:userResponse
            }
        )
    } catch (error) {
        console.log("Error, while updating user!",error);
        res.status(500).json(
            {
                message:"Internal server Error, Failed to update User!",
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
                    message:"Invalid verification link."
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
                message:"Internal server Error",
                error:error.message
            }
        )
    }
}
module.exports = {
    createUser,
    loginUser,
    updateUser,
    verifyUserEmail
}