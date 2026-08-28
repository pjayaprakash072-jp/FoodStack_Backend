const mongoose = require('mongoose')
const Outlet = require('../models/Outlet')
const vendorSchema = new mongoose.Schema(
    {
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
        businessName:{
            type:String,
            default:""
        },
        status:{
            type:String,
            enum:["active","inactive","suspended"],
            default:"active"
        },
        profileImg:{
            url: {
                type: String,
                default: ''
            },
            public_id: {
                type: String,
                default: ''
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
        },
        outlets:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref :"Outlet"
            }
        ]
    },
    {
        timeseries:true
    }
)

module.exports = mongoose.model("Vendor",vendorSchema)