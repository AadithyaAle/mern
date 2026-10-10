const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express=require("express")
const mongoose=require("mongoose")
const cookieParser=require("cookie-parser")
const cors=require("cors")
const app=express()
const PORT=process.env.PORT||5000;
const customerRoutes=require("./routes/customer.routes")
const productRoutes=require("./routes/product.routes")
const wishlistRoutes=require("./routes/wishlist.routes")
const cartRoutes=require("./routes/cart.routes")
const orderRoutes=require("./routes/order.routes")

const allowedOrigins = new Set(
    (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
)

app.use(cors({
    origin(origin, callback) {
        // Requests without an Origin header include server-to-server tools.
        callback(null, !origin || allowedOrigins.has(origin))
    },
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
app.use("/customers",customerRoutes)
app.use("/products",productRoutes)
app.use("/wishlist",wishlistRoutes)
app.use("/cart",cartRoutes)
app.use("/orders",orderRoutes)

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