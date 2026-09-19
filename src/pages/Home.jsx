import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile,logoutCustomer } from "../services/api";

function Home(){
    const[customer,setCustomer]=useState(null)
    const [error,setError]=useState("")
    const [loading,setLoading]=useState(true)
    const [loggingOut,setLoggingOut]=useState(false)
    const navigate=useNavigate()

    useEffect(()=>{
        async function loadProfile(){
            try{
                const profile=await getMyProfile()
                setCustomer(profile)
            }catch(requestError){
                setError("Please log in to Continue")
                navigate("/login",{replace:true})
            }finally{setLoading(false)}
        }
        loadProfile()
    },[navigate])
    
    async function handleLogout(){
        setLoggingOut(true)
        try{
            await logoutCustomer()
            navigate("/login",{replace:true})
        }catch (requestError){
            setError("Logout failed. Please try again.")
            setLoggingOut(false)
        }
    }
    if(loading){return <p>Loading Profile...</p>}
    if(!customer){return <p>{error||"Unable to load profile"}</p>}
    
    return(
        <main className="account-page">
      <nav className="account-nav">
        <strong className="account-brand">ShopKart<span>.</span></strong>
        <div className="account-actions">
          <button className="text-link button-link" type="button" onClick={() => navigate("/products")}>Browse products</button>
          <button className="logout-link" type="button" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </nav>

      <section className="account-content">
        <p className="eyebrow">SHOPKART / YOUR ACCOUNT</p>
        <h1>Welcome, <em>{customer.fullName}</em></h1>
        <p className="account-lede">Your account is ready. Continue exploring the catalogue whenever you are.</p>
        <button className="button account-cta" type="button" onClick={() => navigate("/products")}>Browse products <span aria-hidden="true">→</span></button>

        <dl className="account-details">
          <div><dt>Full Name</dt><dd>{customer.fullName}</dd></div>
          <div><dt>Email</dt><dd>{customer.email}</dd></div>
          <div><dt>Phone Number</dt><dd>{customer.phone}</dd></div>
        </dl>

        {error && <p>{error}</p>}
      </section>
    </main>
    )
}

export default Home;