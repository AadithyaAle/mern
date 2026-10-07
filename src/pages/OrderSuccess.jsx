import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrder } from "../services/api";

function OrderSuccess() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadOrder() {
            try {
                const data = await getOrder(id);
                setOrder(data.order);
            } catch (requestError) {
                setError(requestError.message || "Unable to load order details.");
            } finally {
                setLoading(false);
            }
        }

        loadOrder();
    }, [id]);

    if (loading) {
        return (
            <main className="catalog-page">
                <Navbar />
                <p className="catalog-message">Loading order...</p>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="catalog-page">
                <Navbar />
                <p className="catalog-message error">
                    {error || "Order not found."}
                </p>
                <Link className="button" to="/orders">View My Orders</Link>
            </main>
        );
    }
    return (
        <main className="catalog-page">
            <Navbar />
            <section className="wishlist-empty">
                <p className="empty-heart" aria-hidden="true">✓</p>
                <h1>Order Placed Successfully</h1>
                <p>Order ID: {order._id}</p>
                <p>Total: ₹{order.totalAmount.toLocaleString("en-IN")}</p>
                <p>Status: {order.status}</p>

                <div className="account-actions">
                    <Link className="button" to="/orders">View My Orders</Link>
                    <Link className="button secondary" to="/products">
                        Continue Shopping
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default OrderSuccess;