const User = require('../../models/User/User')
const MenuItem = require('../../models/MenuItem')

const getCartItems = async (req,res)=>{
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate({path:"cart.item",populate:{path:"outlet"}})
        res.status(200).json(
            {
                message:"Cart Item retrieved successfully!",
                cartItems:user.cart
            }
        )
    } catch (error) {
        console.log("Error",error)
        res.status(500).json(
            {
                message:"Internal server Error",
                error:error.message
            }
        )
    }
}

const addCartItem = async (req,res)=>{
    try {
        const itemId= req.body.item
        const item = await MenuItem.findById(itemId);
        if(!item){
            return res.status(400).json(
                {
                    message:"Item not found"
                }
            )
        }
        const user = await User.findById(req.userId);
        const existingItem = user.cart.find(
            x=> x.item.toString() === itemId.toString()
        )
        if(existingItem){
            existingItem.quantity +=1;
        }else{
            user.cart.push(
                {
                    item:itemId,
                    quantity:1
                }
            )
        }
        await user.save();
        await user.populate({path:"cart.item",populate:{path:"outlet"}})
        res.status(200).json(
            {
                message:"Cart Updated Successfully!",
                cartItems:user.cart
            }
        )
    } catch (error) {
        console.log("Error",error)
        res.status(500).json(
            {
                message:"Internal server Error",
                error:error.message
            }
        )
    }
}
const removeItem = async(req,res)=>{
    try {
        await User.findByIdAndUpdate(
            req.userId,
            {
                $pull:{
                    cart:{
                        item:req.params.itemId
                    }
                }
            }
        )
        const user = await User.findById(req.userId).populate({path:"cart.item",populate:{path:"outlet"}})
        res.status(200).json(
            {
                message:"Item removed successfully, updated cartItems",
                cartItems:user.cart
            }
        )
        
    } catch (error) {
        console.log("Error",error);
        res.status(500).json(
            {
                message:"Internal server Error, failed to remove item from cart",
                error:error.message
            }
        )
    }
}
const updateCart = async(req,res)=>{
    try {
        const quantity = Math.max(1,Number(req.body.quantity)||1);
        const user = await User.findOneAndUpdate(
            {
                _id:req.userId,
                "cart.item": req.params.itemId
            },
            {
                $set:{
                    "cart.$.quantity":quantity
                }
            },
            {
                returnDocument: "after"
            }
        ).populate({path:"cart.item",populate:{path:"outlet"}})
        if(!user){
            return res.status(400).json(
                {
                    message:"Item not found in cart"
                }
            )
        }
        res.status(200).json(
            {
                message:"quantity Updated successfully!",
                cartItems:user.cart
            }
        )
    } catch (error) {
        console.log("Error",error)
        res.status(500).json(
            {
                message:"Internal server error, Failed to update item quantity",
                error:error.message
            }
        )
    }
}
const clearCart = async(req,res)=>{
    try {
        await User.findByIdAndUpdate(
            req.userId,
            {
                $set:{
                    cart:[]
                }
            },
            {
                returnDocument: "after"
            }
        )
        res.status(200).json(
            {
                message:"Cart Cleard successfully!"
            }
        )
    } catch (error) {
        console.log("Error",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to clear Cart",
                error:error.message
            }
        )
    }
}
const mergeCart = async(req,res)=>{
    try {
        const guestItems = Array.isArray(req.body.items)?req.body.items : [];
        const user = await User.findById(req.userId);
        if(!user){
            return res.status(400).json(
                {
                    message:"user not found"
                }
            )
        }
        for(const guestItem of guestItems){
            const itemId = guestItem._id;
            if(!itemId) continue;
            const quantity = Math.max(1,Number(guestItem.quantity) || 1);
            const existingItem = user.cart.find(
                (x)=>x.item.toString() === itemId
            )
            if(existingItem){
                existingItem.quantity += quantity;
            }else{
                const item = await MenuItem.findById(itemId)
                if(!item){
                    continue;
                }
                user.cart.push(
                    {
                        item:itemId,
                        quantity
                    }
                )
            }
        }
        await user.save();
        await user.populate({path:"cart.item",populate:{path:"outlet"}})
        res.status(200).json(
            {
                message:"Cart merged successfully!",
                cartItems:user.cart
            }
        )
    } catch (error) {
        console.log("Error",error);
        res.status(500).json(
            {
                message:"Internal server Error, Failed to merge the cart items",
                error:error.message
            }
        )
    }
}
module.exports = {
    getCartItems,
    addCartItem,
    updateCart,
    clearCart,
    removeItem,
    mergeCart
}