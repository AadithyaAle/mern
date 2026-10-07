import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMyOrders } from "../services/api";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadOrders() {
        setLoading(true);
        setError("");

        try {
            const data = await getMyOrders();
            setOrders(data.orders || []);
        } catch (requestError) {
            setError(requestError.message || "Unable to load your orders.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);
    return (
        <main className="catalog-page">
            <Navbar />

            <header className="catalog-header">
                <div>
                    <p className="eyebrow">SHOPKART / PURCHASE HISTORY</p>
                    <h1>My <em>orders.</em></h1>
                </div>
            </header>

            {loading && <p className="catalog-message">Loading your orders...</p>}

            {!loading && error && (
                <>
                    <p className="catalog-message error">{error}</p>
                    <button className="button" type="button" onClick={loadOrders}>
                        Try again
                    </button>
                </>
            )}

            {!loading && !error && orders.length === 0 && (
                <section className="wishlist-empty">
                    <h2>You have not placed any orders yet.</h2>
                    <Link className="button" to="/products">Start Shopping</Link>
                </section>
            )}

            {!loading && !error && orders.length > 0 && (
                <section className="order-list">
                    {orders.map((order) => (
                        <article className="cart-summary" key={order._id}>
                            <h2>Order #{order._id}</h2>
                            <p>
                                {new Date(order.createdAt).toLocaleDateString("en-IN")}
                            </p>

                            {order.items.map((item) => (
                                <p key={item._id || `${order._id}-${item.product}`}>
                                    {item.name} × {item.quantity}
                                </p>
                            ))}

                            <p>
                                Total: ₹{order.totalAmount.toLocaleString("en-IN")}
                            </p>
                            <p>Status: {order.status}</p>
                            <p>Payment: {order.paymentStatus}</p>

                            <Link className="button" to={`/order-success/${order._id}`}>
                                View Details
                            </Link>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}

export default Orders;