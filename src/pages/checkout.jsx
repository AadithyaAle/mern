import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {createPaymentOrder,getCart,verifyPayment,} from "../services/api"
import {setCartError,setCartItems,setCartLoading,} from "../store/cartSlice"
const initialAddress = {
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
};
function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true)
            return
        }
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}
function Checkout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector((state) => state.cart.cartItems || []);

    const [address, setAddress] = useState(initialAddress);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadCart() {
            dispatch(setCartLoading(true));

            try {
                const data = await getCart();
                dispatch(setCartItems(data.cart || []));
                dispatch(setCartError(null));
            } catch (requestError) {
                setError(requestError.message || "Unable to load your cart.");
            } finally {
                dispatch(setCartLoading(false));
                setLoading(false);
            }
        }

        loadCart();
    }, [dispatch]);
    const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
    );

    function handleChange(event) {
        const { name, value } = event.target;
        setAddress((currentAddress) => ({
            ...currentAddress,
            [name]: value,
        }));
    }
    function validateAddress() {
        for (const [field, value] of Object.entries(address)) {
            if (!value.trim()) {
                return `${field} is required.`;
            }
        }

        if (!/^\+?[0-9]{10,15}$/.test(address.phone.trim())) {
            return "Enter a valid phone number.";
        }

        if (!/^[0-9]{6}$/.test(address.pincode.trim())) {
            return "Pincode must contain 6 digits.";
        }

        return "";
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const validationError = validateAddress();
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!cartItems.length) {
            setError("Your cart is empty.");
            return;
        }

        setPlacingOrder(true);
        try {
            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded) {
                throw new Error("Unable to load Razorpay Checkout. Please try again.");
            }

            const checkoutData = await createPaymentOrder(address);

            const options = {
                key: checkoutData.key,
                amount: checkoutData.amount,
                currency: checkoutData.currency,
                name: "ShopKart",
                description: "ShopKart Order",
                order_id: checkoutData.razorpayOrderId,
                prefill: {
                    name: address.fullName,
                    contact: address.phone,
                },
                handler: async (razorpayResponse) => {
                    try {
                        const result = await verifyPayment({
                            shopKartOrderId: checkoutData.shopKartOrderId,
                            razorpay_order_id: razorpayResponse.razorpay_order_id,
                            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                            razorpay_signature: razorpayResponse.razorpay_signature,
                        });
                        dispatch(setCartItems([]));
                        navigate(`/order-success/${result.order._id}`, {
                            state: { order: result.order },
                        });
                    } catch (verificationError) {
                        setError(
                            verificationError.message ||
                            "Payment verification failed. Your cart has not been cleared."
                        );
                        setPlacingOrder(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setPlacingOrder(false);
                        setError("Checkout was closed. Your cart has not been cleared.");
                    },
                },
                theme: {
                    color: "#2563eb",
                },
            };
            const paymentWindow = new window.Razorpay(options);

            paymentWindow.on("payment.failed", () => {
                setError("Payment failed. Your cart has not been cleared.");
                setPlacingOrder(false);
            });

            paymentWindow.open();
        } catch (requestError) {
            setError(requestError.message || "Unable to start checkout.");
            setPlacingOrder(false);
        }
    }

    if (loading) {
        return (
            <main className="catalog-page">
                <Navbar />
                <p className="catalog-message">Loading checkout...</p>
            </main>
        );
    }
    if (!cartItems.length) {
        return (
            <main className="catalog-page">
                <Navbar />
                <section className="wishlist-empty">
                    <h1>Your cart is empty</h1>
                    <p>Add products before starting checkout.</p>
                    <button
                        className="button"
                        type="button"
                        onClick={() => navigate("/products")}
                    >
                        Browse products
                    </button>
                </section>
            </main>
        );
    }
    return (
        <main className="catalog-page">
            <Navbar />

            <header className="catalog-header">
                <div>
                    <p className="eyebrow">SHOPKART / CHECKOUT</p>
                    <h1>Shipping <em>details.</em></h1>
                </div>
            </header>

            <section className="cart-layout">
                <form className="checkout-form" onSubmit={handleSubmit}>
                    <label>
                        Full name
                        <input
                            name="fullName"
                            value={address.fullName}
                            onChange={handleChange}
                            autoComplete="name"
                        />
                    </label>

                    <label>
                        Phone
                        <input
                            name="phone"
                            type="tel"
                            value={address.phone}
                            onChange={handleChange}
                            autoComplete="tel"
                        />
                    </label>
                    <label>
                        Address
                        <input
                            name="addressLine1"
                            value={address.addressLine1}
                            onChange={handleChange}
                            autoComplete="street-address"
                        />
                    </label>

                    <label>
                        City
                        <input
                            name="city"
                            value={address.city}
                            onChange={handleChange}
                            autoComplete="address-level2"
                        />
                    </label>

                    <label>
                        State
                        <input
                            name="state"
                            value={address.state}
                            onChange={handleChange}
                            autoComplete="address-level1"
                        />
                    </label>
                    <label>
                        Pincode
                        <input
                            name="pincode"
                            value={address.pincode}
                            onChange={handleChange}
                            inputMode="numeric"
                            autoComplete="postal-code"
                        />
                    </label>

                    {error && <p className="catalog-message error">{error}</p>}

                    <button
                        className="button"
                        type="submit"
                        disabled={placingOrder}
                    >
                        {placingOrder ? "Starting payment..." : "Place Order"}
                    </button>
                </form>

                <aside className="cart-summary">
                    <h2>Order Summary</h2>
                    {cartItems.map((item) => (
                        <p key={item.product?._id}>
                            {item.product?.name} × {item.quantity}
                        </p>
                    ))}
                    <p>Total: ₹{subtotal.toLocaleString("en-IN")}</p>
                    <small>
                        The server recalculates the amount using current product prices.
                    </small>
                </aside>
            </section>
            </main>
    );
}

export default Checkout;