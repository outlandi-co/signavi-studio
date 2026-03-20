import { Navigate } from "react-router-dom"

function ProtectedRoute({ children }) {

  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role")

  if (!token || role !== "admin") {
    return <Navigate to="/login" />
  }

  return children
}

export default ProtectedRoute