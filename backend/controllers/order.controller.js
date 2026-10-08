const Order = require("../models/order.model");
const Product = require("../models/product.model");
const Customer = require("../models/customer.model");
const razorpay = require("../config/razorpay");
const crypto=require("crypto")
const mongoose=require("mongoose")

const createPaymentOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body;
        const requiredFields = [
            "fullName",
            "phone",
            "addressLine1",
            "city",
            "state",
            "pincode",
        ];
        if (!shippingAddress || typeof shippingAddress !== "object") {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required",
            })
        }
        for (const field of requiredFields) {
            if (
                typeof shippingAddress[field] !== "string" ||
                !shippingAddress[field].trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`,
                })
            }
        }
        if (!/^\+?[0-9]{10,15}$/.test(shippingAddress.phone.trim())) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid phone number",
            })
        }
        if (!/^[0-9]{6}$/.test(shippingAddress.pincode.trim())) {
            return res.status(400).json({
                success: false,
                message: "Pincode must contain 6 digits",
            })
        }
        if (!req.user.cart.length) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty",
            })
        }
        const orderItems = [];
        let totalAmount = 0;
        for (const cartItem of req.user.cart) {
            const product = await Product.findById(cartItem.product);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "A product in your cart is no longer available",
                })
            }
            if (cartItem.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`,
                })
            }
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image,
            })
            totalAmount += product.price * cartItem.quantity;
        }
        totalAmount = Math.round((totalAmount + Number.EPSILON) * 100) / 100;
        const shopKartOrder = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress: {
                fullName: shippingAddress.fullName.trim(),
                phone: shippingAddress.phone.trim(),
                addressLine1: shippingAddress.addressLine1.trim(),
                city: shippingAddress.city.trim(),
                state: shippingAddress.state.trim(),
                pincode: shippingAddress.pincode.trim(),
            },
            totalAmount,
        })
        let razorpayOrder;
        try {
            razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalAmount * 100),
                currency: "INR",
                receipt: shopKartOrder._id.toString(),
            });
        } catch (paymentError) {
            await Order.findByIdAndDelete(shopKartOrder._id);
            throw paymentError;
        }
        shopKartOrder.razorpayOrderId = razorpayOrder.id;
        await shopKartOrder.save();
        return res.status(201).json({
            success: true,
            shopKartOrderId: shopKartOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
        })
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Unable to create payment order",
            })
        }
    }
const verifyPayment = async (req, res) => {
    try {
        const {
            shopKartOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;
        if (
            !shopKartOrderId ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification details are required",
            })
        }
        if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }
        const order = await Order.findOne({
            _id: shopKartOrderId,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Compare the browser's order ID with the trusted one stored on our server.
        if (razorpay_order_id !== order.razorpayOrderId) {
            return res.status(400).json({
                success: false,
                message: "Payment order does not match",
            });
        }

        const signatureBody =
            `${order.razorpayOrderId}|${razorpay_payment_id}`;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(signatureBody)
            .digest("hex");

        const expectedBuffer = Buffer.from(expectedSignature, "hex");
        const receivedBuffer = Buffer.from(razorpay_signature, "hex");
        const signatureIsValid =
            expectedBuffer.length === receivedBuffer.length &&
            crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

        if (!signatureIsValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature",
            });
        }
        const session = await mongoose.startSession();
        let confirmedOrder;

        try {
            await session.withTransaction(async () => {
                const currentOrder = await Order.findOne({
                    _id: shopKartOrderId,
                    user: req.user._id,
                }).session(session);

                if (!currentOrder) {
                    const error = new Error("Order not found");
                    error.statusCode = 404;
                    throw error;
                }

                // Make repeated verification safe: do not deduct stock twice,
                // or clear products the customer may have added since payment.
                if (currentOrder.paymentStatus === "PAID") {
                    if (currentOrder.razorpayPaymentId !== razorpay_payment_id) {
                        const error = new Error("Order was paid with a different payment");
                        error.statusCode = 409;
                        throw error;
                    }
                    confirmedOrder = currentOrder;
                    return;
                }

                if (currentOrder.paymentStatus !== "PENDING") {
                    const error = new Error("Order is not awaiting payment");
                    error.statusCode = 409;
                    throw error;
                }

                // Conditional atomic updates prevent stock from going below zero.
                for (const item of currentOrder.items) {
                    const stockUpdate = await Product.updateOne(
                        {
                            _id: item.product,
                            stock: { $gte: item.quantity },
                        },
                        { $inc: { stock: -item.quantity } },
                        { session }
                    );

                    if (stockUpdate.modifiedCount !== 1) {
                        const error = new Error(
                            `Insufficient stock for ${item.name}`
                        );
                        error.statusCode = 409;
                        throw error;
                    }
                }

                currentOrder.paymentStatus = "PAID";
                currentOrder.status = "PLACED";
                currentOrder.razorpayPaymentId = razorpay_payment_id;
                await currentOrder.save({ session });

                // Commit the order, inventory changes, and cart clear together.
                await Customer.updateOne(
                    { _id: req.user._id },
                    { $set: { cart: [] } },
                    { session }
                );

                confirmedOrder = currentOrder;
            });
        } finally {
            await session.endSession();
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified and order placed",
            order: confirmedOrder,
        });
    } catch (error) {
        console.error(error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Unable to verify payment",
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Unable to load orders",
        });
    }
};
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        // Including the owner in the query prevents access to another customer's order.
        const order = await Order.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        return res.status(200).json({
            success: true,
            order,
        });
        } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Unable to load order",
        });
    }
};
module.exports = { createPaymentOrder,verifyPayment,getMyOrders,getOrderById, };