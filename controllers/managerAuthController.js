const Manager = require('../models/Auth/ManagerAuth');
const { setCache } = require('../utils/cache');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const createManagerAuth = async(req,res)=>{
    try {
        const {
            name,
            email,
            phone,
            password
        } = req.body;
        if(!email || !password  || !phone){
            return res.status(400).json(
                {
                    message:"Name, email, phone, and password are necessary to create the manager!"
                }
            )
        }
        const existManager = await Manager.findOne({
            $or:[{phone},{email}]
        });
        if(existManager){
            return res.status(400).json(
                {
                    message:"the manager with this email Or phone already exists!"
                }
            )
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const manager = new Manager(
            {
                name,
                email,
                phone,
                password:hashedPassword
            }
        )
        await manager.save();
        res.status(200).json(
            {
                message:"manager Auth created successfully!",
                managerAuth:manager
            }
        )
    } catch (error) {
        console.log("Error,Failed to create managerAuth",error);
        res.status(500).json(
            {
                message:"Intenale server error, Failed to create managerAuth",
                error:error.message
            }
        )
    }
}
const loginManager = async(req,res)=>{
    try {
        const {phone,password} = req.body;
        const manager = await Manager.findOne({phone});
        if(!manager){
            return res.status(400).json(
                {
                    message:"Manager not found, Failet to retrieve manager!"
                }
            )
        }
        const isMatch = await bcrypt.compare(password,manager.password);
        if(!isMatch){
            return res.status(400).json(
                {
                    message:"Invalic Password, Please contact your vendor!"
                }
            )
        }
        const sessionId = crypto.randomUUID();
        await setCache(
            `${manager.role}:session:${manager._id}`,
            sessionId,
            86400
        )
        const token = jwt.sign(
            {
                id:manager._id,
                role:manager.role,
                sessionId
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"1d"
            }
        )
        res.status(200).json(
            {
                message:"Manager Logged in successfully!",
                token,
                managerAuth:manager
            }
        )
    } catch (error) {
        console.log("Error, while manager Login!", error)
        res.status(500).json(
            {
                message:"Internal server Error, Failed to Login manager!",
                error:error.message
            }
        )
    }
}

module.exports = {
    createManagerAuth,
    loginManager
}