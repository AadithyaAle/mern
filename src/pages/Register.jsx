import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerCustomer } from "../services/api";

const initialForm={fullName:'',email:'',password:'',phone:'',}

function Register(){
    const [form,setForm]=useState(initialForm)
    const [error,setError]=useState('')
    const [message,setMessage]=useState('')
    const [loading,setLoading]=useState(false)
    const navigate=useNavigate();

    function handledChange(event){
        setForm({
            ...form,[event.target.name]:event.target.value,
        })
    }
    async function handledSubmit(event){
        event.preventDefault()
        setError('')
        setMessage('')

        if(!form.fullName||!form.email||!form.password||!form.phone){
            setError("All field are required")
            return;
        }
        
        if(form.password.length<6){
            setError('password must contain atleast 6 characters')
            return
        }
        setLoading(true);

        try {
        await registerCustomer(form);
        setMessage('Registration successful');
        setForm(initialForm);

        setTimeout(() => {
            navigate('/login');
        }, 1000);
        } catch (requestError) {
        setError(requestError.message);
        } finally {
        setLoading(false);
        }
    }
    return(
        <form onSubmit={handledSubmit}>
        {error && <p>{error}</p>}
        {message && <p>{message}</p>}
            <label htmlFor="fullName">Full Name</label>
            <input 
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handledChange}
            />
            <label htmlFor="email">Email</label>
            <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handledChange}
            />

            <label htmlFor="password">Password</label>
            <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handledChange}
            />

            <label htmlFor="phone">Phone Number</label>
            <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handledChange}
            />
            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
            </button>
        </form>
        
    )
}


export default Register;