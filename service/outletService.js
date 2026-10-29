const axios = require('axios');
const outlerService = axios.create(
    {
        baseURL:process.env.OUTLET_SERVICE_URL,
        timeout:5000
    }
);
const getOutletById = async(id)=>{
    try {
        const response = await outlerService.get(
            `/outlet/get/${id}`
        )
        return response.data.outlet
    } catch (error) {
        if(error.response?.status === 400 || error.response?.status === 404){
            return null;
        }
        throw error;
    }
}
module.exports = {getOutletById};