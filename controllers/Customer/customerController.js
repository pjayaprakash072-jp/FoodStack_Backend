const Customer = require('../../models/Customer/Customer')
const bcrypt = require('bcryptjs');
const crypto = require('crypto')
const { sendWelcomeEmail , sendVerificationEmail} = require('../../utils/email');
const { redisClient } = require('../../config/redis');
const jwt = require("jsonwebtoken")

const createCustomer = async(req,res)=>{
    try{
        const {
            name,
            email,
            password,
            phone
        } = req.body;
        const existingCustomer = await Customer.findOne({email:email.toLowerCase()});
        if(existingCustomer){
            return res.status(400).json(
                {
                    message:"Customer with this email already Existe."
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
        const customer = new Customer(
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
        await customer.save();
        const verificationURL = `${process.env.BACKEND_URL}/customer/verify-email/${verificationToken}`
        console.log(verificationURL);
        try{
            await sendVerificationEmail(email,name,verificationURL);
        }catch(err){
            console.log("Email send failed",err)
        }
    res.status(201).json(
        {
            message:"Customer Created Successfull! Please Verify email",customer
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

const loginCustomer = async(req,res)=>{
    try {
        const {email,password} = req.body;
        const customer = await Customer.findOne({email});
        if(!customer){
            return res.status(400).json(
                {
                    message: "Customer is not found"
                }
            )
        }
        if(!customer.isVerified){
            const verificationToken = crypto.randomBytes(32).toString("hex");
            const verificationTokenExpires = new Date(
                Date.now()+10*60*1000
            )
            customer.emailVerificationToken = verificationToken;
            customer.emailVerificationExpires = verificationTokenExpires;
            customer.save();
            const verificationURL = `${process.env.BACKEND_URL}/customer/verify-email/${verificationToken}`
            try{
                await sendVerificationEmail(email,customer.name,verificationURL)
            }catch(err){
                console.log("Email sent Failed")
            }
            return res.status(400).json(
                {
                    message:"Verification link is sent ot your email,Please verify your email before logging in."
                }
            )
        }
        const isMatch = await bcrypt.compare(password,customer.password);
        if(!isMatch){
            return res.status(401).json(
                {
                    message:"Invalid Credentials"
                }
            )
        }
        const sessionId = crypto.randomUUID();
        await redisClient.set(
            `customer:sessionId:${sessionId}`,sessionId,{EX:1800}
        )
        const token = jwt.sign(
            {
                id:customer._id,
                role:"customer",
                sessionId:sessionId
            },process.env.JWT_SECRET,
            {
                expiresIn:'1h'
            }
        )
        res.status(200).json(
            {
                message:"Customer logged in successfully!",token,customer
            }
        )
    } catch (error) {
        console.log("Error in Customer LoginP",error);
        res.status(500).json(
            {
                message:"Internal server Error",error:error.message
            }
        )
    }
}


const verifyCustomerEmail = async(req,res)=>{
    try {
        const {verificationToken} = req.params;
        const customer = await Customer.findOne(
            {
                emailVerificationToken:verificationToken
            }
        )
        if(!customer){
            return res.status(400).json(
                {
                    message:"Invalid verification link."
                }
            )
        }
        if(!customer.emailVerificationExpires || customer.emailVerificationExpires < new Date()){
            return res.status(400).json(
                {
                    message:"Verification link has expired."
                }
            )
        }
        customer.isVerified = true;
        customer.emailVerificationToken = null;
        customer.emailVerificationExpires= null;

        await customer.save();
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
    createCustomer,
    verifyCustomerEmail,
    loginCustomer
}