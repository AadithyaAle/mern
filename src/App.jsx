import React from "react";
import { BrowserRouter,Navigate,Route,Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist"
import Cart from "./pages/cart"
import Checkout from "./pages/checkout"
import Orders from "./pages/Orders"
import OrderSuccess from "./pages/OrderSuccess";

function App(){
    return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;