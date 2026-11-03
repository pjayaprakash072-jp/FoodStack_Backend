const axios = require("axios");
const verifyCaptcha = async(req,res,next)=>{
    try {
        const {captchaToken} = req.body;
        if(!captchaToken){
            return res.status(400).json(
                {
                    message:"Please complete the CAPTCHA"
                }
            )
        }
        const response = await axios.post(
            "https://www.google.com/recaptcha/api/siteverify",
            new URLSearchParams( // making the format which google accepts.
                {
                    secret:process.env.RECAPTCHA_SITE_SECRET,
                    response: captchaToken // this is the token we are giving to google to verify with our secrect , which google looking for.
                }
            ).toString(),
            {
                headers:{
                    "content-Type":"application/x-www-form-urlencoded",
                },
                timeout:5000,
            }
        )
        // console.log(response);
        if(!response.data.success){
            return res.status(400).json(
                {
                    message:"CAPTCHA verification failed. Please try again"
                }
            )
        }
        next();
    } catch (error) {
        console.error("CAPTCHA verification error:",error.message);
        return res.status(503).json(
            {
                message:"CAPTCHA verificationis temporarily unavailable!"
            }
        )
    }
}
module.exports = verifyCaptcha;