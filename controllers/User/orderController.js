

const MenuItem = require('../../models/MenuItem')
const Address = require('../../models/User/Address')
const Order = require('../../models/User/Order')
const User = require('../../models/User/User')
const createOrder = async(req,res)=>{

    try {
        const cartItems= Array.isArray(req.body.items) ? req.body.items : [];
        if(!cartItems.length) return res.status(400).json(
            {
                message:"Cart is empty!"
            }
        )
        const items = [];
        for(const x of cartItems){
            const id = x._id;
            
            const item = await MenuItem.findById(id);
            if(!item) return res.status(400).json(
                {
                    message:"One of the cart item no longer Exists"
                }
            )
            items.push(
                {
                    item:item._id,
                    name:item.name,
                    price:item.price,
                    quantity:Math.max(1,Number(x.quantity) ||1)
                }
            )
        }
        const subTotal = items.reduce(
            (sum,x)=>{
                return sum += x.price* x.quantity
            },0
        )
        const deliveryFee = 40;
        let deliveryAddress = "";
        if(req.body.addressId){
            const address = await Address.findOne(
                {
                    _id:req.body.addressId,
                    user:req.userId
                }
            )
            if(address){
                deliveryAddress = [
                    address.label,
                    address.fullName,
                    address.phone,
                    address.addressLine1,
                    address.addressLine2,
                    address.city,
                    address.state,
                    address.pincode
                ].filter(Boolean).join(", ");
            }
        }

        const order = new Order(
            {
                user:req.userId,
                items,
                deliveryAddress,
                subTotal,
                deliveryFee,
                totalAmount:subTotal+deliveryFee,
                paymentMethod:req.body.paymentMethod,
                paymentStatus:"pending",
                orderStatus:"placed"
            }
        )
        const user = await User.findById(req.userId);
        if(!user){
            return res.status(400).json(
                {
                    message:"User not found to add Order id while creating order."
                }
            )
        }
        user.orders.push(order._id);
        await user.save();
        await order.save();
        res.status(201).json(
            {
                message:"Order placed successfully!",
                order
            }
        )
    } catch (error) {
        console.log("Error",error);
        res.status(500).json(
            {
                message:"Internal server Error, Failed to creating Order",
                error:error.message
            }
        )
    }
}

const getAllOrders = async(req,res)=>{
    try {
        const orders = await Order.find(
            {
                user:req.userId
            }
        ).sort(
            {
                createdAt :-1
            }
        )
        if(!orders){
            return res.status(400).json(
                {
                    message:"No orders found with this user"
                }
            )
        }
        res.status(200).json(
            {
                message:"orders retrieved successfuly",
                orders
            }
        )
    } catch (error) {
        console.log("Error",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to get all orders",
                error:error.message
            }
        )
    }
}

const getOneOrder = async(req,res)=>{
    try {
        const orderId = req.params.orderId;
        const order = await Order.findOne(
            {
                user:req.userId,
                _id:orderId
            }
        )
        if(!order){
            return res.status(400).json(
                {
                    message:"No orders found with this user"
                }
            )
        }
        res.status(200).json(
            {
                message:"orders retrieved successfuly",
                order
            }
        )
    } catch (error) {
        console.log("Error",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to get all orders",
                error:error.message
            }
        )
    }
}

module.exports ={
    createOrder,
    getAllOrders,
    getOneOrder
}