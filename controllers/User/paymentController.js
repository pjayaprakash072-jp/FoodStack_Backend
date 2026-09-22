const MenuItem = require('../../models/MenuItem')
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

const verifyPayment = async (req,res)=>{
    try {
        const {razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;
        const isvalid = await verifyRazorpayPayment({razorpay_order_id,razorpay_payment_id,razorpay_signature});
        if(!isvalid){
            return res.status(400).json(
                {
                    message:"Invalid payment signature."
                }
            )
        }
        res.status(200).json(
            {
                message:"payment verified",
                paymentStatus:"paid",
                paymentId:razorpay_payment_id
            }
        )
    } catch (error) {
        console.log("Error in verifying payment",error);
        res.status(500).json(
            {
                message:"Internal server Error, Failed to verify Payment",
                error:error.message
            }
        )
    }
}

module.exports ={
    createPayment,
    verifyPayment
}