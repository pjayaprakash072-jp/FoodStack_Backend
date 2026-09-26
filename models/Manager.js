const mongoose = require('mongoose')

const outletManagerSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            trim:true
        },
        phone:{
            type:String,
            unique:true,
            required:true
        },
        email:String,
        password:String,
        outlet:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Outlet"
        },
        vendor:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Vendor"
        },
        role:{
            type:String,
            default:"manager"
        },
        isAvailable:{
            type:String,
            enum:["yes","no"],
            default:"yes"
        }
    }
)
module.exports = mongoose.model("Manager",outletManagerSchema);