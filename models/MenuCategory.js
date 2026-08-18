const mongoose = require('mongoose')
const MenuItem = require('../models/MenuItem')
const menuCategorySchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        description:{
            type:String,
            default:""
        },
        displayOrder:{
            type:Number,
            default:0
        },
        iaActive:{  
            type:Boolean,
            default:true
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
        outlet:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Outlet",
            required: true
        },
        menuItems:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref : "MenuItem"
            }
        ]
    },{
        timestamps:true
    }
)

module.exports = mongoose.model("MenuCategory",menuCategorySchema)