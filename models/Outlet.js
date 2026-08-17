const mongoose = require('mongoose')
const MenuCategory = require('../models/MenuCategory')

const outletSchema = new mongoose.Schema(
    {
        vendor:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Vendor",
            required:true
        },
        menuCategories:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"MenuCategory"
            }
        ],
        name:{
            type:String,
            required:true,
            trim:true
        },
        description:{
            type:String,
            default:""
        },
        image: {
            url: {
                type: String,
                default: ''
            },
            public_id: {
                type: String,
                default: ''
            }
        },
        phone:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true 
        },
        area:{
            type:String,
            required:true 
        },
        cuisine:{
            type:[String],
            default:[]
        },
        foodType:{
            type:String,
            enum:["veg","non-veg","both"],
            default:"both"
        },
        openingTime:{
            type:String,
            required:true
        },
        closingTime:{
            type:String,
            required:true
        },
        isOpen:{
            type:Boolean,
            default:true
        },
        status:{
            type:String,
            enum:["active","inactive"],
            default:"active"
        }
    },
    {
        timestamps:true
    }
)

module.exports = mongoose.model("Outlet",outletSchema)