const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');
const {redisClient} = require('../config/redis')

const verifyToken = async (req, res, next) => {

    const token = req.headers.token;
    try {
        if (!token) {
            return res.status(401).json(
                {
                    message: "Access denied. No token provided."
                }
            );
        }
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        const vendor = await Vendor.findById(decoded.id);
        if (!vendor) {
            return res.status(404).json(
                {
                    message: "Vendor not found." 
                }
            );
        }
        const currentSession = await redisClient.get(
            `vendor:session:${vendor._id}`
        )
        if(!currentSession){
            return res.status(401).json(
                {
                    message:"Session expired!"
                }
            )
        }
        if(currentSession !== decoded.sessionId){
            return res.status(401).json(
                {
                    message: "You have been logged out because your accoutn was logged  in elsewhere!."
                }
            )
        }
        req.vendorId = vendor._id;
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