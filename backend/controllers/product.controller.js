const mongoose=require("mongoose")
const Product=require("../models/product.model")

const createProduct=async(req,res)=>{
    try{
        const product=await Product.create(req.body)
        return res.status(201).json({success:true,product})
    }catch(error){
        console.error(error)
        if(error.name==="ValidationError"||error.name==="CastError"){
            return res.status(400).json({success:false,message:"Invalid product data"})
        }
        return res.status(500).json({success:false,message:"Server error"})
    }
}

const getProducts=async(req,res)=>{
    try{
        const query={}
        if(req.query.search){query.name={$regex:req.query.search,$options:"i"}}
        if(req.query.category){query.category=req.query.category}
        const sort={}
        if(req.query.sort==="price_asc")sort.price=1
        if(req.query.sort==="price_desc")sort.price=-1
        const products=await Product.find(query).select("name description price category image stock createdAt").sort(sort)
        return res.status(200).json({success:true,count:products.length,products})
    }catch(error){
        console.error(error)
        return res.status(500).json({success:false,message:"Server error"})
    }
}

const getProduct=async(req,res)=>{
    try{
        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json({success:false,message:"Invalid product ID"})
        }
        const product=await Product.findById(req.params.id).select("name description price category image stock createdAt")
        if(!product)return res.status(404).json({success:false,message:"Product not found"})
        return res.status(200).json({success:true,product})
    }catch(error){
        console.error(error)
        return res.status(500).json({success:false,message:"Server error"})
    }
}

module.exports={createProduct,getProducts,getProduct}
