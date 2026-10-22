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
        role:{
            type:String,
            default:"manager"
        }
    }
)
module.exports = mongoose.model("ManagerAuth",outletManagerSchema);