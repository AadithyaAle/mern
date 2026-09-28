const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const addToWishlist = async (req, res) => {
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

        const alreadyExists = req.user.wishlist.some(
            (id) => id.toString() === productId
        );

        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: "Product already in wishlist",
            });
        }

        req.user.wishlist.push(product._id);
        await req.user.save();

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: "name description price category image stock createdAt",
        });

        return res.status(200).json({
            success: true,
            count: customer.wishlist.length,
            wishlist: customer.wishlist,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const productIndex = req.user.wishlist.findIndex(
            (id) => id.toString() === productId
        );

        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product is not in wishlist",
            });
        }

        req.user.wishlist.splice(productIndex, 1);
        await req.user.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
};