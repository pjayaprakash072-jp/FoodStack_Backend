const jwt = require('jsonwebtoken');
const Vendor = require('../models/Auth/VendorAuth');
const {getCache} = require('../utils/cache')
const verifyTokenAuth = async(req,res,next)=>{
    const token = req.headers.token;
    try {
        if(!token){
            return res.status(401).json(
                {
                    message:"Access denied. No token provided."
                }
            )
        }
        const decoded = jwt.verify(
            token,process.env.JWT_SECRET
        )
        if(!decoded.id || !decoded.role){
            return res.status(403).json(
                {
                    message:"Invalid Token payload"
                }
            )
        }
        const currentSession = await getCache(
            `${decoded.role}:session:${decoded.id}`
        )
        if(!currentSession){
            return res.status(401).json(
                {
                    message:"Session expired."
                }
            )
        }
        if(currentSession !== decoded.sessionId){
            return res.status(401).json(
                {
                    message:"You have been logged out because your accoutn was logged  in elsewhere!."
                }
            )
        }
        req.role = decoded.role;
        req.authId = decoded.id;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json(
            {
                message:"Internal server error, Token is Invalid! OR session expired!",
                error:error.message
            }
        )
    }
}
module.exports = verifyTokenAuth;