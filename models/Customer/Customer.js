const mongoose = require('mongoose')
const customerSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            required:true,
            trim:true,
            unique:true,
            lowercase:true
        },
        phone:{
            type:String,
            required: function(){
                return this.authProvider === "local"
            }
        },
        password:{
            type:String,
            required:function(){
                return this.authProvider === "local"
            }
        },
        profileImg:{
            url:{
                type:String,
                default:""
            },
            public_id:{
                type:String,
                default:""
            }
        },
        authProvider:{
            type:String,
            enum:["local","google"],
            default:"local"
        },
        googleId:{
            type:String,
            unique:true,
            sparse:true
        },
        isVerified:{
            type:Boolean,
            default:false
        },
        emailVerificationToken:{
            type:String,
            default:null
        },
        emailVerificationExpires:{
            type:Date,
            default:null
        }
    },
    {
        timestamps:true
    }
)

module.exports = mongoose.model("Customer",customerSchema);