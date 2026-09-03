const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport( // creating transporter between my node applicaton to the acutal gmail server to send emails from my foodStack application.
    {
        service: "gmail",
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS
        }
    }
);


const sendWelcomeEmail = async (email, name) =>{

    const mailOptions = {
        from:`"FoodStack" <${process.env.EMAIL_USER}>`,
        to:email,
        subject:"Welcome to FoodStack 🎉",

        html:`
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Welcome to FoodStack, ${name}! 👏</h2>
                <p>
                    Thank you for registering with FoodStack.
                </p>
                <p>
                    Your account has been successfully created.
                </p>
                <p>
                    We're happy to have you with us!
                </p>
                <br>
                <p>
                    Regards,<br>
                    <strong>FoodStack Team</strong>
                </p>
            </div>
        
        `
    };
    await transporter.sendMail(mailOptions)
}

const sendForgotPasswordLink  = async (email,name , resetURL)=>{
    const mailOptions = {
        from:`"FoodStack" <${process.env.EMAIL_USER}>`,
        to:email,
        subject:"Password Reset Link 🎉",

        html:
        `
                <h2>Reset Your FoodStack Password</h2>

                <p>Hello ${name},</p>

                <p>
                    You requested to reset your FoodStack password.
                </p>

                <p>
                    Click the button below to create a new password.
                </p>

                <a href="${resetURL}"
                    style="
                        display:inline-block;
                        padding:12px 20px;
                        background:#000;
                        color:#fff;
                        text-decoration:none;
                        border-radius:5px;
                "> 
                    Reset Password
                </a>

                <p>
                    This link will expire in 10 minutes.
                </p>

                <p>
                    If you did not request this, you can safely ignore
                    this email.
                </p>
            `
    }
    await transporter.sendMail(mailOptions);
}
module.exports = {sendWelcomeEmail , sendForgotPasswordLink}


// const { Resend } = require("resend");

// const resend = new Resend(process.env.RESEND_API_KEY);


// // ===============================
// // Welcome Email
// // ===============================
// const sendWelcomeEmail = async (email, name) => {

//     const { data, error } = await resend.emails.send({

//         from: "FoodStack <onboarding@resend.dev>",

//         to: [email],

//         subject: "Welcome to FoodStack 🎉",

//         html: `
//             <div style="font-family: Arial, sans-serif; padding: 20px;">
//                 <h2>Welcome to FoodStack, ${name}! 👏</h2>

//                 <p>
//                     Thank you for registering with FoodStack.
//                 </p>

//                 <p>
//                     Your account has been successfully created.
//                 </p>

//                 <p>
//                     We're happy to have you with us!
//                 </p>

//                 <br>

//                 <p>
//                     Regards,<br>
//                     <strong>FoodStack Team</strong>
//                 </p>
//             </div>
//         `
//     });

//     if (error) {
//         console.error("Resend welcome email error:", error);
//         throw new Error(error.message);
//     }

//     console.log("Welcome email sent:", data);

//     return data;
// };


// // ===============================
// // Forgot Password Email
// // ===============================
// const sendForgotPasswordLink = async (email, name, resetURL) => {

//     const { data, error } = await resend.emails.send({

//         from: "FoodStack <onboarding@resend.dev>",

//         to: [email],

//         subject: "Password Reset Link 🎉",

//         html: `
//             <h2>Reset Your FoodStack Password</h2>

//             <p>Hello ${name},</p>

//             <p>
//                 You requested to reset your FoodStack password.
//             </p>

//             <p>
//                 Click the button below to create a new password.
//             </p>

//             <a href="${resetURL}"
//                 style="
//                     display:inline-block;
//                     padding:12px 20px;
//                     background:#000;
//                     color:#fff;
//                     text-decoration:none;
//                     border-radius:5px;
//                 ">
//                 Reset Password
//             </a>

//             <p>
//                 This link will expire in 10 minutes.
//             </p>

//             <p>
//                 If you did not request this, you can safely ignore
//                 this email.
//             </p>
//         `
//     });

//     if (error) {
//         console.error("Resend forgot password email error:", error);
//         throw new Error(error.message);
//     }

//     console.log("Forgot password email sent:", data);

//     return data;
// };


// module.exports = {
//     sendWelcomeEmail,
//     sendForgotPasswordLink
// };