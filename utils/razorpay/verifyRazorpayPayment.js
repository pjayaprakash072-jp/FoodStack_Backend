const crypto = require('crypto')

const verifyRazorpayPayment = ({razorpay_order_id,razorpay_payment_id,razorpay_signature})=>{
    const generatedSignature = crypto.createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
    ).update(
        `${razorpay_order_id}|${razorpay_payment_id}`
    ).digest("hex");
    return generatedSignature === razorpay_signature;
}

module.exports = verifyRazorpayPayment;