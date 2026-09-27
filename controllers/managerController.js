const Manager = require('../models/Manager');
const { setCache } = require('../utils/cache');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const loginManager = async(req,res)=>{
    try {
        const {phone,password} = req.body;
        const manager = await Manager.findOne({phone}).populate("outlet");
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
        if(!manager.outlet){
            return res.status(400).json(
                {
                    message:"outlet is not assigned for this manager!"
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
                outletId:manager.outlet._id,
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
                manager
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
    loginManager
}