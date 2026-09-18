const authorizeRoles = (...allowedRoles)=>{
    return (req,res,next)=>{
        if(!req.role){ // we are setting role to req in teh verify token , role is coming along with the token and asigned in token creation.
            return res.status(401).json(
                {
                    message:"Authentication Required!"
                }
            )
        }
        if(!allowedRoles.includes(req.role)){
            return res.status(403).json(
                {
                    message:"Access denied"
                }
            )
        }
        next();
    }
}

module.exports = authorizeRoles;