const mongoose = require('mongoose')

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
            required:true
        },
        phone:{
            type:String,
            required:true
        },
        businessName:{
            type:String,
            default:""
        },
        profileImg:{
            type:String,
            default:""
        },
        status:{
            type:String,
            enum:["active","inactive","suspended"],
            default:"active"
        }
    },
    {
        timeseries:true
    }
)

module.exports = mongoose.model("Vendor",vendorSchema)