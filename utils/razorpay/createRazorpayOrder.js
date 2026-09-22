const razorpay = require('../../config/razorpay')

const createRazorpayOrder = async (amount)=>{
    const razorpayOrder = await razorpay.orders.create(
        {
            amount:Math.round(amount*100),
            currency:"INR",
            receipt:`FS${Date.now()}`
        }
    )
    return razorpayOrder;
}
module.exports = createRazorpayOrder;