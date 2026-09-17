const CUSTOMER_API='/customers'

async function request(path,options={}){
    const response = await fetch(`${CUSTOMER_API}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const data=await response.json();
  if (!response.ok){
    throw new Error(data.message||'Request faild')
  }
  return data
}
export function registerCustomer(customerData){
    return request('/register',{
        method:'POST',body:JSON.stringify(customerData),
    })
}
export function loginCustomer(credentials){
  return request("/login",{
    method: "POST",
    body: JSON.stringify(credentials),
  })
}
export function getMyProfile(){return request("/me")}
export function logoutCustomer(){return request("/logout",{method:"POST"})}