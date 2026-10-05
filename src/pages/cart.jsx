import React,{useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { setCartItems, setCartLoading, setCartError } from "../store/cartSlice";
import { getCart, updateCartQuantity, removeFromCart } from "../services/api";
import Navbar from "../components/Navbar";

function Cart(){
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.cartItems || []);
    const loading = useSelector((state) => state.cart.loading);
    const error = useSelector((state) => state.cart.error);

    async function refreshCart(){
        dispatch(setCartLoading(true));
        try {
            const data = await getCart();
            dispatch(setCartItems(data.cart || []));
            dispatch(setCartError(null));
        } catch (requestError) {
            dispatch(setCartError(requestError.message || "Unable to load cart"));
        } finally {
            dispatch(setCartLoading(false));
        }
    }

    useEffect(() => {
        refreshCart();
    }, []);

    async function handleQuantityChange(productId, newQuantity) {
        if (newQuantity < 1) return;
        try {
            await updateCartQuantity(productId, newQuantity);
            await refreshCart();
        } catch (requestError) {
            dispatch(setCartError(requestError.message || "Unable to update quantity"));
        }
    }

    async function handleRemove(productId){
        try {
            await removeFromCart(productId);
            await refreshCart();
        } catch (requestError) {
            dispatch(setCartError(requestError.message || "Unable to remove item"));
        }
    }

    const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
    );

    if(loading){
        return (
            <main className="catalog-page">
                <Navbar/>
                <p className="catalog-message">Loading your cart...</p>
            </main>
        )
    }

    if(error){
        return (
            <main className="catalog-page">
                <Navbar />
                <p className="catalog-message error">{error}</p>
                <button className="button" type="button" onClick={refreshCart}>
                    Try Again
                </button>
            </main>
        )
    }

    if (!cartItems.length) {
        return (
            <main className="catalog-page">
                <Navbar />
                <section className="wishlist-empty">
                    <p className="empty-heart">🛒</p>
                    <h1>Your cart is empty</h1>
                    <p>Looks like you haven't added anything yet.</p>
                    <Link className="button" to="/products">
                        Browse Products
                    </Link>
                </section>
            </main>
        )
    }

    return (
        <main className="catalog-page">
            <Navbar />

            <header className="catalog-header">
                <div>
                    <p className="eyebrow">SHOPKART / MY CART</p>
                    <h1>My <em>cart.</em></h1>
                </div>
            </header>

            <section className="cart-layout">
                <div className="cart-items">
                    {cartItems.map((item) => (
                        <article className="cart-item" key={item.product?._id}>
                            <img src={item.product?.image} alt={item.product?.name} />

                            <div className="cart-item-info">
                                <h3>{item.product?.name}</h3>
                                <p>₹{(item.product?.price || 0).toLocaleString("en-IN")}</p>

                                <div className="quantity-box">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleQuantityChange(item.product?._id, item.quantity - 1)
                                        }
                                    >
                                        -
                                    </button>

                                    <span>{item.quantity}</span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleQuantityChange(item.product?._id, item.quantity + 1)
                                        }
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    className="button wishlist-remove"
                                    onClick={() => handleRemove(item.product?._id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </article>
                    ))}
                </div>

                <aside className="cart-summary">
                    <h2>Order Summary</h2>
                    <p>Items: {cartItems.reduce((total, item) => total + item.quantity, 0)}</p>
                    <p>Subtotal: ₹{subtotal.toLocaleString("en-IN")}</p>
                    <button className="button" type="button">
                        Proceed to Checkout
                    </button>
                </aside>
            </section>
        </main>
    )
}
export default Cart