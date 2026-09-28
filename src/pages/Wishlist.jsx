import React,{useEffect,useState} from "react";
import {Link}from "react-router-dom"
import { getWishlist, removeFromWishlist } from "../services/api";
import Navbar from "../components/Navbar";

function Wishlist(){
    const [products,setProducts]=useState([])
    const [loading,setLoading]=useState(true)
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState("");

    async function loadWishlist(){
        setLoading(true)
        setError("")
        try {
            const data = await getWishlist()
            setProducts(data.wishlist || [])
        } catch (requestError) {
            setError(requestError.message || "Unable to load wishlist.")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        loadWishlist()
    }, []);
    async function handleRemove(productId) {
        setRemovingId(productId);
        try {
            await removeFromWishlist(productId)
            setProducts((currentProducts) =>
                currentProducts.filter(
                    (product) => product._id !== productId
                )
            )
        } catch (requestError) {
            setError(requestError.message || "Unable to remove product.")
        } finally {
            setRemovingId("")
        }
    }
    if (loading) {
        return (
            <main className="catalog-page">
                <Navbar />
                <p className="catalog-message">
                    Loading your wishlist...
                </p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="catalog-page">
                <Navbar />
                <p className="catalog-message error">
                    {error}
                </p>
                <button
                    className="button"
                    type="button"
                    onClick={loadWishlist}
                >
                    Try again
                </button>
            </main>
        );
    }
    if(products.length === 0) {
        return (
            <main className="catalog-page">
                <Navbar />
                <section className="wishlist-empty">
                    <p className="empty-heart">♥</p>
                    <h1>Your wishlist is empty</h1>
                    <p>Save products you love and find them here later.</p>
                    <Link className="button" to="/products">
                        Browse products
                    </Link>
                </section>
            </main>
        );
    }
    return (
        <main className="catalog-page">
            <Navbar />
            <header className="catalog-header">
                <div>
                    <p className="eyebrow">
                        SHOPKART / SAVED ITEMS
                    </p>

                    <h1>
                        My <em>wishlist.</em>
                    </h1>

                    <p className="wishlist-count">
                        {products.length} products saved
                    </p>
                </div>
            </header>
            <section className="product-grid">
                {products.map((product) => (
                    <article
                        className="product-card"
                        key={product._id}
                    >
                        <img
                            src={product.image}
                            alt={product.name}
                        />

                        <div className="product-card-content">
                            <p className="product-category">
                                {product.category}
                            </p>

                            <h2>{product.name}</h2>

                            <p className="product-price">
                                ₹
                                {product.price.toLocaleString(
                                    "en-IN"
                                )}
                            </p>

                            <p
                                className={
                                    product.stock > 0
                                        ? "stock"
                                        : "stock out-of-stock"
                                }
                            >
                                {product.stock > 0
                                    ? `${product.stock} units left`
                                    : "Out of stock"}
                            </p>

                            <Link
                                className="button"
                                to={`/products/${product._id}`}
                            >
                                View details
                            </Link>

                            <button
                                className="button wishlist-remove"
                                type="button"
                                disabled={
                                    removingId === product._id
                                }
                                onClick={() =>
                                    handleRemove(product._id)
                                }
                            >
                                {removingId === product._id
                                    ? "Removing..."
                                    : "Remove from wishlist"}
                            </button>
                        </div>
                    </article>
                ))}
            </section>
        </main>
    );
}

export default Wishlist;
