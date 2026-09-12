const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');
const {redisClient} = require('../config/redis')

const verifyToken = async (req, res, next) => {

    const token = req.headers.token;
    try {
        // 1. Check token
        if (!token) {
            return res.status(401).json(
                {
                    message: "Access denied. No token provided."
                }
            );
        }
        // 2. Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        // const vendor = await Vendor.findById(decoded.id);
        // if (!vendor) {
        //     return res.status(404).json(
        //         {
        //             message: "Vendor not found." 
        //         }
        //     );
        // }
        // 3. Check role
        if(!decoded.id || !decoded.role){
            return res.status(403).json(
                {
                    message:"Invalid Token payload."
                }
            )
        }
        // 4. Check session in Redis.
        const currentSession = await redisClient.get(
            `${decoded.role}:session:${decoded.id}`
        )
        if(!currentSession){
            return res.status(401).json(
                {
                    message:"Session expired!"
                }
            )
        }
        // 5. Check wether this the current session.
        if(currentSession !== decoded.sessionId){
            return res.status(401).json(
                {
                    message: "You have been logged out because your accoutn was logged  in elsewhere!."
                }
            )
        }
        req.role = decoded.role;
        if(decoded.role ==="vendor"){
            req.vendorId = decoded.id;
        }
        if(decoded.role === "customer"){
            req.customerId = decoded.id;
        }
        next();
    } catch (err) {
        console.error(err);
        return res.status(403).json(
            {
                message: "Token is not valid!" 
            }
        );
    }
};
module.exports = verifyToken;