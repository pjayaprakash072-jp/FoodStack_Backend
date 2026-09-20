const User = require('../../models/User/User')
const MenuItem = require('../../models/MenuItem')

const getCartItems = async (req,res)=>{
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate("cart.item")
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
        user.cart.push(
            {
                item:itemId,
                quantity:1
            }
        )
        await user.save();
        await user.populate("cart.item");
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
        res.status(200).json(
            {
                message:"Item removed successfully"
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
                new:true
            }
        ).populate("cart.item");
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
                new:true
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
module.exports = {
    getCartItems,
    addCartItem,
    updateCart,
    clearCart,
    removeItem
}