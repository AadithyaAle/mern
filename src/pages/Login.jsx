import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginCustomer } from "../services/api";

function Login(){
    const [form,setForm]=useState({email:"",password:""})
    const [error,setError]=useState("")
    const [loading,setLoading]=useState(false)
    const navigate=useNavigate()
    function handleChange(event){
        const{name,value}=event.target
        setForm({...form,[name]:value,})
    }
    async function handleSubmit(event){
        event.preventDefault();
        setError("")
        if(!form.email||!form.password){
            setError("Email and Password are Required")
            return
        }
        setLoading(true)
        try {
            await loginCustomer(form)
          navigate("/home")
        }catch (requesError){setError("Invalid Credentials")}
        finally{setLoading(false)}
    }
    return(
        <main className="shell">
      <section className="intro">
        <div className="mark">SK</div>

        <div>
          <p className="eyebrow">SHOPKART / CUSTOMER ACCESS</p>
          <h1>
            Welcome
            <br />
            <em>back.</em>
          </h1>
          <p className="lede">
            Sign in to view your account and continue shopping.
          </p>
        </div>

        <p className="signal">
          <span className="signal-dot" />
          SECURE CUSTOMER PORTAL
        </p>
      </section>
      <section className="panel">
        <p className="eyebrow">01 / SIGN IN</p>
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">
            Email address
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </label>

          <label htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </label>
          {error && <p className="notice error">{error}</p>}

          <button className="button" type="submit" disabled={loading}>
            <span>{loading ? "Signing in..." : "Sign in"}</span>
            <span aria-hidden="true">→</span>
          </button>

          <button
            className="button secondary"
            type="button"
            onClick={() => navigate("/register")}
          >
            Create a new account
          </button>
        </form>
      </section>
    </main>
    )
}
export default Login;