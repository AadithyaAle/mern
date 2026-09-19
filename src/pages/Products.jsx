import React,{useEffect,useState} from "react"
import {Link} from "react-router-dom"
import {getProducts} from "../services/api"

const categories=["All Categories","Electronics","Fashion","Books","Home"]

function Products(){
    const [products,setProducts]=useState([])
    const [search,setSearch]=useState("")
    const [category,setCategory]=useState("All Categories")
    const [loading,setLoading]=useState(true)
    const [error,setError]=useState("")

    useEffect(()=>{
        const timer=setTimeout(async()=>{
            setLoading(true)
            setError("")
            try{
                const params={}
                if(search.trim())params.search=search.trim()
                if(category!=="All Categories")params.category=category
                const data=await getProducts(params)
                setProducts(data.products||[])
            }catch(requestError){
                setError("Something went wrong while loading products.")
            }finally{setLoading(false)}
        },250)
        return()=>clearTimeout(timer)
    },[search,category])

    return <main className="catalog-page">
        <header className="catalog-header">
            <div>
                <p className="eyebrow">SHOPKART / DISCOVER</p>
                <h1>Find your next <em>favourite.</em></h1>
            </div>
            <Link className="account-icon-link" to="/home" aria-label="Open account" title="Account">
                <img src="https://cdn-icons-png.flaticon.com/512/8345/8345328.png" alt="" />
            </Link>
        </header>
        <section className="catalog-controls" aria-label="Product filters">
            <input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search products..." aria-label="Search products" />
            <select value={category} onChange={event=>setCategory(event.target.value)} aria-label="Filter by category">
                {categories.map(item=><option key={item}>{item}</option>)}
            </select>
        </section>
        {loading&&<p className="catalog-message">Loading products...</p>}
        {!loading&&error&&<p className="catalog-message error">{error}</p>}
        {!loading&&!error&&!products.length&&<p className="catalog-message">No products found.</p>}
        {!loading&&!error&&products.length>0&&<section className="product-grid">
            {products.map(product=><article className="product-card" key={product._id}>
                <img src={product.image} alt={product.name} />
                <div className="product-card-content">
                    <p className="product-category">{product.category}</p>
                    <h2>{product.name}</h2>
                    <p className="product-price">₹{product.price.toLocaleString("en-IN")}</p>
                    <p className={product.stock>0?"stock":"stock out-of-stock"}>{product.stock>0?`${product.stock} units left`:"Out of stock"}</p>
                    <Link className="button" to={`/products/${product._id}`}>View details <span aria-hidden="true">→</span></Link>
                </div>
            </article>)}
        </section>}
    </main>
}

export default Products
