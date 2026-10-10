import axios from "axios"

const api=axios.create({baseURL: import.meta.env.VITE_API_URL || "/",withCredentials:true})

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
export function addToWishlist(productId){return request(`/wishlist/${productId}`,{method:"POST"})}
export function getWishlist(){return request ("/wishlist")}
export function removeFromWishlist(productId){return request(`/wishlist/${productId}`,{method:"DELETE"})}
export function getCart(){return request("/cart")}
export function addToCart(productId){
  return request(`/cart/${productId}`,{method:"POST"})
}
export function updateCartQuantity(productId,quantity){
  return request(`/cart/${productId}`,{
    method:"PATCH",
    data:{quantity},
  })
}
export function removeFromCart(productId){
  return request(`/cart/${productId}`,{method:"DELETE"})
}
export function createPaymentOrder(shippingAddress) {
  return request("/orders/create-payment-order", {
    method: "POST",
    data: { shippingAddress },
  });
}
export function verifyPayment(paymentData) {
  return request("/orders/verify-payment", {
    method: "POST",
    data: paymentData,
  });
}
export function getMyOrders() {
  return request("/orders");
}
export function getOrder(id) {
  return request(`/orders/${id}`);
}