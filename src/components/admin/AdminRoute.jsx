import { Navigate, Outlet } from "react-router-dom"

export default function AdminRoute() {

  let adminUser = null

  try {
    adminUser = JSON.parse(localStorage.getItem("adminUser"))
  } catch (err) {
    console.warn("⚠️ Failed to parse adminUser:", err)
  }

  const adminToken = localStorage.getItem("adminToken")

  console.log("🔐 AdminRoute Check:", {
    adminUser,
    adminToken
  })

  /* 🔥 STRICT CHECK */
  if (!adminUser || !adminToken || adminUser.role !== "admin") {
    console.warn("🚫 Admin blocked → redirecting to login")
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}