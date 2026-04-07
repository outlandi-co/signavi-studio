import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children, roleRequired }) {

  let admin = null

  try {
    admin = JSON.parse(localStorage.getItem("adminUser") || "null")
  } catch (err) {
    console.error("❌ ADMIN PARSE ERROR:", err)
    admin = null
  }

  /* 🔐 NOT LOGGED IN */
  if (!admin) {
    return <Navigate to="/login" replace />
  }

  /* 🔐 ROLE CHECK */
  if (roleRequired && admin.role !== roleRequired) {
    console.warn("⚠️ BLOCKED ROLE:", admin.role)
    return <Navigate to="/" replace />
  }

  return children
}