import { Navigate, Outlet } from "react-router-dom"

function getAdmin() {
  try {
    return JSON.parse(localStorage.getItem("adminUser") || "null")
  } catch {
    return null
  }
}

export default function AdminRoute() {
  const admin = getAdmin()
  const token = localStorage.getItem("adminToken")

  if (!token || !admin) {
    return <Navigate to="/login" replace />
  }

  if (admin.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}