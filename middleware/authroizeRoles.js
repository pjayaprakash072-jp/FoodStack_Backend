const authorizeRoles = (...allowedRoles)=>{
    return (req,res,next)=>{
        if(!req.role){
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