import { Navigate, useLocation } from "react-router-dom"

export default function CustomerRoute({ children }) {

  const location = useLocation()

  /* 🔥 CUSTOMER-ONLY STORAGE */
  const token = localStorage.getItem("customerToken")

  let customer = null

  try {
    customer = JSON.parse(localStorage.getItem("customerUser") || "null")
  } catch (err) {
    console.error("❌ CUSTOMER PARSE ERROR:", err)
    customer = null
  }

  /* ================= NOT LOGGED IN ================= */
  if (!token || !customer) {
    return (
      <Navigate
        to="/customer-login"
        state={{ from: location }}
        replace
      />
    )
  }

  /* ================= WRONG ROLE ================= */
  if (customer.role !== "customer") {
    console.warn("⚠️ NON-CUSTOMER ACCESS BLOCKED:", customer)

    return <Navigate to="/" replace />
  }

  /* ================= AUTHORIZED ================= */
  return children
}