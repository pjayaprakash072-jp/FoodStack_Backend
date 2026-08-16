const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {

    const token = req.header.token;
    try {
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const vendor = await Vendor.findById(decoded.id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found." });
        }
        req.vendorId = vendor._id;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Token is not valid!" });
    }
};
module.exports = verifyToken;