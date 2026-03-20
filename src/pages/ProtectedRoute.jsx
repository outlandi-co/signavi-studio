import { Navigate } from "react-router-dom"

function ProtectedRoute({ children, roleRequired }) {
  const token = localStorage.getItem("token")

  const user = JSON.parse(localStorage.getItem("user") || "null")

  if (!token) {
    return <Navigate to="/login" />
  }

  if (roleRequired && user?.role !== roleRequired) {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedRoute