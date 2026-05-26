import { Navigate } from "react-router-dom"

export default function ProtectedRoute({
  children,
  roleRequired
}) {
  let adminUser = null
  let customerUser = null

  let adminToken = null
  let customerToken = null

  try {
    adminUser = JSON.parse(
      localStorage.getItem("adminUser") || "null"
    )

    customerUser = JSON.parse(
      localStorage.getItem("customerUser") || "null"
    )

    adminToken =
      localStorage.getItem("adminToken")

    customerToken =
      localStorage.getItem("customerToken")
  } catch (err) {
    console.error(
      "❌ PROTECTED ROUTE PARSE ERROR:",
      err
    )

    adminUser = null
    customerUser = null
  }

  const user =
    adminUser ||
    customerUser

  const token =
    adminToken ||
    customerToken

  /* ================= NOT LOGGED IN ================= */

  if (!user || !token) {
    console.warn(
      "🚫 USER NOT AUTHENTICATED"
    )

    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  /* ================= ROLE CHECK ================= */

  if (
    roleRequired &&
    user.role !== roleRequired
  ) {
    console.warn(
      "🚫 ROLE BLOCKED:",
      {
        required: roleRequired,
        actual: user.role
      }
    )

    if (user.role === "admin") {
      return (
        <Navigate
          to="/admin"
          replace
        />
      )
    }

    return (
      <Navigate
        to="/customer"
        replace
      />
    )
  }

  /* ================= SUCCESS ================= */

  return children
}