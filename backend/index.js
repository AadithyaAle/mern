const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express=require("express")
const mongoose=require("mongoose")
const cookieParser=require("cookie-parser")
const app=express()
const PORT=process.env.PORT||5000;
const customerRoutes=require("./routes/customer.routes")
const productRoutes=require("./routes/product.routes")
const wishlistRoutes=require("./routes/wishlist.routes")
const cartRoutes=require("./routes/cart.routes")

app.use(express.json())
app.use(cookieParser())
app.use("/customers",customerRoutes)
app.use("/products",productRoutes)
app.use("/wishlist",wishlistRoutes)
app.use("/cart",cartRoutes)

app.get("/",(req,res)=>{
    res.json({
        success:true,message:"ShopKart API is running",
    })
})

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("MongoDB connected")

    app.listen(PORT,()=>{
        console.log(`Server running on port ${PORT}`)
    })
}).catch((error)=>{
    console.error("MongoDB connection failed:",error.message)
})