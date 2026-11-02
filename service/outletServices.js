const axios = require('axios');
const outletService = axios.create(
    {
        baseURL:process.env.OUTLET_SERVICE_URL_M,
        timeout:5000
    }
)
const unwrap = (res)=>res?.data;
const getOutletById_s = async(id)=>{
    try {
        const response = await outletService.get(
            `/outlet/get/${id}`
        )
        return unwrap(response);
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
const updateOutlet_s = async(payload,id,token)=>{
    try {
        const response = await outletService.put(
            `/outlet/update`,
            payload,
            {
                headers:{
                    token:token
                },
                params:{
                    id
                }
            }
        )
        return unwrap(response);
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
const getMenuCategoriesByOutlet_s = async(outletId,token)=>{
    try {
        const response = await outletService.get(
            `/menu-category/outlet`,
            {
                headers:{
                    token:token
                },
                params:{
                    outletId
                }
            }
        )
        return unwrap(response);
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
const createMenuCategory_s = async(payload,outletId,token)=>{
    try {
        const response = await outletService.post(
            `/menu-category/create`,
            payload,
            {
                headers:{
                    token:token
                },
                params:{
                    outletId
                }
            }
        )
        return unwrap(response);
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
const getMenuCategoryById_s = async(id,token)=>{
    try {
        const response = await outletService.get(
            `/menu-category/get/${id}`,
            {
                headers:{
                    token:token
                }
            }
        )
        return unwrap(response);
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
const updateMenuCategory_s = async(payload,id,token)=>{
    try {
        const response = await outletService.put(
            `/menu-category/update/${id}`,
            payload,
            {
                headers:{
                    token:token
                }
            }
        )
        return unwrap(response);
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
const deleteMenuCategory_s = async(id,token)=>{
    try {
        const response = await outletService.delete(
            `/menu-category/delete/${id}`,
            {
                headers:{
                    token:token
                }
            }
        )
        return unwrap(response);
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
const getMenuitemsByOutlet_s = async(outletId,token)=>{
    try {
        const response = await outletService.get(
            `/menu-item/outlet`,
            {
                headers:{
                    token:token
                },
                params:{
                    outletId
                }
            }
        )
        return unwrap(response);
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
const getMenuItemsByCategory_s = async(id,token)=>{
    try {
        const response = await outletService.get(
            `/menu-item/category/${id}`,
            {
                headers:{
                    token:token
                }
            }
        )
        return unwrap(response);
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
const getMenuItemById_s = async(id,token)=>{
    try {
        const response = await outletService.get(
            `/menu-item/get/${id}`,
            {
                headers:{
                    token:token
                }
            }
        )
        return unwrap(response);
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
const createMenuItem_s = async(payload,id,token)=>{
    try {
        const response = await outletService.post(
            `/menu-item/add/${id}`,
            payload,
            {
                headers:{
                    token:token
                }
            }
        )
        return unwrap(response);
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
const updateMenuItem_s = async(payload,id,token)=>{
    try {
        const response = await outletService.put(
            `/menu-item/update/${id}`,
            payload,
            {
                headers:{
                    token:token
                }
            }
        )
        return unwrap(response);
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
const deleteMenuItem_s = async(id,token)=>{
    try {
        const response = await outletService.delete(
            `/menu-item/delete/${id}`,
            {
                headers:{
                    token:token
                }
            }
        )
        return unwrap(response);
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
const getOrdersByOutlet_s = async(outletId,token)=>{
    try {
        const response = await outletService.get(
            `/order/outlet`,
            {
                headers:{
                    token:token
                },
                params:{
                    outletId
                }
            }
        )
        return unwrap(response);
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
const updateOrder_s = async(payload,orderId,token)=>{
    try {
        const response = await outletService.put(
            `/order/update`,
            payload,
            {
                headers:{
                    token:token
                },
                params:{
                    orderId
                }
            }
        )
        return unwrap(response);
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
module.exports = {
    getOutletById_s,
    updateOutlet_s,
    getMenuCategoriesByOutlet_s,
    createMenuCategory_s,
    getMenuCategoryById_s,
    updateMenuCategory_s,
    deleteMenuCategory_s,
    getMenuitemsByOutlet_s,
    getMenuItemsByCategory_s,
    getMenuItemById_s,
    createMenuItem_s,
    updateMenuItem_s,
    deleteMenuItem_s,
    getOrdersByOutlet_s,
    updateOrder_s
}