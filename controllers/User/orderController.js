

const MenuItem = require('../../models/MenuItem')
const Address = require('../../models/User/Address')
const Order = require('../../models/User/Order')
const User = require('../../models/User/User')
const Outlet = require('../../models/Outlet')
const Vendor = require('../../models/Vendor')
const createOrder = async(req,res)=>{

    try {
        const cartItems= Array.isArray(req.body.items) ? req.body.items : [];
        if(!cartItems.length) return res.status(400).json(
            {
                message:"Cart is empty!"
            }
        )
        const outletId = req.body.outlet
        console.log("outletId", outletId)
        const outlet = await Outlet.findById(outletId);
        if(!outlet){
            return res.status(400).json(
                {
                    message:"Outlet not foudn to palce order!"
                }
            )
        }
        const itemIds = cartItems.map((x)=>x._id);
        const validOutlet = await Outlet.exists(
            {
                _id:outletId,
                menuItems:{$all:itemIds}
            }
        )
        if(!validOutlet){
            return res.status(400).json(
                {
                    message:"One or more items do not belong to this outler."
                }
            )
        }
        const vendor = await Vendor.findById(outlet.vendor);
        if(!vendor){
            return res.status(400).json(
                {
                    message:"Vendor not found to place Order."
                }
            )
        }
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
                outlet:outletId,
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
        outlet.orders.push(order._id);
        vendor.orders.push(order._id);
        await user.save();
        await order.save();
        await outlet.save();
        await vendor.save();
        const io = req.app.get("io");
        if(io){
            io.to(`outlet${outletId}`).emit(
                "new-order",
                {
                    orderId:order._id,
                    outletId:outletId,
                    totalAmount:order.totalAmount,
                    orderStatus:order.orderStatus,
                    createdAt:order.createdAt
                }
            )
        }
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

const getAllOrdersByUser = async(req,res)=>{
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
const getAllOrderByVendor = async (req,res)=>{
    try {
        const vendorId = req.vendorId;
        const orders = await Vendor.findById(vendorId).populate("orders");
        if(!orders){
            return res.status(400).json(
                {
                    message:" Orders not found."
                }
            )
        }
        res.status(200).json(
            {
                message:"orders retrieved successfully!",
                orders:orders.orders
            }
        )
    } catch (error) {
        console.log(error)
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
    getAllOrdersByUser,
    getOneOrder,
    getAllOrderByVendor
}