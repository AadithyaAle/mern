import axios from "axios"

const api=axios.create({baseURL:"/",withCredentials:true})

async function request(path,options={}){
  try{
    const response=await api({url:path,...options})
    return response.data
  }catch(error){
    throw new Error(error.response?.data?.message||"Request failed")
  }
}
export function registerCustomer(customerData){
    return request('/customers/register',{method:'POST',data:customerData})
}
export function loginCustomer(credentials){
  return request("/customers/login",{method:"POST",data:credentials})
}
export function getMyProfile(){return request("/customers/me")}
export function logoutCustomer(){return request("/customers/logout",{method:"POST"})}
export function getProducts(params={}){return request("/products",{params})}
export function getProduct(id){return request(`/products/${id}`)}