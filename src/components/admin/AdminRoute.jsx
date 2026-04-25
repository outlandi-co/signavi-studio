import { Navigate, Outlet } from "react-router-dom"

export default function AdminRoute() {

  let adminUser = null
  let adminToken = null

  try {
    adminUser = JSON.parse(localStorage.getItem("adminUser") || "null")
    adminToken = localStorage.getItem("adminToken")
  } catch (err) {
    console.warn("⚠️ Failed to parse adminUser:", err)
  }

  /* 🔥 SAFE DEBUG (won’t spam infinitely) */
  if (import.meta.env.DEV) {
    console.log("🔐 AdminRoute Check:", {
      adminUser,
      adminToken
    })
  }

  /* 🚫 NOT LOGGED IN */
  if (!adminUser || !adminToken) {
    console.warn("🚫 Admin blocked → redirecting to login")
    return <Navigate to="/login" replace />
  }

  /* 🚫 NOT ADMIN */
  if (adminUser.role !== "admin") {
    console.warn("🚫 Not admin → redirecting home")
    return <Navigate to="/" replace />
  }

  /* ✅ ALLOW ACCESS */
  return <Outlet />
}