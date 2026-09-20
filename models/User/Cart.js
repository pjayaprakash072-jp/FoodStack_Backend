const mongoose = require('mongoose')
const cartSchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
            unique:true
        },
        items:[
            {
                item:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref:"MenuItem",
                    required:true
                },
                price:{
                    type:Number,
                    required:true,
                    min:0
                },
                quantity:{
                    type:Number,
                    required:true,
                    min:1
                },
                subTotal:{
                    type:Number,
                    required:true,
                    min:0
                }
            }
        ]
    }
    ,{
        timestamps:true
    }
)
module.exports = mongoose.model("Cart",cartSchema);
