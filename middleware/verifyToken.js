const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');
const User = require("../models/User/User")
const {getCache} = require('../utils/cache')

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
        const decoded = jwt.verify( // if decoded is done -> goes to next step or throws errro and catch will handle error.
            token,
            process.env.JWT_SECRET
        );
        // 3. Check role
        if(!decoded.id || !decoded.role){
            return res.status(403).json(
                {
                    message:"Invalid Token payload."
                }
            )
        }
        // 4. Check session in Redis.
        
        const currentSession = await getCache(
            `${decoded.role}:session:${decoded.id}`
        )


        // console.log("JWT session:", decoded.sessionId);
        // console.log("Redis session:", currentSession);
        // console.log("User ID:", decoded.id);
        // console.log("Role:", decoded.role);


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
            req.vendor = await Vendor.findById(decoded.id)
        }
        if(decoded.role === "user"){
            req.userId = decoded.id;
            req.user = await User.findById(decoded.id)
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(403).json(
            {
                message: "Internal server error, Token is InValid! OR session id is not verified.",
                error: error.message
            }
        );
    }
};
module.exports = verifyToken;