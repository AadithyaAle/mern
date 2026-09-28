import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutCustomer } from "../services/api";

function Navbar() {
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logoutCustomer();
            navigate("/login");
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <nav className="site-nav">
            <Link className="site-brand" to="/products">
                Shop<span>Kart</span>
            </Link>

            <div className="site-nav-links">
                <Link to="/products">Products</Link>

                <Link to="/wishlist">Wishlist</Link>

                <button
                    type="button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
export default Navbar;