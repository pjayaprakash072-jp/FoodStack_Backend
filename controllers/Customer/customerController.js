const Customer = require('../../models/Customer/Customer')
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../../utils/email');
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
        const customer = new Customer(
            {
                name,
                email,
                password:hashedPassword,
                phone,
                profileImg,
                authProvider:"local"
            }
        )
        await customer.save();
        try{
            await sendWelcomeEmail(email,name);
        }catch(err){
            console.log("Email send failed",err)
        }
    res.status(201).json(
        {
            message:"Customer Created Successfull!",customer
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
            return req.status(400).json(
                {
                    message: "Customer is not found"
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

module.exports = {
    createCustomer,
    loginCustomer
}