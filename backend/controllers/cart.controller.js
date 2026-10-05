const mongoose = require("mongoose");
const Product = require("../models/product.model");

const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const cartItem = req.user.cart.find(
            (item) => item.product.toString() === productId
        );

        const nextQuantity = cartItem ? cartItem.quantity + 1 : 1;

        if (nextQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock",
            });
        }

        if (cartItem) {
            cartItem.quantity = nextQuantity;
        } else {
            req.user.cart.push({
                product: product._id,
                quantity: 1,
            });
        }

        await req.user.save();

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: req.user.cart,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const getCart = async (req, res) => {
    try {
        const customer = await req.user.populate({
            path: "cart.product",
            select: "name description price category image stock",
        });

        return res.status(200).json({
            success: true,
            cart: customer.cart,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a whole number of at least 1",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const cartItem = req.user.cart.find(
            (item) => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product is not in the cart",
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Requested quantity exceeds available stock",
            });
        }

        cartItem.quantity = quantity;
        await req.user.save();

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            cart: req.user.cart,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const cartItemIndex = req.user.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (cartItemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product is not in the cart",
            });
        }

        req.user.cart.splice(cartItemIndex, 1);
        await req.user.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: req.user.cart,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

module.exports = { addToCart, getCart, updateCartQuantity, removeFromCart };