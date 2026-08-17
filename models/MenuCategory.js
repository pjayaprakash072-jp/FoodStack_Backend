const mongoose = require('mongoose')

const menuCategorySchema = new mongoose.Schema(
    {
        outlet:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Outlet",
            required: true
        },
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
        displayOrder:{
            type:Number,
            default:0
        },
        iaActive:{  
            type:Boolean,
            default:true
        }
    },{
        timestamps:true
    }
)

module.exports = mongoose.model("MenuCategory",menuCategorySchema)