const mongoose = require('mongoose')
const vendorSchema = new mongoose.Schema(
    {
        role:{
            type:String,
            enum:["vendor"],
            default:"vendor"
        },
        name:{
            type:String,
            required: true
        },
        email:{
            type:String,
            lowercase:true,
            unique:true,
            required:true,
            trim:true
        },
        password:{
            type:String,
            required: function(){
                return this.authProvider === "local"
            }
        },
        phone:{
            type:String,
            required: function(){
                return this.authProvider === "local"
            }
        },
        passwordResetToken:{
            type:String,
            default:null
        },
        passwordResetTokenExpires:{
            type:Date,
            default:null
        },
        googleId:{
            type:String,
            unique:true,
            sparse:true
        },
        authProvider:{
            type:String,
            enum:['local','google'],
            default:"local"
        }
    },
    {
        timestamps:true
    }
)

module.exports = mongoose.model("VendorAuth",vendorSchema)