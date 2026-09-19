import React,{useEffect,useState} from "react"
import {Link,useParams} from "react-router-dom"
import {getProduct} from "../services/api"

function ProductDetails(){
    const {id}=useParams()
    const [product,setProduct]=useState(null)
    const [loading,setLoading]=useState(true)
    const [error,setError]=useState("")

    useEffect(()=>{
        async function loadProduct(){
            try{
                const data=await getProduct(id)
                setProduct(data.product)
            }catch(requestError){
                setError(requestError.message||"Something went wrong while loading the product.")
            }finally{setLoading(false)}
        }
        loadProduct()
    },[id])

    if(loading)return <main className="catalog-page"><p className="catalog-message">Loading product...</p></main>
    if(error)return <main className="catalog-page"><p className="catalog-message error">{error}</p><Link className="text-link" to="/products">Back to products</Link></main>

    return <main className="catalog-page">
        <Link className="text-link" to="/products">← Back to products</Link>
        <section className="product-detail">
            <img src={product.image} alt={product.name} />
            <div>
                <p className="product-category">{product.category}</p>
                <h1>{product.name}</h1>
                <p className="product-description">{product.description}</p>
                <p className="product-price">₹{product.price.toLocaleString("en-IN")}</p>
                <p className={product.stock>0?"stock":"stock out-of-stock"}>{product.stock>0?`${product.stock} units left`:"Out of stock"}</p>
                <button className="button" type="button" disabled={!product.stock}>Add to cart <span aria-hidden="true">+</span></button>
            </div>
        </section>
    </main>
}

export default ProductDetails
