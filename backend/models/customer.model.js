const mongoose=require("mongoose")
const customerSchema=new mongoose.Schema({
    fullName:{
        type:String,required:true,trim:true,
    },
    email:{
        type:String,required:true,unique:true,lowercase:true,trim:true,
    },
    password:{
        type:String,required:true,trim:true,
    },
    phone:{
        type:String,required:true,trim:true,
    },
    wishlist:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        }
    ],
    cart:{
        type:[{
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required:true,
            },
            quantity:{
                type:Number,
                default:1,
                min:1,
            },
        },
    ],
    default:[],
    }
},
{timestamps:{
    createdAt:true,updatedAt:false,
    },
});

const Customer=mongoose.model("Customer",customerSchema);
module.exports=Customer;