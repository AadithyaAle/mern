const bcrypt=require("bcrypt")
const Customer=require("../models/customer.model")
const generateToken=require("../utils/generateToken")
const registerCustomer=async(req,res)=>{
    try{
        const{fullName,email,password,phone}=req.body
        if(!fullName||!email||!password||!phone){
            return res.status(400).json({
                success:false,message:"All fields are required",
            })
        }
        if (password.length<6){
            return res.status(400).json({
                success:false,message:"Password must contain at least 6 characters",
            })
        }
        const existingCustomer=await Customer.findOne({email})
        if(existingCustomer){
            return res.status(409).json({
                success:false,message:"Email already exists",
            })
        }
        const hashedPassword=await bcrypt.hash(password,10)
        const customer=await Customer.create({
            fullName,email,password:hashedPassword,phone,
        })
        return res.status(201).json({
            success:true,message:"Customer registered successfully",
            customer:{
                _id:customer._id,fullName:customer.fullName,email:customer.email,phone:customer.phone,
            }
        })
    }
    catch(error){
        console.error(error);
        return res.status(500).json({success:false,message:"Server error",})
    }
}

const loginCustomer=async(req,res)=>{
    try{
        const{email,password}=req.body
        const customer=await Customer.findOne({email})
        if(!customer){
            return res.status(401).json({
                success:false,message:"Invalid credentials",
            })
        }
        const isPasswordCorrect=await bcrypt.compare(password,customer.password)
        if(!isPasswordCorrect){
            return res.status(401).json({success:false,message:"Invalid credentials",})
        }
        const token=generateToken(customer._id.toString())

        res.cookie("token",token,{
            httpOnly:true,secure:false,sameSite:"lax",maxAge:7*24*60*60*1000,
        })
        return res.status(200).json({
            success:true,message:"Login successful",
            customer:{
                _id:customer._id,fullName:customer.fullName,email:customer.email,phone:customer.phone
            }
        })
    }
    catch(error){
        console.error(error)
        return res.status(500).json({success:false,message:"Server error",})
    }
}

const getMyProfile=(req,res)=>{
    return res.status(200).json({
        _id:req.user._id,fullName:req.user.fullName,email:req.user.email,phone:req.user.phone,
    })
}

const logoutCustomer=(req,res)=>{
    res.clearCookie("token",{
        httpOnly:true,secure:false,sameSite:"lax",
    })
    return res.status(200).json({
        success:true,message:"Logged out successfully",
    })
}

const changePassword=async(req,res)=>{
    try{
        const{oldPassword,newPassword}=req.body
        if(!oldPassword||!newPassword){
            return res.status(400).json({
                success:false,message:"New password must contain at least 6 characters",
            })
        }
        if(newPassword.length<6){
            return res.status(400).json({
                success:false,message:"New password must constain at least 6 charatcers",
            })
        }
        const isOldPasswordCorrect=await bcrypt.compare(oldPassword,req.user.password)

        if(!isOldPasswordCorrect){
            return res.status(401).json({
                success:false,message:"Old password is incorrect",
            })
        }
        const hashedNewPassword=await bcrypt.hash(newPassword,10)
        await Customer.findByIdAndUpdate(req.user._id,{password:hashedNewPassword})
        return res.status(200).json({
            success:true,message:"Password changed successfully",
        })
    }
    catch(error){
        console.error(error)
        return res.status(500).json({
            success:false,message:"Server error",
        })
    }
}

module.exports={registerCustomer,loginCustomer,getMyProfile,logoutCustomer,changePassword,}
