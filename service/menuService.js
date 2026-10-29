const axios = require("axios");
const menuService = axios.create(
    {
        baseURL:process.env.MENU_SERVICE_URL,
        timeout:5000
    }
);
const getMenuItemById = async(id) => { 
    try {
        const response = await menuService.get(
            `/menu-item/get/${id}`
        )
        return response.data.menuItem;
    } catch (error) {
        if(error.response?.status === 404){
            return null;
        }
        throw error;
    }
}
module.exports = {getMenuItemById}