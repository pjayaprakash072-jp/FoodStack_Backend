const MenuItem = require('../../models/MenuItem')
const Address = require('../../models/User/Address')
const Order = require('../../models/User/Order')
const User = require('../../models/User/User')
const createRazorpayOrder = require('../../utils/razorpay/createRazorpayOrder')
const verifyRazorpayPayment = require('../../utils/razorpay/verifyRazorpayPayment')
const createPayment = async(req,res)=>{
    try {
        const cartItems = Array.isArray(req.body.items)? req.body.items:[];
        if(!cartItems.length){
            return res.status(400).json(
                {
                    message:"Cart is Empty!"
                }
            )
        }
        let subTotal = 0;
        for(const x of cartItems){
            const item = await MenuItem.findById(x._id);
            if(!item){
                return res.status(400).json(
                    {
                        message:"One of the cart item no longer exists."
                    }
                )
            }
            const quantity = Math.max(1,Number(x.quantity)||1);
            subTotal += quantity * item.price;
        }
        const deliveryFee = subTotal>0?40:0;
        const totalAmount = subTotal+deliveryFee;
        const razorpayOrder = await createRazorpayOrder(totalAmount);
        // console.log(razorpayOrder)
        res.status(201).json(
            {
                message:"Razorpay Order Created",
                razorpayOrder,
                amount:totalAmount
            }
        )

    } catch (error) {
        console.log("Error",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to create RazorpayOrder",
                error:error.message
            }
        )
    }
}
const verifyPayment = async(req,res)=>{
    try {
        const {
            outlet,
            items:cartItems,
            addressId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;
        if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature){
            return res.status(400).json(
                {
                    message:"Payment details are missing."
                }
            )
        }
        if(!outlet){
            return res.status(400).json(
                {
                    message:"Outlet is need to place order"
                }
            )
        }
        if(!addressId){
            return res.staus(400).json(
                {
                    message:"addressId is required to place Order"
                }
            )
        }
        if(!Array.isArray(cartItems) || !cartItems.length){
            return res.status(400).json(
                {
                    message:"cart is empty,please provide Array of items"
                }
            )
        }
        const isPaymentValid = verifyRazorpayPayment({razorpay_order_id,razorpay_payment_id,razorpay_signature});
        if(!isPaymentValid){
            return res.status(400).json(
                {
                    message:"Invalid payment Signature."
                }
            )
        }
        const items = [];
        let subTotal = 0;
        for(const x of cartItems){
            const id= x._id;
            const item = await MenuItem.findById(id);
            if(!item){
                return res.status(400).json(
                    {
                        message:"one of the menuItme is No longer Exists.."
                    }
                )
            }
            const quantity = Math.max(1,Number(x.quantity)|| 1);
            subTotal += item.price*quantity;
            items.push(
                {
                    item:item._id,
                    name:item.name,
                    price:item.price,
                    quantity
                }
            )
        }
        const deliveryFee = subTotal>0?40:0;
        const totalAmount = subTotal+deliveryFee;
        let deliveryAddress= "";
        const address = await Address.findById(addressId);
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
        const order = new Order(
            {
                user:req.userId,
                outlet,
                items,
                deliveryAddress,
                subTotal,
                deliveryFee,
                totalAmount,
                razorpayOrderId:razorpay_order_id,
                razorpayPaymentId:razorpay_payment_id,
                paymentMethod:"UPI",
                paymentStatus:"paid",
                orderStatus:"placed"
            }
        )
        const user = await User.findById(req.userId);
        if(!user){
            return res.status(400).json(
                {
                    message:"user not found to add order id while place order through the payment."
                }
            )
        }
        user.orders.push(order._id);
        await user.save();
        await order.save();
        res.status(200).json(
            {
                message:"Order placed successfully!",
                order,
                razorpayOrderId:razorpay_order_id,
                razorpayPaymentId:razorpay_payment_id,
                paymentStatus:"paid"
            }
        )
    } catch (error) {
        console.log("Error while veifying payment",error);
        res.status(500).json(
            {
                message:"Internal server error, Failed to verify payment",
                error:error.message
            }
        )
    }
}
module.exports ={
    createPayment,
    verifyPayment
}