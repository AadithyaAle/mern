const jwt=require("jsonwebtoken")
const Customer=require("../models/customer.model")

const protect=async(req,res,next)=>{
    try{
        const token=req.cookies.token
        if(!token){
            return res.status(401).json({
                success:false,message:"Authentication required",
            })
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const customer=await Customer.findById(decoded.customerId)
        
        if(!customer){
            return res.status(401).json({
                success:false,message:"Authentication required",
            })
        }
        req.user=customer;
        next();
    }
    catch(error){
        return res.status(401).json({
            success:false,message:"Invalid or expired token",
        })
    }
}
module.exports=protect;
