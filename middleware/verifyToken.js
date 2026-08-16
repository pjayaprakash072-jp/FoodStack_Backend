const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {

    const token = req.headers.token;

    if(token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if(err) res.status(403).json("Token is not valid!");    
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json("You are not authenticated!");
    }   
}

module.exports = verifyToken;