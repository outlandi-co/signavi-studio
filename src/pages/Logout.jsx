import { useNavigate } from "react-router-dom"

export default function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    localStorage.removeItem("customerToken")
    localStorage.removeItem("customerUser")

    navigate("/")
  }

  return <button onClick={handleLogout}>Logout</button>
}