import { Navigate, Outlet } from "react-router-dom"

export default function CustomerRoute() {

  let customerUser = null

  try {
    customerUser = JSON.parse(localStorage.getItem("customerUser"))
  } catch (err) {
    console.warn("⚠️ Failed to parse customerUser:", err)
  }

  const customerToken = localStorage.getItem("customerToken")

  console.log("👤 CustomerRoute Check:", {
    customerUser,
    customerToken
  })

  if (!customerUser || !customerToken) {
    console.warn("🚫 Customer blocked → redirecting to login")
    return <Navigate to="/customer-login" replace />
  }

  return <Outlet />
}