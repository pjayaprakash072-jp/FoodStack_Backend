const razorpay = require('../../config/razorpay');
const refundRazorpayPayment = async (paymentId)=>{
    const refund = await razorpay.payments.refund(paymentId);
    return refund;
}

module.exports = refundRazorpayPayment;