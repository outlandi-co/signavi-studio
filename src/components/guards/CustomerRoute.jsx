import { Navigate, useLocation } from "react-router-dom"

export default function CustomerRoute({ children }) {

  const location = useLocation()

  /* 🔐 GET SESSION */
  const token = localStorage.getItem("token")

  let user = null

  try {
    user = JSON.parse(localStorage.getItem("user") || "null")
  } catch (err) {
    console.error("❌ USER PARSE ERROR:", err)
    user = null
  }

  /* ================= NOT LOGGED IN ================= */
  if (!token || !user) {
    return (
      <Navigate
        to="/customer-login"
        state={{ from: location }}
        replace
      />
    )
  }

  /* ================= WRONG ROLE ================= */
  if (user.role !== "customer") {
    console.warn("⚠️ NON-CUSTOMER ACCESS BLOCKED:", user)

    return <Navigate to="/" replace />
  }

  /* ================= AUTHORIZED ================= */
  return children
}