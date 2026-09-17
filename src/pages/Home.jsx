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
        <main>
      <nav>
        <strong>ShopKart</strong>

        <button type="button" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </nav>

      <section>
        <h1>Welcome, {customer.fullName}</h1>
        <p>Here are your account details.</p>

        <dl>
          <dt>Full Name</dt>
          <dd>{customer.fullName}</dd>

          <dt>Email</dt>
          <dd>{customer.email}</dd>

          <dt>Phone Number</dt>
          <dd>{customer.phone}</dd>
        </dl>

        {error && <p>{error}</p>}
      </section>
    </main>
    )
}

export default Home;