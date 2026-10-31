const axios = require('axios');
const { response } = require('express');
const outletService = axios.create(
    {
        baseURL:process.env.OUTLET_SERVICE_URL_M,
        timeout:5000
    }
)
const updateOutlet = async(payload,token)=>{
    try {
        const response = await outletService.post(
            "/managerService/outlet/update",
            payload,
            {
                headers:{
                    token:token
                }
            }
        )
        return response;
    } catch (error) {
        if(
            error.response?.status === 400 || 
            error.response?.status === 404
        ){
            return null;
        }
        throw error;
    }
}
module.exports = {updateOutlet}