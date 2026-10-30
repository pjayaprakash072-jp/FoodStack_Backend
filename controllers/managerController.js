const Manager = require('../models/Manager');
const getManager = async(req,res)=>{
    try {
        const managerId = req.managerId;
        const manager = await Manager.findById(managerId).populate("outlet");
        if(!manager){
            return res.status(400).json(
                {
                    message:"Manager not found, Failet to retrieve manager!"
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
        res.status(200).json(
            {
                message:"Manager record retrieved successfully!",
                manager
            }
        )
    } catch (error) {
        console.log("Error, while retrieving manager !", error)
        res.status(500).json(
            {
                message:"Internal server Error, Failed to retrieve manager!",
                error:error.message
            }
        )
    }
}

module.exports = {
    getManager
}