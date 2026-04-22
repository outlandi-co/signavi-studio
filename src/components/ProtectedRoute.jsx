import { Navigate } from "react-router-dom"

/* 🔐 Safe JSON Parse */
const safeParse = (data) => {
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

function ProtectedRoute({ children, roles = [] }) {
  /* 🔥 SUPPORT MULTIPLE AUTH TYPES */
  const adminToken = localStorage.getItem("adminToken")
  const adminUser = safeParse(localStorage.getItem("adminUser"))

  const customerToken = localStorage.getItem("customerToken")
  const customerUser = safeParse(localStorage.getItem("customerUser"))

  /* 🔥 DETERMINE ACTIVE USER */
  const token = adminToken || customerToken
  const user = adminUser || customerUser

  /* 🚫 NOT LOGGED IN */
  if (!token) {
    return <Navigate to="/login" />
  }

  /* 🚫 ROLE CHECK */
  if (roles.length && !roles.includes(user?.role)) {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedRoute