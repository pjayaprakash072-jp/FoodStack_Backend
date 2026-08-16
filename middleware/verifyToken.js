const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {

    const token = req.header.token;
    try {
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const 
        next();
    } catch (err) {
        return res.status(403).json({ message: "Token is not valid!" });
    }
};
module.exports = verifyToken;