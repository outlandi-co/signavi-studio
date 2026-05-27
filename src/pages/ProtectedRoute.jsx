import { Navigate, useLocation } from "react-router-dom"

export default function ProtectedRoute({
  children,
  roleRequired
}) {
  const location = useLocation()

  const token =
    localStorage.getItem("adminToken") ||
    localStorage.getItem("customerToken") ||
    localStorage.getItem("token")

  const rawUser =
    localStorage.getItem("adminUser") ||
    localStorage.getItem("customerUser") ||
    localStorage.getItem("user")

  let user = null

  try {
    user = rawUser
      ? JSON.parse(rawUser)
      : null
  } catch (err) {
    console.error(
      "❌ USER PARSE ERROR:",
      err
    )

    user = null
  }

  /* ================= NOT LOGGED IN ================= */

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname
        }}
      />
    )
  }

  /* ================= ROLE CHECK ================= */

  if (
    roleRequired &&
    user?.role !== roleRequired
  ) {
    console.warn(
      `⛔ Access denied. Required: ${roleRequired}, Actual: ${user?.role}`
    )

    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  return children
}