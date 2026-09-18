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
        const incoming = Array.isArray(req.body.items) ? req.body.items : [];
        const cart = [];
        for(const x of incoming){
            const id = x.items?._id;
            const item = await MenuItem.findById(id);
            if(item){
                cart.push(
                    {
                        item:item._id,
                        quantity: Math.max(1,Number(x.quantity) || 1)
                    }
                )
            }
        }
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {cart},
            {new:true},
        ).populate("cart.item");
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

module.exports = {
    getCartItems,
    addCartItem
}