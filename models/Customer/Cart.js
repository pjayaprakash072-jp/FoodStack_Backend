const mongoose = require('mongoose')
const cartSchema = new mongoose.Schema(
    {
        customerId:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Customer",
            required:true,
            unique:true
        },
        items:[
            {
                menuItemId:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref:"MenuItem",
                    required:true
                },
                quantity:{
                    type:Number,
                    required:true,
                    min:1
                },
                price:{
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
