const axios = require("axios");
const managerService = axios.create(
    {
        baseURL:process.env.MANAGER_SERVICE_URL,
        timeout:5000
    }
);
const crateManagerAuth = async(payload) => { 
    try {
        const response = await managerService.post(
            "/managerAuth/create",payload
        )
        console.log(response);
        return response.data.managerAuth;
    } catch (error) {
        if(error.response?.status === 404 || error.response?.status === 400){
            return null;
        }
        throw error;
    }
}
module.exports = {crateManagerAuth}