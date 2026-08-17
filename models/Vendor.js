const mongoose = require('mongoose')
const Outlet = require('../models/Outlet')
const vendorSchema = new mongoose.Schema(
    {
        outlets:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref :"Outlet"
            }
        ],
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
            url: {
                type: String,
                default: ''
            },
            public_id: {
                type: String,
                default: ''
            }
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